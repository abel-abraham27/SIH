from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    User, UserRole, Opportunity, OpportunitySkill, StudentProfile,
    OpportunityStatus, StudentSkill,
)
from app.schemas.schemas import (
    OpportunityCreate, OpportunityOut, OpportunityMatchOut,
    OpportunitySkillOut,
)
from app.core.deps import get_current_user, require_role
from app.services.matching import compute_match_score

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


@router.get("/", response_model=list[OpportunityOut])
def list_opportunities(
    opportunity_type: str | None = None,
    work_mode: str | None = None,
    search: str | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
    )

    if status:
        query = query.filter(Opportunity.status == status)
    else:
        query = query.filter(Opportunity.status == OpportunityStatus.ACTIVE)

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)
    if work_mode:
        query = query.filter(Opportunity.work_mode == work_mode)
    if search:
        query = query.filter(
            Opportunity.title.ilike(f"%{search}%")
            | Opportunity.company_name.ilike(f"%{search}%")
        )

    opps = query.order_by(Opportunity.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for opp in opps:
        out = OpportunityOut.model_validate(opp)
        out.application_count = len(opp.applications)
        results.append(out)
    return results


@router.get("/matched")
def get_matched_opportunities(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Get opportunities with match scores for current student."""
    profile = (
        db.query(StudentProfile)
        .options(joinedload(StudentProfile.skills).joinedload(StudentSkill.skill))
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        return []

    opps = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
        .filter(Opportunity.status == OpportunityStatus.ACTIVE)
        .all()
    )

    results = []
    for opp in opps:
        match_data = compute_match_score(db, profile, opp)
        result = {
            **OpportunityOut.model_validate(opp).model_dump(),
            "match_score": match_data["match_score"],
            "breakdown": match_data["breakdown"],
            "matched_skills": match_data["matched_skills"],
            "skill_gaps": match_data["skill_gaps"],
        }
        result["application_count"] = len(opp.applications)
        results.append(result)

    # Sort by match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


@router.get("/{opportunity_id}")
def get_opportunity(
    opportunity_id: str,
    current_user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    opp = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
        .filter(Opportunity.id == opportunity_id)
        .first()
    )
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    result = OpportunityOut.model_validate(opp).model_dump()
    result["application_count"] = len(opp.applications)

    # Add match score if student
    if current_user and current_user.role == UserRole.STUDENT:
        profile = (
            db.query(StudentProfile)
            .options(joinedload(StudentProfile.skills).joinedload(StudentSkill.skill))
            .filter(StudentProfile.user_id == current_user.id)
            .first()
        )
        if profile:
            match_data = compute_match_score(db, profile, opp)
            result.update({
                "match_score": match_data["match_score"],
                "breakdown": match_data["breakdown"],
                "matched_skills": match_data["matched_skills"],
                "skill_gaps": match_data["skill_gaps"],
                "formula": match_data["formula"],
            })

    return result


@router.post("/", response_model=OpportunityOut)
def create_opportunity(
    data: OpportunityCreate,
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    opp = Opportunity(
        recruiter_id=current_user.id,
        title=data.title,
        company_name=data.company_name,
        description=data.description,
        opportunity_type=data.opportunity_type,
        work_mode=data.work_mode,
        location=data.location,
        stipend=data.stipend,
        duration=data.duration,
        minimum_qualification=data.minimum_qualification,
        minimum_experience=data.minimum_experience,
        application_deadline=data.application_deadline,
    )
    db.add(opp)
    db.flush()

    for skill_data in data.required_skills:
        opp_skill = OpportunitySkill(
            opportunity_id=opp.id,
            skill_id=skill_data.skill_id,
            required_level=skill_data.required_level,
            weight=skill_data.weight,
        )
        db.add(opp_skill)

    db.commit()
    db.refresh(opp)

    # Reload with relationships
    opp = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
        .filter(Opportunity.id == opp.id)
        .first()
    )
    return OpportunityOut.model_validate(opp)


@router.put("/{opportunity_id}", response_model=OpportunityOut)
def update_opportunity(
    opportunity_id: str,
    data: OpportunityCreate,
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.recruiter_id == current_user.id,
    ).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    for key in ["title", "company_name", "description", "opportunity_type",
                "work_mode", "location", "stipend", "duration",
                "minimum_qualification", "minimum_experience", "application_deadline"]:
        setattr(opp, key, getattr(data, key))

    # Update required skills
    db.query(OpportunitySkill).filter(
        OpportunitySkill.opportunity_id == opp.id
    ).delete()
    for skill_data in data.required_skills:
        opp_skill = OpportunitySkill(
            opportunity_id=opp.id,
            skill_id=skill_data.skill_id,
            required_level=skill_data.required_level,
            weight=skill_data.weight,
        )
        db.add(opp_skill)

    db.commit()
    db.refresh(opp)
    return OpportunityOut.model_validate(opp)


@router.delete("/{opportunity_id}")
def delete_opportunity(
    opportunity_id: str,
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.recruiter_id == current_user.id,
    ).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found or not yours")
    # Delete related applications first to avoid FK constraint errors
    from app.models import Application
    db.query(Application).filter(Application.opportunity_id == opp.id).delete()
    db.delete(opp)
    db.commit()
    return {"ok": True}

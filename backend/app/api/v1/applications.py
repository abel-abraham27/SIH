from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    User, UserRole, Application, Opportunity, StudentProfile,
    ApplicationStatus, OpportunitySkill, StudentSkill,
)
from app.schemas.schemas import (
    ApplicationCreate, ApplicationOut, ApplicationStatusUpdate,
)
from app.core.deps import get_current_user, require_role
from app.services.matching import compute_match_score

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationOut)
def apply(
    data: ApplicationCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .options(joinedload(StudentProfile.skills).joinedload(StudentSkill.skill))
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check if already applied
    existing = db.query(Application).filter(
        Application.opportunity_id == data.opportunity_id,
        Application.student_id == profile.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this opportunity")

    # Get opportunity
    opportunity = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
        .filter(Opportunity.id == data.opportunity_id)
        .first()
    )
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Calculate match score
    match_data = compute_match_score(db, profile, opportunity)

    application = Application(
        opportunity_id=data.opportunity_id,
        student_id=profile.id,
        cover_letter=data.cover_letter,
        resume_url=data.resume_url,
        match_score=match_data["match_score"],
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    app = (
        db.query(Application)
        .options(
            joinedload(Application.opportunity),
            joinedload(Application.student).joinedload(StudentProfile.user),
        )
        .filter(Application.id == application.id)
        .first()
    )
    return ApplicationOut.model_validate(app)


@router.get("/my", response_model=list[ApplicationOut])
def get_my_applications(
    status: str | None = None,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        return []

    query = (
        db.query(Application)
        .options(
            joinedload(Application.opportunity)
            .joinedload(Opportunity.required_skills)
            .joinedload(OpportunitySkill.skill),
        )
        .filter(Application.student_id == profile.id)
    )
    if status:
        query = query.filter(Application.status == status)

    apps = query.order_by(Application.applied_at.desc()).all()
    return [ApplicationOut.model_validate(a) for a in apps]


@router.get("/opportunity/{opportunity_id}")
def get_opportunity_applications(
    opportunity_id: str,
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    """Recruiter: get all applications for an opportunity with match details."""
    opp = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.recruiter_id == current_user.id,
    ).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    apps = (
        db.query(Application)
        .options(
            joinedload(Application.student)
            .joinedload(StudentProfile.user),
            joinedload(Application.student)
            .joinedload(StudentProfile.skills)
            .joinedload(StudentSkill.skill),
        )
        .filter(Application.opportunity_id == opportunity_id)
        .order_by(Application.match_score.desc())
        .all()
    )

    results = []
    for app in apps:
        result = {
            "id": app.id,
            "student_name": app.student.user.full_name if app.student and app.student.user else "",
            "student_email": app.student.user.email if app.student and app.student.user else "",
            "university": app.student.university if app.student else "",
            "department": app.student.department if app.student else "",
            "cgpa": app.student.cgpa if app.student else None,
            "match_score": app.match_score,
            "status": app.status.value,
            "cover_letter": app.cover_letter,
            "resume_url": app.resume_url,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "skills": [
                {
                    "name": ss.skill.name if ss.skill else "",
                    "level": ss.proficiency_level,
                }
                for ss in (app.student.skills if app.student else [])
            ],
        }
        results.append(result)

    return results


@router.patch("/{application_id}/status", response_model=ApplicationOut)
def update_application_status(
    application_id: str,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    app = (
        db.query(Application)
        .options(joinedload(Application.opportunity))
        .filter(Application.id == application_id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify recruiter owns the opportunity
    if app.opportunity.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your opportunity")

    app.status = data.status
    db.commit()
    db.refresh(app)
    return ApplicationOut.model_validate(app)


@router.patch("/{application_id}/withdraw")
def withdraw_application(
    application_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    app = db.query(Application).filter(
        Application.id == application_id,
        Application.student_id == profile.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = ApplicationStatus.WITHDRAWN
    db.commit()
    return {"ok": True}

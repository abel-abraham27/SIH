from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import User, UserRole, StudentProfile, StudentSkill, Skill
from app.schemas.schemas import (
    StudentProfileCreate, StudentProfileOut, StudentSkillCreate,
    StudentSkillOut, SkillGapOut, UserOut,
)
from app.core.deps import get_current_user, require_role
from app.services.skill_gap import calculate_skill_gaps, calculate_employability_score

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/profile", response_model=StudentProfileOut)
def get_my_profile(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .options(joinedload(StudentProfile.user))
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return StudentProfileOut.model_validate(profile)


@router.put("/profile", response_model=StudentProfileOut)
def update_profile(
    data: StudentProfileCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return StudentProfileOut.model_validate(profile)


@router.get("/skills", response_model=list[StudentSkillOut])
def get_my_skills(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        return []
    skills = (
        db.query(StudentSkill)
        .options(joinedload(StudentSkill.skill))
        .filter(StudentSkill.student_id == profile.id)
        .all()
    )
    return [StudentSkillOut.model_validate(s) for s in skills]


@router.post("/skills", response_model=StudentSkillOut)
def add_skill(
    data: StudentSkillCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check if skill already added
    existing = db.query(StudentSkill).filter(
        StudentSkill.student_id == profile.id,
        StudentSkill.skill_id == data.skill_id,
    ).first()
    if existing:
        existing.proficiency_level = data.proficiency_level
        existing.evidence_source = data.evidence_source
        db.commit()
        db.refresh(existing)
        return StudentSkillOut.model_validate(existing)

    skill = StudentSkill(
        student_id=profile.id,
        skill_id=data.skill_id,
        proficiency_level=data.proficiency_level,
        evidence_source=data.evidence_source,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    # Reload with relationship
    skill = (
        db.query(StudentSkill)
        .options(joinedload(StudentSkill.skill))
        .filter(StudentSkill.id == skill.id)
        .first()
    )
    return StudentSkillOut.model_validate(skill)


@router.put("/skills/{skill_id}", response_model=StudentSkillOut)
def update_skill_level(
    skill_id: str,
    data: StudentSkillCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    student_skill = db.query(StudentSkill).filter(
        StudentSkill.student_id == profile.id,
        StudentSkill.skill_id == skill_id,
    ).first()
    if not student_skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    student_skill.proficiency_level = data.proficiency_level
    if data.evidence_source:
        student_skill.evidence_source = data.evidence_source
    db.commit()
    db.refresh(student_skill)
    return StudentSkillOut.model_validate(student_skill)


@router.delete("/skills/{skill_id}")
def remove_skill(
    skill_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    student_skill = db.query(StudentSkill).filter(
        StudentSkill.student_id == profile.id,
        StudentSkill.skill_id == skill_id,
    ).first()
    if student_skill:
        db.delete(student_skill)
        db.commit()
    return {"ok": True}


@router.get("/skill-gaps", response_model=list[SkillGapOut])
def get_skill_gaps(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .options(
            joinedload(StudentProfile.skills).joinedload(StudentSkill.skill),
            joinedload(StudentProfile.assessment_attempts),
        )
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        return []

    # Recalculate gaps
    calculate_skill_gaps(db, profile)

    # Fetch fresh gaps
    from app.models import SkillGap
    gaps = (
        db.query(SkillGap)
        .options(joinedload(SkillGap.skill))
        .filter(SkillGap.student_id == profile.id)
        .all()
    )
    return [SkillGapOut.model_validate(g) for g in gaps]


@router.get("/employability")
def get_employability(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(StudentProfile)
        .options(
            joinedload(StudentProfile.skills),
            joinedload(StudentProfile.assessment_attempts),
        )
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        return {"score": 0, "breakdown": {}, "skill_completion": 0}

    return calculate_employability_score(profile)


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Get all dashboard data in one call."""
    from app.models import Application, SkillGap, AssessmentAttempt

    profile = (
        db.query(StudentProfile)
        .options(
            joinedload(StudentProfile.skills).joinedload(StudentSkill.skill),
            joinedload(StudentProfile.assessment_attempts),
            joinedload(StudentProfile.applications),
        )
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        return {
            "user": UserOut.model_validate(current_user).model_dump(),
            "employability": {"score": 0, "breakdown": {}, "skill_completion": 0},
            "skill_count": 0,
            "verified_skills": 0,
            "assessment_count": 0,
            "assessments_passed": 0,
            "application_count": 0,
            "active_pipelines": 0,
            "top_skills": [],
            "skill_gaps": [],
            "recent_applications": [],
        }

    employability = calculate_employability_score(profile)

    # Skills
    top_skills = sorted(profile.skills, key=lambda s: s.proficiency_level, reverse=True)[:8]
    verified_skills = sum(1 for s in profile.skills if s.verified)

    # Assessments
    completed_attempts = [a for a in profile.assessment_attempts if a.submitted_at]
    passed = sum(1 for a in completed_attempts if (a.score or 0) >= 50)

    # Applications
    app_count = len(profile.applications)
    active_pipelines = sum(
        1 for a in profile.applications
        if a.status.value in ("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW")
    )

    # Skill gaps
    gaps = db.query(SkillGap).options(joinedload(SkillGap.skill)).filter(
        SkillGap.student_id == profile.id
    ).order_by(SkillGap.priority).limit(6).all()

    recent_apps = sorted(profile.applications, key=lambda a: a.applied_at, reverse=True)[:5]

    return {
        "user": UserOut.model_validate(current_user).model_dump(),
        "profile": StudentProfileOut.model_validate(profile).model_dump(),
        "employability": employability,
        "skill_count": len(profile.skills),
        "verified_skills": verified_skills,
        "assessment_count": len(completed_attempts),
        "assessments_passed": passed,
        "application_count": app_count,
        "active_pipelines": active_pipelines,
        "top_skills": [
            {
                "id": s.id,
                "skill_name": s.skill.name if s.skill else "",
                "category": s.skill.category.name if s.skill and s.skill.category else "",
                "proficiency_level": s.proficiency_level,
                "verified": s.verified,
            }
            for s in top_skills
        ],
        "skill_gaps": [
            {
                "skill_name": g.skill.name if g.skill else "",
                "current_level": g.current_level,
                "target_level": g.target_level,
                "priority": g.priority.value,
            }
            for g in gaps
        ],
        "recent_applications": [
            {
                "id": a.id,
                "opportunity_title": a.opportunity.title if a.opportunity else "",
                "company_name": a.opportunity.company_name if a.opportunity else "",
                "status": a.status.value,
                "match_score": a.match_score,
                "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            }
            for a in recent_apps
        ],
    }

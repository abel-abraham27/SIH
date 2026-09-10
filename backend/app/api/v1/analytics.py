from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.models import (
    User, UserRole, StudentProfile, StudentSkill, Skill, SkillCategory,
    SkillGap, Application, AssessmentAttempt, Opportunity,
    ApplicationStatus,
)
from app.schemas.schemas import InstitutionAnalyticsOut
from app.core.deps import require_role

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/institution")
def get_institution_analytics(
    current_user: User = Depends(require_role(UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db),
):
    """Comprehensive institution analytics."""
    # Total students
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    active_students = db.query(User).filter(
        User.role == UserRole.STUDENT, User.is_active == True
    ).count()

    # Assessment completion
    total_attempts = db.query(AssessmentAttempt).count()
    completed_attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.submitted_at != None
    ).count()
    assessment_rate = round(completed_attempts / max(total_attempts, 1) * 100, 1)

    # Average skill score
    avg_skill = db.query(func.avg(StudentSkill.proficiency_level)).scalar() or 0
    avg_skill_score = round(float(avg_skill), 1)

    # Applications stats
    total_apps = db.query(Application).count()
    apps_with_internship = db.query(Application).join(Opportunity).filter(
        Opportunity.opportunity_type == "INTERNSHIP"
    ).count()
    internship_participation = round(apps_with_internship / max(active_students, 1) * 100, 1)

    selected_apps = db.query(Application).filter(
        Application.status == ApplicationStatus.SELECTED
    ).count()
    placement_rate = round(selected_apps / max(total_apps, 1) * 100, 1)

    # Most demanded skills (from opportunities)
    from app.models import OpportunitySkill
    skill_demand = (
        db.query(Skill.name, func.count(OpportunitySkill.id).label("count"))
        .join(OpportunitySkill, Skill.id == OpportunitySkill.skill_id)
        .group_by(Skill.name)
        .order_by(func.count(OpportunitySkill.id).desc())
        .limit(10)
        .all()
    )
    demanded = [{"name": s[0], "count": s[1]} for s in skill_demand]

    # Top skill gaps
    gap_data = (
        db.query(Skill.name, func.count(SkillGap.id).label("count"))
        .join(SkillGap, Skill.id == SkillGap.skill_id)
        .group_by(Skill.name)
        .order_by(func.count(SkillGap.id).desc())
        .limit(10)
        .all()
    )
    top_gaps = [{"name": g[0], "count": g[1]} for g in gap_data]

    # Skills distribution by category
    cat_dist = (
        db.query(SkillCategory.name, func.count(StudentSkill.id).label("count"))
        .join(Skill, SkillCategory.id == Skill.category_id)
        .join(StudentSkill, Skill.id == StudentSkill.skill_id)
        .group_by(SkillCategory.name)
        .all()
    )
    skills_distribution = [{"category": c[0], "count": c[1]} for c in cat_dist]

    # Department-wise gaps
    dept_gaps = (
        db.query(
            StudentProfile.department,
            func.count(SkillGap.id).label("gap_count"),
        )
        .join(SkillGap, StudentProfile.id == SkillGap.student_id)
        .filter(StudentProfile.department != None)
        .group_by(StudentProfile.department)
        .all()
    )
    department_data = [{"department": d[0] or "Unknown", "gaps": d[1]} for d in dept_gaps]

    # Application outcomes
    outcome_data = (
        db.query(Application.status, func.count(Application.id))
        .group_by(Application.status)
        .all()
    )
    outcomes = [{"status": o[0].value, "count": o[1]} for o in outcome_data]

    return {
        "total_students": total_students,
        "active_students": active_students,
        "assessment_completion_rate": assessment_rate,
        "average_skill_score": avg_skill_score,
        "internship_participation": internship_participation,
        "placement_conversion_rate": placement_rate,
        "most_demanded_skills": demanded,
        "top_skill_gaps": top_gaps,
        "skills_distribution": skills_distribution,
        "department_wise_gaps": department_data,
        "application_outcomes": outcomes,
    }

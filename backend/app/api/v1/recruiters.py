from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    User, UserRole, Opportunity, Application, StudentProfile,
    StudentSkill, OpportunitySkill, OpportunityStatus,
)
from app.schemas.schemas import OpportunityOut
from app.core.deps import get_current_user, require_role
from app.services.matching import compute_match_score

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])


@router.get("/dashboard")
def get_recruiter_dashboard(
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    """Get recruiter dashboard data."""
    opps = db.query(Opportunity).filter(
        Opportunity.recruiter_id == current_user.id
    ).all()

    active_opps = [o for o in opps if o.status == OpportunityStatus.ACTIVE]

    # Get all applications
    opp_ids = [o.id for o in opps]
    apps = (
        db.query(Application)
        .filter(Application.opportunity_id.in_(opp_ids))
        .all()
    ) if opp_ids else []

    total_applicants = len(apps)
    avg_match = 0
    if apps:
        scores = [a.match_score for a in apps if a.match_score is not None]
        avg_match = round(sum(scores) / max(len(scores), 1), 1)

    shortlisted = sum(1 for a in apps if a.status.value in ("SHORTLISTED", "INTERVIEW", "SELECTED"))

    # Status distribution
    status_dist = {}
    for a in apps:
        s = a.status.value
        status_dist[s] = status_dist.get(s, 0) + 1

    # Recent opportunities
    recent_opps = sorted(opps, key=lambda o: o.created_at, reverse=True)[:5]

    return {
        "active_opportunities": len(active_opps),
        "total_applicants": total_applicants,
        "avg_match_score": avg_match,
        "shortlisted": shortlisted,
        "status_distribution": status_dist,
        "recent_opportunities": [
            {
                "id": o.id,
                "title": o.title,
                "company_name": o.company_name,
                "status": o.status.value,
                "application_count": sum(1 for a in apps if a.opportunity_id == o.id),
                "created_at": o.created_at.isoformat(),
            }
            for o in recent_opps
        ],
    }


@router.get("/opportunities", response_model=list[OpportunityOut])
def get_my_opportunities(
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    opps = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
        .filter(Opportunity.recruiter_id == current_user.id)
        .order_by(Opportunity.created_at.desc())
        .all()
    )
    results = []
    for opp in opps:
        out = OpportunityOut.model_validate(opp)
        out.application_count = len(opp.applications)
        results.append(out)
    return results


@router.get("/candidates/{opportunity_id}")
def get_candidates(
    opportunity_id: str,
    current_user: User = Depends(require_role(UserRole.RECRUITER)),
    db: Session = Depends(get_db),
):
    """Get all candidates for an opportunity with full match details."""
    opp = (
        db.query(Opportunity)
        .options(
            joinedload(Opportunity.required_skills).joinedload(OpportunitySkill.skill)
        )
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.recruiter_id == current_user.id,
        )
        .first()
    )
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

    candidates = []
    for app in apps:
        student = app.student
        if not student:
            continue

        # Compute detailed match
        match_data = compute_match_score(db, student, opp)

        # Fetch portfolio for candidate
        from app.models import Portfolio
        portfolio = db.query(Portfolio).filter(Portfolio.user_id == student.user_id).first()
        projects = []
        certifications = []
        achievements = []
        if portfolio:
            projects = [
                {
                    "title": p.title,
                    "description": p.description,
                    "repository_url": p.repository_url,
                    "demo_url": p.demo_url,
                }
                for p in portfolio.projects
            ]
            certifications = [
                {
                    "name": c.name,
                    "issuer": c.issuer,
                    "credential_url": c.credential_url,
                    "issued_date": c.issued_date,
                }
                for c in portfolio.certifications
            ]
            achievements = [
                {
                    "title": a.title,
                    "description": a.description,
                    "achieved_on": a.achieved_on,
                }
                for a in portfolio.achievements
            ]

        candidates.append({
            "application_id": app.id,
            "student_id": student.id,
            "user_id": student.user_id,
            "student_name": student.user.full_name if student.user else "",
            "student_email": student.user.email if student.user else "",
            "university": student.university or "",
            "department": student.department or "",
            "year_of_study": student.year_of_study,
            "cgpa": student.cgpa,
            "bio": student.bio or "",
            "career_interests": student.career_interests or "",
            "match_score": match_data["match_score"],
            "breakdown": match_data["breakdown"],
            "matched_skills": match_data["matched_skills"],
            "skill_gaps": match_data["skill_gaps"],
            "status": app.status.value,
            "cover_letter": app.cover_letter,
            "resume_url": app.resume_url,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "all_skills": [
                {
                    "name": ss.skill.name if ss.skill else "",
                    "level": ss.proficiency_level,
                    "verified": ss.verified,
                }
                for ss in student.skills
            ],
            "projects": projects,
            "certifications": certifications,
            "achievements": achievements,
        })

    return candidates

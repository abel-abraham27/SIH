from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User, UserRole, Portfolio, PortfolioProject, Certification,
    Achievement, StudentProfile, StudentSkill,
)
from app.schemas.schemas import (
    PortfolioCreate, PortfolioOut, PortfolioProjectCreate,
    CertificationCreate, AchievementCreate,
)
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


@router.get("/my", response_model=PortfolioOut)
def get_my_portfolio(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        # Auto-create
        slug = current_user.full_name.lower().replace(" ", "-")
        portfolio = Portfolio(
            user_id=current_user.id,
            public_slug=slug,
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

    return _build_portfolio_response(portfolio, current_user)


@router.put("/my", response_model=PortfolioOut)
def update_portfolio(
    data: PortfolioCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        portfolio = Portfolio(user_id=current_user.id)
        db.add(portfolio)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(portfolio, key, value)

    db.commit()
    db.refresh(portfolio)
    return _build_portfolio_response(portfolio, current_user)


@router.post("/projects")
def add_project(
    data: PortfolioProjectCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    project = PortfolioProject(
        portfolio_id=portfolio.id,
        **data.model_dump(),
    )
    db.add(project)
    db.commit()
    return {"ok": True, "id": project.id}


@router.delete("/projects/{project_id}")
def delete_project(
    project_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    project = db.query(PortfolioProject).filter(
        PortfolioProject.id == project_id,
        PortfolioProject.portfolio_id == portfolio.id,
    ).first()
    if project:
        db.delete(project)
        db.commit()
    return {"ok": True}


@router.post("/certifications")
def add_certification(
    data: CertificationCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    cert = Certification(
        portfolio_id=portfolio.id,
        **data.model_dump(),
    )
    db.add(cert)
    db.commit()
    return {"ok": True, "id": cert.id}


@router.post("/achievements")
def add_achievement(
    data: AchievementCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    ach = Achievement(
        portfolio_id=portfolio.id,
        **data.model_dump(),
    )
    db.add(ach)
    db.commit()
    return {"ok": True, "id": ach.id}


@router.get("/public/{slug}")
def get_public_portfolio(slug: str, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(
        Portfolio.public_slug == slug,
        Portfolio.visibility == "PUBLIC",
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    user = db.query(User).filter(User.id == portfolio.user_id).first()
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == portfolio.user_id
    ).first()

    skills = []
    if profile:
        student_skills = db.query(StudentSkill).filter(
            StudentSkill.student_id == profile.id
        ).all()
        from app.models import Skill
        for ss in student_skills:
            skill = db.query(Skill).filter(Skill.id == ss.skill_id).first()
            skills.append({
                "name": skill.name if skill else "",
                "level": ss.proficiency_level,
            })

    return {
        "headline": portfolio.headline,
        "summary": portfolio.summary,
        "user_name": user.full_name if user else "",
        "profile_image": user.profile_image if user else None,
        "university": profile.university if profile else "",
        "department": profile.department if profile else "",
        "bio": profile.bio if profile else "",
        "career_interests": profile.career_interests if profile else "",
        "skills": skills,
        "projects": [
            {
                "title": p.title,
                "description": p.description,
                "repository_url": p.repository_url,
                "demo_url": p.demo_url,
                "start_date": p.start_date,
                "end_date": p.end_date,
            }
            for p in portfolio.projects
        ],
        "certifications": [
            {
                "name": c.name,
                "issuer": c.issuer,
                "credential_url": c.credential_url,
                "issued_date": c.issued_date,
            }
            for c in portfolio.certifications
        ],
        "achievements": [
            {
                "title": a.title,
                "description": a.description,
                "achieved_on": a.achieved_on,
            }
            for a in portfolio.achievements
        ],
    }


def _build_portfolio_response(portfolio, user):
    from app.schemas.schemas import UserOut
    result = PortfolioOut.model_validate(portfolio)
    result.user = UserOut.model_validate(user)
    result.projects = [
        PortfolioProjectCreate(
            title=p.title,
            description=p.description,
            repository_url=p.repository_url,
            demo_url=p.demo_url,
            start_date=p.start_date,
            end_date=p.end_date,
        )
        for p in portfolio.projects
    ]
    result.certifications = [
        CertificationCreate(
            name=c.name,
            issuer=c.issuer,
            credential_url=c.credential_url,
            issued_date=c.issued_date,
            expiry_date=c.expiry_date,
        )
        for c in portfolio.certifications
    ]
    result.achievements = [
        AchievementCreate(
            title=a.title,
            description=a.description,
            achieved_on=a.achieved_on,
        )
        for a in portfolio.achievements
    ]
    return result

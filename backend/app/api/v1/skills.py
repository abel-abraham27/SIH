from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Skill, SkillCategory
from app.schemas.schemas import SkillOut, SkillCategoryOut

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("/", response_model=list[SkillOut])
def list_skills(
    category_id: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Skill).options(joinedload(Skill.category)).filter(Skill.is_active == True)
    if category_id:
        query = query.filter(Skill.category_id == category_id)
    if search:
        query = query.filter(Skill.name.ilike(f"%{search}%"))
    skills = query.order_by(Skill.name).all()
    return [SkillOut.model_validate(s) for s in skills]


@router.get("/categories", response_model=list[SkillCategoryOut])
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(SkillCategory).order_by(SkillCategory.name).all()
    return [SkillCategoryOut.model_validate(c) for c in cats]


@router.get("/{skill_id}", response_model=SkillOut)
def get_skill(skill_id: str, db: Session = Depends(get_db)):
    skill = (
        db.query(Skill)
        .options(joinedload(Skill.category))
        .filter(Skill.id == skill_id)
        .first()
    )
    if not skill:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Skill not found")
    return SkillOut.model_validate(skill)

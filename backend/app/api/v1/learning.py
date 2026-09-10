from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    User, UserRole, StudentProfile, LearningProgram, ProgramSkill,
    ProgramEnrollment, SkillGap, EnrollmentStatus,
)
from app.schemas.schemas import (
    LearningProgramOut, EnrollmentCreate, EnrollmentOut,
)
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/learning-programs", tags=["Learning Programs"])


@router.get("/", response_model=list[LearningProgramOut])
def list_programs(db: Session = Depends(get_db)):
    programs = (
        db.query(LearningProgram)
        .options(
            joinedload(LearningProgram.target_skills).joinedload(ProgramSkill.skill)
        )
        .all()
    )
    results = []
    for p in programs:
        out = LearningProgramOut.model_validate(p)
        out.target_skills = [
            {
                "skill_id": ps.skill_id,
                "skill_name": ps.skill.name if ps.skill else "",
                "target_level": ps.target_level,
            }
            for ps in p.target_skills
        ]
        results.append(out)
    return results


@router.get("/recommended")
def get_recommendations(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    """Get learning program recommendations based on skill gaps."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        return []

    # Get skill gaps
    gaps = (
        db.query(SkillGap)
        .options(joinedload(SkillGap.skill))
        .filter(SkillGap.student_id == profile.id)
        .all()
    )
    gap_skill_ids = {g.skill_id for g in gaps}
    gap_map = {g.skill_id: g for g in gaps}

    if not gap_skill_ids:
        return []

    # Find programs that address skill gaps
    programs = (
        db.query(LearningProgram)
        .options(
            joinedload(LearningProgram.target_skills).joinedload(ProgramSkill.skill)
        )
        .all()
    )

    results = []
    for program in programs:
        program_skill_ids = {ps.skill_id for ps in program.target_skills}
        overlap = program_skill_ids & gap_skill_ids

        if not overlap:
            continue

        # Calculate recommendation score
        total_gap_priority_value = 0
        for skill_id in overlap:
            gap = gap_map.get(skill_id)
            if gap:
                priority_val = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}.get(gap.priority.value, 1)
                total_gap_priority_value += priority_val * (gap.target_level - gap.current_level)

        rec_score = min(total_gap_priority_value * 10, 100)

        # Check enrollment
        enrollment = db.query(ProgramEnrollment).filter(
            ProgramEnrollment.program_id == program.id,
            ProgramEnrollment.student_id == profile.id,
        ).first()

        result = {
            **LearningProgramOut.model_validate(program).model_dump(),
            "recommendation_score": rec_score,
            "addresses_gaps": [
                {
                    "skill_name": gap_map[sid].skill.name if gap_map[sid].skill else "",
                    "current_level": gap_map[sid].current_level,
                    "target_level": gap_map[sid].target_level,
                    "priority": gap_map[sid].priority.value,
                }
                for sid in overlap
            ],
            "enrolled": enrollment is not None,
            "enrollment_status": enrollment.status.value if enrollment else None,
        }
        result["target_skills"] = [
            {
                "skill_id": ps.skill_id,
                "skill_name": ps.skill.name if ps.skill else "",
                "target_level": ps.target_level,
            }
            for ps in program.target_skills
        ]
        results.append(result)

    results.sort(key=lambda x: x["recommendation_score"], reverse=True)
    return results


@router.post("/enroll", response_model=EnrollmentOut)
def enroll(
    data: EnrollmentCreate,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check if already enrolled
    existing = db.query(ProgramEnrollment).filter(
        ProgramEnrollment.program_id == data.program_id,
        ProgramEnrollment.student_id == profile.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = ProgramEnrollment(
        program_id=data.program_id,
        student_id=profile.id,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return EnrollmentOut.model_validate(enrollment)


@router.get("/enrollments", response_model=list[EnrollmentOut])
def get_my_enrollments(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        return []

    enrollments = (
        db.query(ProgramEnrollment)
        .options(
            joinedload(ProgramEnrollment.program)
            .joinedload(LearningProgram.target_skills)
            .joinedload(ProgramSkill.skill)
        )
        .filter(ProgramEnrollment.student_id == profile.id)
        .order_by(ProgramEnrollment.enrolled_at.desc())
        .all()
    )
    return [EnrollmentOut.model_validate(e) for e in enrollments]

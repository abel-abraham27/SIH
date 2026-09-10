from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole, FacultyProgram, ProgramStatus
from app.schemas.schemas import FacultyProgramCreate, FacultyProgramOut
from app.core.deps import require_role

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.get("/dashboard")
def get_faculty_dashboard(
    current_user: User = Depends(require_role(UserRole.FACULTY)),
    db: Session = Depends(get_db),
):
    programs = db.query(FacultyProgram).filter(
        FacultyProgram.faculty_id == current_user.id
    ).all()

    active_fdps = sum(1 for p in programs if p.program_type == "FDP" and p.status == ProgramStatus.ACTIVE)
    faculty_internships = sum(1 for p in programs if p.program_type == "FACULTY_INTERNSHIP")
    collaborations = sum(1 for p in programs if p.program_type == "INDUSTRY_COLLABORATION")
    workshops = sum(1 for p in programs if p.program_type == "WORKSHOP")

    return {
        "active_fdps": active_fdps,
        "faculty_internships": faculty_internships,
        "industry_collaborations": collaborations,
        "workshops": workshops,
        "total_programs": len(programs),
        "programs": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "program_type": p.program_type,
                "partner_company": p.partner_company,
                "start_date": p.start_date,
                "end_date": p.end_date,
                "status": p.status.value,
                "max_participants": p.max_participants,
            }
            for p in programs
        ],
    }


@router.get("/programs", response_model=list[FacultyProgramOut])
def get_my_programs(
    current_user: User = Depends(require_role(UserRole.FACULTY)),
    db: Session = Depends(get_db),
):
    programs = db.query(FacultyProgram).filter(
        FacultyProgram.faculty_id == current_user.id
    ).order_by(FacultyProgram.created_at.desc()).all()
    return [FacultyProgramOut.model_validate(p) for p in programs]


@router.post("/programs", response_model=FacultyProgramOut)
def create_program(
    data: FacultyProgramCreate,
    current_user: User = Depends(require_role(UserRole.FACULTY)),
    db: Session = Depends(get_db),
):
    program = FacultyProgram(
        faculty_id=current_user.id,
        **data.model_dump(),
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    return FacultyProgramOut.model_validate(program)


@router.put("/programs/{program_id}", response_model=FacultyProgramOut)
def update_program(
    program_id: str,
    data: FacultyProgramCreate,
    current_user: User = Depends(require_role(UserRole.FACULTY)),
    db: Session = Depends(get_db),
):
    program = db.query(FacultyProgram).filter(
        FacultyProgram.id == program_id,
        FacultyProgram.faculty_id == current_user.id,
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    for key, value in data.model_dump().items():
        setattr(program, key, value)
    db.commit()
    db.refresh(program)
    return FacultyProgramOut.model_validate(program)


@router.delete("/programs/{program_id}")
def delete_program(
    program_id: str,
    current_user: User = Depends(require_role(UserRole.FACULTY)),
    db: Session = Depends(get_db),
):
    program = db.query(FacultyProgram).filter(
        FacultyProgram.id == program_id,
        FacultyProgram.faculty_id == current_user.id,
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    db.delete(program)
    db.commit()
    return {"ok": True}

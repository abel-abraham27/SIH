from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    User, UserRole, StudentProfile, Assessment, AssessmentQuestion,
    AssessmentAttempt, AssessmentAnswer, StudentSkill,
)
from app.schemas.schemas import (
    AssessmentOut, AssessmentDetailOut, QuestionOut,
    AssessmentSubmit, AttemptOut,
)
from app.core.deps import get_current_user, require_role

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.get("/", response_model=list[AssessmentOut])
def list_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).filter(Assessment.is_active == True).all()
    results = []
    for a in assessments:
        out = AssessmentOut.model_validate(a)
        out.question_count = len(a.questions)
        results.append(out)
    return results


@router.get("/{assessment_id}", response_model=AssessmentDetailOut)
def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = (
        db.query(Assessment)
        .options(joinedload(Assessment.questions))
        .filter(Assessment.id == assessment_id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Return questions WITHOUT correct answers
    questions = [
        QuestionOut(
            id=q.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            weight=q.weight,
        )
        for q in assessment.questions
    ]

    result = AssessmentDetailOut.model_validate(assessment)
    result.questions = questions
    result.question_count = len(questions)
    return result


@router.post("/{assessment_id}/start", response_model=AttemptOut)
def start_assessment(
    assessment_id: str,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check for existing unsubmitted attempt
    existing = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment_id,
        AssessmentAttempt.student_id == profile.id,
        AssessmentAttempt.submitted_at == None,
    ).first()
    if existing:
        return AttemptOut.model_validate(existing)

    attempt = AssessmentAttempt(
        assessment_id=assessment_id,
        student_id=profile.id,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return AttemptOut.model_validate(attempt)


@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: str,
    submission: AssessmentSubmit,
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment_id,
        AssessmentAttempt.student_id == profile.id,
        AssessmentAttempt.submitted_at == None,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")

    # Load questions
    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.assessment_id == assessment_id
    ).all()
    question_map = {q.id: q for q in questions}

    total_weight = sum(q.weight for q in questions)
    earned_score = 0.0
    answers_data = []

    for ans in submission.answers:
        question = question_map.get(ans.question_id)
        if not question:
            continue

        is_correct = ans.answer.strip().lower() == question.correct_answer.strip().lower()
        score = question.weight if is_correct else 0.0
        earned_score += score

        answer_obj = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=ans.question_id,
            answer=ans.answer,
            is_correct=is_correct,
            score=score,
        )
        db.add(answer_obj)
        answers_data.append({
            "question_id": ans.question_id,
            "is_correct": is_correct,
            "score": score,
        })

    # Calculate percentage
    final_score = (earned_score / max(total_weight, 1)) * 100
    attempt.score = round(final_score, 1)
    attempt.submitted_at = datetime.utcnow()

    # Update student skills based on assessment performance
    _update_student_skills(db, profile, questions, submission.answers, final_score)

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": attempt.score,
        "total_questions": len(questions),
        "correct_answers": sum(1 for a in answers_data if a["is_correct"]),
        "answers": answers_data,
    }


def _update_student_skills(db, profile, questions, answers, score):
    """Update student skill proficiency based on assessment results."""
    # Group answers by skill
    answer_map = {a.question_id: a.answer for a in answers}
    skill_results: dict[str, list[bool]] = {}

    for q in questions:
        if not q.skill_id:
            continue
        ans = answer_map.get(q.id)
        is_correct = False
        if ans:
            is_correct = ans.strip().lower() == q.correct_answer.strip().lower()
        skill_results.setdefault(q.skill_id, []).append(is_correct)

    for skill_id, results in skill_results.items():
        accuracy = sum(results) / len(results) if results else 0

        # Map accuracy to proficiency level
        if accuracy >= 0.9:
            level = 5
        elif accuracy >= 0.7:
            level = 4
        elif accuracy >= 0.5:
            level = 3
        elif accuracy >= 0.3:
            level = 2
        else:
            level = 1

        # Update or create student skill
        existing = db.query(StudentSkill).filter(
            StudentSkill.student_id == profile.id,
            StudentSkill.skill_id == skill_id,
        ).first()

        if existing:
            # Only update if assessment gives higher level
            if level > existing.proficiency_level:
                existing.proficiency_level = level
                existing.evidence_source = "Assessment"
        else:
            new_skill = StudentSkill(
                student_id=profile.id,
                skill_id=skill_id,
                proficiency_level=level,
                evidence_source="Assessment",
            )
            db.add(new_skill)


@router.get("/attempts/my", response_model=list[AttemptOut])
def get_my_attempts(
    current_user: User = Depends(require_role(UserRole.STUDENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        return []

    attempts = (
        db.query(AssessmentAttempt)
        .options(joinedload(AssessmentAttempt.assessment))
        .filter(AssessmentAttempt.student_id == profile.id)
        .order_by(AssessmentAttempt.started_at.desc())
        .all()
    )
    return [AttemptOut.model_validate(a) for a in attempts]

"""
Skill Gap Analysis Engine for COGNIBRIDGE.

Compares student skills against target career path requirements
and generates prioritized skill gaps.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    StudentProfile, StudentSkill, SkillGap, Skill, GapPriority
)

# Career path skill requirements: career -> list of (skill_name, target_level)
CAREER_PATH_REQUIREMENTS = {
    "backend developer": {
        "Python": 4, "FastAPI": 3, "SQL": 4, "PostgreSQL": 4,
        "Docker": 4, "Git": 4, "Linux": 3, "Problem Solving": 4,
    },
    "frontend developer": {
        "JavaScript": 5, "React": 4, "Next.js": 4, "HTML/CSS": 4,
        "TypeScript": 4, "Git": 3, "Problem Solving": 3,
    },
    "full stack developer": {
        "Python": 4, "JavaScript": 4, "React": 4, "FastAPI": 3,
        "SQL": 3, "Docker": 3, "Git": 4, "Next.js": 3,
        "PostgreSQL": 3, "Problem Solving": 4,
    },
    "data scientist": {
        "Python": 5, "Machine Learning": 4, "Data Analysis": 5,
        "SQL": 4, "Statistics": 4, "Communication": 3, "Problem Solving": 4,
    },
    "data analyst": {
        "Python": 3, "SQL": 4, "Data Analysis": 5,
        "Statistics": 3, "Communication": 4, "Problem Solving": 3,
    },
    "devops engineer": {
        "Docker": 5, "Linux": 4, "Git": 4, "Python": 3,
        "Cloud Computing": 4, "Problem Solving": 4,
    },
    "machine learning engineer": {
        "Python": 5, "Machine Learning": 5, "Data Analysis": 4,
        "Statistics": 4, "Docker": 3, "Git": 3, "Problem Solving": 5,
    },
    "software engineer": {
        "Python": 4, "Java": 3, "JavaScript": 3, "SQL": 3,
        "Git": 4, "Docker": 3, "Problem Solving": 5, "Communication": 3,
    },
    "cloud engineer": {
        "Cloud Computing": 5, "Docker": 4, "Linux": 4, "Python": 3,
        "Git": 4, "Problem Solving": 4,
    },
}


def calculate_skill_gaps(
    db: Session,
    student: StudentProfile,
) -> list[dict]:
    """
    Calculate skill gaps for a student based on their career interests.
    Returns list of gap dictionaries.
    """
    # Parse career interests
    career_interests = (student.career_interests or "software engineer").lower()
    interests = [i.strip() for i in career_interests.split(",")]

    # Aggregate target skill requirements from all interests
    target_requirements: dict[str, int] = {}
    for interest in interests:
        for career, reqs in CAREER_PATH_REQUIREMENTS.items():
            if interest in career or career in interest:
                for skill_name, level in reqs.items():
                    current = target_requirements.get(skill_name, 0)
                    target_requirements[skill_name] = max(current, level)

    # Fallback to software engineer if no match
    if not target_requirements:
        target_requirements = CAREER_PATH_REQUIREMENTS["software engineer"]

    # Build current skill map: skill_name -> (skill_id, level)
    current_skills: dict[str, tuple[str, int]] = {}
    for ss in student.skills:
        if ss.skill:
            current_skills[ss.skill.name] = (ss.skill_id, ss.proficiency_level)

    # Get all skills from DB for name->id lookup
    all_skills = db.query(Skill).filter(Skill.is_active == True).all()
    skill_name_to_id = {s.name: s.id for s in all_skills}

    # Delete existing gaps
    db.query(SkillGap).filter(SkillGap.student_id == student.id).delete()

    gaps = []
    for skill_name, target_level in target_requirements.items():
        skill_id = skill_name_to_id.get(skill_name)
        if not skill_id:
            continue

        current_level = 0
        if skill_name in current_skills:
            _, current_level = current_skills[skill_name]

        gap = target_level - current_level
        if gap <= 0:
            continue

        # Determine priority
        if gap >= 3:
            priority = GapPriority.HIGH
        elif gap >= 2:
            priority = GapPriority.MEDIUM
        else:
            priority = GapPriority.LOW

        skill_gap = SkillGap(
            student_id=student.id,
            skill_id=skill_id,
            target_level=target_level,
            current_level=current_level,
            priority=priority,
            calculated_at=datetime.utcnow(),
        )
        db.add(skill_gap)
        gaps.append({
            "skill_id": skill_id,
            "skill_name": skill_name,
            "current_level": current_level,
            "target_level": target_level,
            "gap": gap,
            "priority": priority.value,
        })

    db.commit()
    return gaps


def calculate_employability_score(student: StudentProfile) -> dict:
    """
    Calculate overall employability score for a student.
    """
    scores = {}

    # Skill score: average of all skill proficiencies
    if student.skills:
        avg_skill = sum(s.proficiency_level for s in student.skills) / len(student.skills)
        scores["skill_score"] = min(avg_skill / 5.0, 1.0)
    else:
        scores["skill_score"] = 0

    # Assessment score: based on completed assessments
    completed = [a for a in student.assessment_attempts if a.submitted_at]
    if completed:
        avg_assessment = sum(a.score or 0 for a in completed) / len(completed)
        scores["assessment_score"] = min(avg_assessment / 100, 1.0)
    else:
        scores["assessment_score"] = 0

    # Profile completeness
    profile_fields = [
        student.university, student.department, student.year_of_study,
        student.cgpa, student.career_interests, student.bio,
    ]
    filled = sum(1 for f in profile_fields if f)
    scores["profile_score"] = filled / len(profile_fields)

    # CGPA factor
    if student.cgpa:
        scores["cgpa_score"] = min(student.cgpa / 10.0, 1.0)
    else:
        scores["cgpa_score"] = 0

    # Weighted
    employability = (
        0.35 * scores["skill_score"]
        + 0.25 * scores["assessment_score"]
        + 0.20 * scores["cgpa_score"]
        + 0.20 * scores["profile_score"]
    )

    return {
        "score": round(employability * 100),
        "breakdown": {k: round(v * 100) for k, v in scores.items()},
        "skill_completion": round(scores["skill_score"] * 100),
    }

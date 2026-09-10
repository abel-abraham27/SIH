"""
Deterministic Matching Engine for COGNIBRIDGE.

Formula:
    match_score = 0.50 * required_skill_match
                + 0.20 * qualification_match
                + 0.15 * experience_match
                + 0.10 * interest_match
                + 0.05 * work_mode_match

Each component returns a value between 0 and 1.
"""

from sqlalchemy.orm import Session
from app.models import (
    StudentProfile, StudentSkill, Opportunity, OpportunitySkill, User
)


def calculate_skill_match(
    student_skills: dict[str, int],
    required_skills: list[OpportunitySkill],
) -> tuple[float, list[dict], list[dict]]:
    """
    Calculate weighted skill match score.
    Returns (score, matched_skills, skill_gaps).
    """
    if not required_skills:
        return 1.0, [], []

    total_weight = 0.0
    weighted_score = 0.0
    matched = []
    gaps = []

    for req in required_skills:
        skill_name = req.skill.name if req.skill else "Unknown"
        student_level = student_skills.get(req.skill_id, 0)
        required_level = req.required_level
        weight = req.weight

        skill_score = min(student_level / max(required_level, 1), 1.0)
        weighted_score += skill_score * weight
        total_weight += weight

        entry = {
            "skill_id": req.skill_id,
            "name": skill_name,
            "student_level": student_level,
            "required_level": required_level,
            "score": round(skill_score, 2),
        }

        if student_level >= required_level:
            matched.append(entry)
        else:
            entry["gap"] = required_level - student_level
            gaps.append(entry)

    final_score = weighted_score / max(total_weight, 1)
    return round(final_score, 4), matched, gaps


def calculate_qualification_match(
    student: StudentProfile,
    opportunity: Opportunity,
) -> float:
    """Match based on qualification/CGPA."""
    if not opportunity.minimum_qualification:
        return 1.0

    score = 0.7  # base score
    if student.cgpa:
        if student.cgpa >= 8.0:
            score = 1.0
        elif student.cgpa >= 7.0:
            score = 0.85
        elif student.cgpa >= 6.0:
            score = 0.7
        else:
            score = 0.5
    return score


def calculate_experience_match(
    student: StudentProfile,
    opportunity: Opportunity,
) -> float:
    """Match based on year of study as proxy for experience."""
    if opportunity.minimum_experience == 0:
        return 1.0

    year = student.year_of_study or 1
    if year >= 4:
        return 1.0
    elif year == 3:
        return 0.8
    elif year == 2:
        return 0.6
    return 0.4


def calculate_interest_match(
    student: StudentProfile,
    opportunity: Opportunity,
) -> float:
    """Match based on career interests alignment."""
    if not student.career_interests or not opportunity.description:
        return 0.5

    interests = student.career_interests.lower().split(",")
    desc = opportunity.description.lower()
    title = opportunity.title.lower()
    combined = desc + " " + title

    match_count = sum(
        1 for interest in interests
        if interest.strip() in combined
    )
    if match_count >= 3:
        return 1.0
    elif match_count >= 2:
        return 0.8
    elif match_count >= 1:
        return 0.6
    return 0.3


def calculate_work_mode_match(
    student: StudentProfile,
    opportunity: Opportunity,
) -> float:
    """Match based on location / work mode preference."""
    if not student.preferred_location:
        return 0.7

    pref = student.preferred_location.lower()
    opp_loc = (opportunity.location or "").lower()
    mode = opportunity.work_mode.value if opportunity.work_mode else ""

    if mode == "REMOTE":
        return 1.0
    if pref in opp_loc or opp_loc in pref:
        return 1.0
    if mode == "HYBRID":
        return 0.7
    return 0.4


def compute_match_score(
    db: Session,
    student: StudentProfile,
    opportunity: Opportunity,
) -> dict:
    """
    Compute the full deterministic match score between a student and opportunity.
    Returns a dict with score breakdown and explanations.
    """
    # Build student skill map: skill_id -> proficiency_level
    student_skill_map = {}
    for ss in student.skills:
        student_skill_map[ss.skill_id] = ss.proficiency_level

    # Calculate each component
    skill_score, matched_skills, skill_gaps = calculate_skill_match(
        student_skill_map, opportunity.required_skills
    )
    qualification_score = calculate_qualification_match(student, opportunity)
    experience_score = calculate_experience_match(student, opportunity)
    interest_score = calculate_interest_match(student, opportunity)
    work_mode_score = calculate_work_mode_match(student, opportunity)

    # Weighted formula
    final_score = (
        0.50 * skill_score
        + 0.20 * qualification_score
        + 0.15 * experience_score
        + 0.10 * interest_score
        + 0.05 * work_mode_score
    )

    return {
        "match_score": round(final_score * 100, 1),
        "breakdown": {
            "skill_match": round(skill_score * 100, 1),
            "qualification_match": round(qualification_score * 100, 1),
            "experience_match": round(experience_score * 100, 1),
            "interest_match": round(interest_score * 100, 1),
            "work_mode_match": round(work_mode_score * 100, 1),
        },
        "formula": "0.50×Skill + 0.20×Qual + 0.15×Exp + 0.10×Interest + 0.05×WorkMode",
        "matched_skills": matched_skills,
        "skill_gaps": skill_gaps,
    }

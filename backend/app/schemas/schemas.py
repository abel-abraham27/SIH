from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models import UserRole


class UserRegister(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)
    role: UserRole
    institution_id: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    profile_image: str | None = None
    institution_id: str | None = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: str | None = None
    profile_image: str | None = None


class StudentProfileCreate(BaseModel):
    university: str | None = None
    department: str | None = None
    year_of_study: int | None = None
    cgpa: float | None = None
    career_interests: str | None = None
    preferred_location: str | None = None
    bio: str | None = None


class StudentProfileOut(BaseModel):
    id: str
    user_id: str
    university: str | None = None
    department: str | None = None
    year_of_study: int | None = None
    cgpa: float | None = None
    career_interests: str | None = None
    preferred_location: str | None = None
    bio: str | None = None
    user: UserOut | None = None

    class Config:
        from_attributes = True


class SkillCategoryOut(BaseModel):
    id: str
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


class SkillOut(BaseModel):
    id: str
    category_id: str
    name: str
    description: str | None = None
    is_active: bool
    category: SkillCategoryOut | None = None

    class Config:
        from_attributes = True


class StudentSkillCreate(BaseModel):
    skill_id: str
    proficiency_level: int = Field(..., ge=1, le=5)
    evidence_source: str | None = None


class StudentSkillOut(BaseModel):
    id: str
    student_id: str
    skill_id: str
    proficiency_level: int
    evidence_source: str | None = None
    verified: bool
    updated_at: datetime
    skill: SkillOut | None = None

    class Config:
        from_attributes = True


class SkillGapOut(BaseModel):
    id: str
    student_id: str
    skill_id: str
    target_level: int
    current_level: int
    priority: str
    calculated_at: datetime
    skill: SkillOut | None = None

    class Config:
        from_attributes = True


# ── Assessment Schemas ─────────────────────────────────────

class AssessmentOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    assessment_type: str
    duration_minutes: int
    is_active: bool
    question_count: int | None = None

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: dict | None = None
    weight: float

    class Config:
        from_attributes = True


class QuestionWithAnswerOut(QuestionOut):
    correct_answer: str


class AssessmentDetailOut(AssessmentOut):
    questions: list[QuestionOut] = []


class AnswerSubmit(BaseModel):
    question_id: str
    answer: str


class AssessmentSubmit(BaseModel):
    answers: list[AnswerSubmit]


class AttemptOut(BaseModel):
    id: str
    assessment_id: str
    student_id: str
    score: float | None = None
    started_at: datetime
    submitted_at: datetime | None = None
    assessment: AssessmentOut | None = None

    class Config:
        from_attributes = True


# ── Opportunity Schemas ────────────────────────────────────

class OpportunitySkillCreate(BaseModel):
    skill_id: str
    required_level: int = Field(default=3, ge=1, le=5)
    weight: float = 1.0


class OpportunityCreate(BaseModel):
    title: str
    company_name: str
    description: str | None = None
    opportunity_type: str
    work_mode: str = "HYBRID"
    location: str | None = None
    stipend: str | None = None
    duration: str | None = None
    minimum_qualification: str | None = None
    minimum_experience: int = 0
    application_deadline: datetime | None = None
    required_skills: list[OpportunitySkillCreate] = []


class OpportunitySkillOut(BaseModel):
    id: str | None = None
    skill_id: str
    required_level: int
    weight: float
    skill: SkillOut | None = None

    class Config:
        from_attributes = True


class OpportunityOut(BaseModel):
    id: str
    recruiter_id: str
    title: str
    company_name: str
    description: str | None = None
    opportunity_type: str
    work_mode: str
    location: str | None = None
    stipend: str | None = None
    duration: str | None = None
    minimum_qualification: str | None = None
    minimum_experience: int
    application_deadline: datetime | None = None
    status: str
    created_at: datetime
    required_skills: list[OpportunitySkillOut] = []
    application_count: int | None = None

    class Config:
        from_attributes = True


class OpportunityMatchOut(OpportunityOut):
    match_score: float | None = None
    matched_skills: list[dict] | None = None
    skill_gaps: list[dict] | None = None


# ── Application Schemas ────────────────────────────────────

class ApplicationCreate(BaseModel):
    opportunity_id: str
    cover_letter: str | None = None
    resume_url: str | None = None


class ApplicationOut(BaseModel):
    id: str
    opportunity_id: str
    student_id: str
    resume_url: str | None = None
    cover_letter: str | None = None
    match_score: float | None = None
    status: str
    applied_at: datetime
    updated_at: datetime
    opportunity: OpportunityOut | None = None
    student: StudentProfileOut | None = None

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str


# ── Learning Schemas ───────────────────────────────────────

class LearningProgramOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    provider: str | None = None
    duration: str | None = None
    delivery_mode: str
    certification_available: bool
    url: str | None = None
    status: str
    target_skills: list[dict] = []
    recommendation_score: float | None = None

    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    program_id: str


class EnrollmentOut(BaseModel):
    id: str
    program_id: str
    student_id: str
    status: str
    enrolled_at: datetime
    completed_at: datetime | None = None
    program: LearningProgramOut | None = None

    class Config:
        from_attributes = True


# ── Portfolio Schemas ──────────────────────────────────────

class PortfolioProjectCreate(BaseModel):
    title: str
    description: str | None = None
    repository_url: str | None = None
    demo_url: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class CertificationCreate(BaseModel):
    name: str
    issuer: str | None = None
    credential_url: str | None = None
    issued_date: str | None = None
    expiry_date: str | None = None


class AchievementCreate(BaseModel):
    title: str
    description: str | None = None
    achieved_on: str | None = None


class PortfolioCreate(BaseModel):
    headline: str | None = None
    summary: str | None = None
    visibility: str = "PUBLIC"
    public_slug: str | None = None


class PortfolioOut(BaseModel):
    id: str
    user_id: str
    headline: str | None = None
    summary: str | None = None
    visibility: str
    public_slug: str | None = None
    projects: list[PortfolioProjectCreate] = []
    certifications: list[CertificationCreate] = []
    achievements: list[AchievementCreate] = []
    user: UserOut | None = None

    class Config:
        from_attributes = True


# ── Faculty Schemas ────────────────────────────────────────

class FacultyProgramCreate(BaseModel):
    title: str
    description: str | None = None
    program_type: str
    partner_company: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    max_participants: int | None = None


class FacultyProgramOut(BaseModel):
    id: str
    faculty_id: str
    title: str
    description: str | None = None
    program_type: str
    partner_company: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str
    max_participants: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analytics Schemas ──────────────────────────────────────

class InstitutionAnalyticsOut(BaseModel):
    total_students: int
    active_students: int
    assessment_completion_rate: float
    average_skill_score: float
    internship_participation: float
    placement_conversion_rate: float
    most_demanded_skills: list[dict]
    top_skill_gaps: list[dict]
    skills_distribution: list[dict]
    department_wise_gaps: list[dict]
    application_outcomes: list[dict]

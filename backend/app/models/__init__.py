import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Enums ──────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    RECRUITER = "RECRUITER"
    INSTITUTION_ADMIN = "INSTITUTION_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class OpportunityType(str, enum.Enum):
    INTERNSHIP = "INTERNSHIP"
    FULL_TIME_JOB = "FULL_TIME_JOB"
    PART_TIME_JOB = "PART_TIME_JOB"
    FACULTY_INTERNSHIP = "FACULTY_INTERNSHIP"
    FDP = "FDP"
    RESEARCH_COLLABORATION = "RESEARCH_COLLABORATION"


class WorkMode(str, enum.Enum):
    REMOTE = "REMOTE"
    HYBRID = "HYBRID"
    ONSITE = "ONSITE"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    UNDER_REVIEW = "UNDER_REVIEW"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    SELECTED = "SELECTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class GapPriority(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class OpportunityStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class ProgramStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class EnrollmentStatus(str, enum.Enum):
    ENROLLED = "ENROLLED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DROPPED = "DROPPED"


class PortfolioVisibility(str, enum.Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    INSTITUTIONAL = "INSTITUTIONAL"


# ── Institution ────────────────────────────────────────────

class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    users: Mapped[list["User"]] = relationship(back_populates="institution")


# ── User ───────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    institution_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("institutions.id"), nullable=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False)
    profile_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    institution: Mapped["Institution | None"] = relationship(back_populates="users")
    student_profile: Mapped["StudentProfile | None"] = relationship(
        back_populates="user", uselist=False
    )
    portfolio: Mapped["Portfolio | None"] = relationship(
        back_populates="user", uselist=False
    )


# ── Student Profile ───────────────────────────────────────

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), unique=True, nullable=False
    )
    university: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year_of_study: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cgpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    career_interests: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferred_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="student_profile")
    skills: Mapped[list["StudentSkill"]] = relationship(back_populates="student")
    skill_gaps: Mapped[list["SkillGap"]] = relationship(back_populates="student")
    assessment_attempts: Mapped[list["AssessmentAttempt"]] = relationship(
        back_populates="student"
    )
    applications: Mapped[list["Application"]] = relationship(back_populates="student")
    enrollments: Mapped[list["ProgramEnrollment"]] = relationship(
        back_populates="student"
    )


# ── Skills ─────────────────────────────────────────────────

class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    skills: Mapped[list["Skill"]] = relationship(back_populates="category")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skill_categories.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    category: Mapped["SkillCategory"] = relationship(back_populates="skills")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id"), nullable=False
    )
    proficiency_level: Mapped[int] = mapped_column(Integer, default=1)
    evidence_source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    student: Mapped["StudentProfile"] = relationship(back_populates="skills")
    skill: Mapped["Skill"] = relationship()


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id"), nullable=False
    )
    target_level: Mapped[int] = mapped_column(Integer, nullable=False)
    current_level: Mapped[int] = mapped_column(Integer, default=0)
    priority: Mapped[GapPriority] = mapped_column(
        SAEnum(GapPriority), default=GapPriority.MEDIUM
    )
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    student: Mapped["StudentProfile"] = relationship(back_populates="skill_gaps")
    skill: Mapped["Skill"] = relationship()


# ── Assessments ────────────────────────────────────────────

class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assessment_type: Mapped[str] = mapped_column(String(50), default="MCQ")
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    skill_category_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("skill_categories.id"), nullable=True
    )

    questions: Mapped[list["AssessmentQuestion"]] = relationship(
        back_populates="assessment", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["AssessmentAttempt"]] = relationship(
        back_populates="assessment"
    )


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id"), nullable=False
    )
    skill_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("skills.id"), nullable=True
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(20), default="MCQ")
    options: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    correct_answer: Mapped[str] = mapped_column(String(500), nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0)

    assessment: Mapped["Assessment"] = relationship(back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    assessment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessments.id"), nullable=False
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id"), nullable=False
    )
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    assessment: Mapped["Assessment"] = relationship(back_populates="attempts")
    student: Mapped["StudentProfile"] = relationship(back_populates="assessment_attempts")
    answers: Mapped[list["AssessmentAnswer"]] = relationship(
        back_populates="attempt", cascade="all, delete-orphan"
    )


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    attempt_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessment_attempts.id"), nullable=False
    )
    question_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessment_questions.id"), nullable=False
    )
    answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    score: Mapped[float] = mapped_column(Float, default=0.0)

    attempt: Mapped["AssessmentAttempt"] = relationship(back_populates="answers")
    question: Mapped["AssessmentQuestion"] = relationship()


# ── Opportunities ──────────────────────────────────────────

class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    recruiter_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    institution_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("institutions.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    opportunity_type: Mapped[OpportunityType] = mapped_column(
        SAEnum(OpportunityType), nullable=False
    )
    work_mode: Mapped[WorkMode] = mapped_column(
        SAEnum(WorkMode), default=WorkMode.HYBRID
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stipend: Mapped[str | None] = mapped_column(String(100), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(100), nullable=True)
    minimum_qualification: Mapped[str | None] = mapped_column(String(255), nullable=True)
    minimum_experience: Mapped[int] = mapped_column(Integer, default=0)
    application_deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[OpportunityStatus] = mapped_column(
        SAEnum(OpportunityStatus), default=OpportunityStatus.ACTIVE
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    recruiter: Mapped["User"] = relationship()
    required_skills: Mapped[list["OpportunitySkill"]] = relationship(
        back_populates="opportunity", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        back_populates="opportunity"
    )


class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    opportunity_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("opportunities.id"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id"), nullable=False
    )
    required_level: Mapped[int] = mapped_column(Integer, default=3)
    weight: Mapped[float] = mapped_column(Float, default=1.0)

    opportunity: Mapped["Opportunity"] = relationship(back_populates="required_skills")
    skill: Mapped["Skill"] = relationship()


# ── Applications ───────────────────────────────────────────

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    opportunity_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("opportunities.id"), nullable=False
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id"), nullable=False
    )
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus), default=ApplicationStatus.APPLIED
    )
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    opportunity: Mapped["Opportunity"] = relationship(back_populates="applications")
    student: Mapped["StudentProfile"] = relationship(back_populates="applications")


# ── Learning Programs ─────────────────────────────────────

class LearningProgram(Base):
    __tablename__ = "learning_programs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider: Mapped[str | None] = mapped_column(String(255), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(100), nullable=True)
    delivery_mode: Mapped[str] = mapped_column(String(50), default="Online")
    certification_available: Mapped[bool] = mapped_column(Boolean, default=False)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ProgramStatus] = mapped_column(
        SAEnum(ProgramStatus), default=ProgramStatus.ACTIVE
    )

    target_skills: Mapped[list["ProgramSkill"]] = relationship(
        back_populates="program", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["ProgramEnrollment"]] = relationship(
        back_populates="program"
    )


class ProgramSkill(Base):
    __tablename__ = "program_skills"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    program_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learning_programs.id"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id"), nullable=False
    )
    target_level: Mapped[int] = mapped_column(Integer, default=3)

    program: Mapped["LearningProgram"] = relationship(back_populates="target_skills")
    skill: Mapped["Skill"] = relationship()


class ProgramEnrollment(Base):
    __tablename__ = "program_enrollments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    program_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learning_programs.id"), nullable=False
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id"), nullable=False
    )
    status: Mapped[EnrollmentStatus] = mapped_column(
        SAEnum(EnrollmentStatus), default=EnrollmentStatus.ENROLLED
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    program: Mapped["LearningProgram"] = relationship(back_populates="enrollments")
    student: Mapped["StudentProfile"] = relationship(back_populates="enrollments")


# ── Portfolio ──────────────────────────────────────────────

class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), unique=True, nullable=False
    )
    headline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    visibility: Mapped[PortfolioVisibility] = mapped_column(
        SAEnum(PortfolioVisibility), default=PortfolioVisibility.PUBLIC
    )
    public_slug: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="portfolio")
    projects: Mapped[list["PortfolioProject"]] = relationship(
        back_populates="portfolio", cascade="all, delete-orphan"
    )
    certifications: Mapped[list["Certification"]] = relationship(
        back_populates="portfolio", cascade="all, delete-orphan"
    )
    achievements: Mapped[list["Achievement"]] = relationship(
        back_populates="portfolio", cascade="all, delete-orphan"
    )


class PortfolioProject(Base):
    __tablename__ = "portfolio_projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    portfolio_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("portfolios.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    repository_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    demo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    start_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(20), nullable=True)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    portfolio_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("portfolios.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    credential_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    issued_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    expiry_date: Mapped[str | None] = mapped_column(String(20), nullable=True)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="certifications")


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    portfolio_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("portfolios.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    achieved_on: Mapped[str | None] = mapped_column(String(20), nullable=True)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="achievements")


# ── Faculty Programs ───────────────────────────────────────

class FacultyProgram(Base):
    __tablename__ = "faculty_programs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    faculty_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    program_type: Mapped[str] = mapped_column(String(50), nullable=False)
    partner_company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[ProgramStatus] = mapped_column(
        SAEnum(ProgramStatus), default=ProgramStatus.ACTIVE
    )
    max_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    faculty: Mapped["User"] = relationship()

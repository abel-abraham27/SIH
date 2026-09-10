import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, init_db
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, Institution, StudentProfile,
    SkillCategory, Skill, StudentSkill, SkillGap,
    Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer,
    Opportunity, OpportunityType, WorkMode, OpportunitySkill, OpportunityStatus, Application, ApplicationStatus,
    LearningProgram, ProgramSkill, ProgramEnrollment, ProgramStatus,
    Portfolio, PortfolioProject, Certification, Achievement,
    FacultyProgram
)


def seed_database():
    init_db()
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "student@cognibridge.demo").first():
            print("Database already seeded!")
            return

        print("Seeding database...")
        demo_password_hash = get_password_hash("Demo@123")

        # 1. Institution
        inst = Institution(
            id=str(uuid.uuid4()),
            name="Indian Institute of Technology, Bombay",
            code="IITB",
            city="Mumbai",
            state="Maharashtra",
            website="https://www.iitb.ac.in",
        )
        db.add(inst)
        db.commit()

        # 2. Skill Categories & Skills
        categories = {
            "Programming": ["Python", "Java", "C++", "TypeScript", "Go"],
            "Web Development": ["React", "Next.js", "Node.js", "FastAPI", "Tailwind CSS", "GraphQL"],
            "Data Science & AI": ["Machine Learning", "Deep Learning", "TensorFlow", "SQL", "Data Analysis", "PyTorch"],
            "Cloud & DevOps": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux System Admin"],
            "Soft Skills & Management": ["System Design", "Agile Methodologies", "Communication", "Problem Solving", "Team Leadership"],
        }

        created_skills = {}
        for cat_name, skill_list in categories.items():
            cat = SkillCategory(id=str(uuid.uuid4()), name=cat_name, description=f"{cat_name} skills domain")
            db.add(cat)
            db.commit()

            for s_name in skill_list:
                sk = Skill(id=str(uuid.uuid4()), category_id=cat.id, name=s_name, description=f"Proficiency in {s_name}")
                db.add(sk)
                db.commit()
                created_skills[s_name] = sk

        # 3. Users & Profiles

        # (a) Student Demo User: Aryan Sharma
        student_user = User(
            id=str(uuid.uuid4()),
            institution_id=inst.id,
            email="student@cognibridge.demo",
            password_hash=demo_password_hash,
            full_name="Aryan Sharma",
            role=UserRole.STUDENT,
        )
        db.add(student_user)
        db.commit()

        student_profile = StudentProfile(
            id=str(uuid.uuid4()),
            user_id=student_user.id,
            university="IIT Bombay",
            department="Computer Science & Engineering",
            year_of_study=3,
            cgpa=8.8,
            career_interests="Full-Stack Development, AI/ML, Cloud Infrastructure",
            preferred_location="Bengaluru / Remote",
            bio="Passionate 3rd-year CS undergrad interested in Full-Stack Development and AI integration. Active open-source contributor.",
        )
        db.add(student_profile)
        db.commit()

        # Add Aryan's Skills
        aryan_skills = {
            "Python": (4, True),
            "React": (4, True),
            "TypeScript": (3, False),
            "FastAPI": (4, True),
            "SQL": (3, False),
            "Docker": (2, False),
            "Machine Learning": (3, True),
        }
        for s_name, (level, ver) in aryan_skills.items():
            if s_name in created_skills:
                st_sk = StudentSkill(
                    id=str(uuid.uuid4()),
                    student_id=student_profile.id,
                    skill_id=created_skills[s_name].id,
                    proficiency_level=level,
                    verified=ver,
                )
                db.add(st_sk)
        db.commit()

        # Additional Students
        student_names = [
            ("Priya Patel", "Computer Science", 9.1),
            ("Rohan Verma", "Information Technology", 8.4),
            ("Ananya Sengupta", "Data Science", 8.9),
            ("Karthik Raja", "Computer Science", 8.6),
        ]
        for name, dept, cgpa in student_names:
            u = User(
                id=str(uuid.uuid4()),
                institution_id=inst.id,
                email=f"{name.lower().replace(' ', '.')}@cognibridge.demo",
                password_hash=demo_password_hash,
                full_name=name,
                role=UserRole.STUDENT,
            )
            db.add(u)
            db.commit()
            sp = StudentProfile(
                id=str(uuid.uuid4()),
                user_id=u.id,
                university="IIT Bombay",
                department=dept,
                year_of_study=4,
                cgpa=cgpa,
            )
            db.add(sp)
            db.commit()

        # (b) Recruiter Demo User
        recruiter_user = User(
            id=str(uuid.uuid4()),
            email="recruiter@cognibridge.demo",
            password_hash=demo_password_hash,
            full_name="Sarah Jenkins",
            role=UserRole.RECRUITER,
        )
        db.add(recruiter_user)
        db.commit()

        # (c) Faculty Demo User
        faculty_user = User(
            id=str(uuid.uuid4()),
            institution_id=inst.id,
            email="faculty@cognibridge.demo",
            password_hash=demo_password_hash,
            full_name="Dr. Rajesh Kumar",
            role=UserRole.FACULTY,
        )
        db.add(faculty_user)
        db.commit()

        # (d) Institution Admin Demo User
        admin_user = User(
            id=str(uuid.uuid4()),
            institution_id=inst.id,
            email="admin@cognibridge.demo",
            password_hash=demo_password_hash,
            full_name="Prof. S. N. Bose",
            role=UserRole.INSTITUTION_ADMIN,
        )
        db.add(admin_user)
        db.commit()

        # 4. Assessments
        web_cat = db.query(SkillCategory).filter(SkillCategory.name == "Web Development").first()
        assessment1 = Assessment(
            id=str(uuid.uuid4()),
            title="Full-Stack Web Engineering Assessment",
            description="Evaluate core knowledge of React, FastAPI, REST APIs, and modern frontend architecture.",
            assessment_type="MCQ",
            duration_minutes=15,
            is_active=True,
            created_by=faculty_user.id,
            skill_category_id=web_cat.id if web_cat else None,
        )
        db.add(assessment1)
        db.commit()

        # Assessment 1 Questions
        q1 = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment1.id,
            skill_id=created_skills["React"].id,
            question_text="What is the primary benefit of React Server Components (RSC)?",
            options={
                "A": "Reduces client bundle size by rendering components exclusively on the server",
                "B": "Eliminates the need for CSS styles",
                "C": "Allows direct manipulation of browser DOM without VDOM",
                "D": "Replaces Redux for client-side state management"
            },
            correct_answer="A",
            weight=1.0,
        )
        db.add(q1)

        q2 = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment1.id,
            skill_id=created_skills["FastAPI"].id,
            question_text="In FastAPI, which library provides data validation and serialization?",
            options={
                "A": "Pydantic",
                "B": "SQLAlchemy",
                "C": "Marshmallow",
                "D": "Cerberus"
            },
            correct_answer="A",
            weight=1.0,
        )
        db.add(q2)

        q3 = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=assessment1.id,
            skill_id=created_skills["Python"].id,
            question_text="Which HTTP status code represents an Unauthorized request due to invalid JWT credentials?",
            options={
                "A": "401 Unauthorized",
                "B": "403 Forbidden",
                "C": "400 Bad Request",
                "D": "404 Not Found"
            },
            correct_answer="A",
            weight=1.0,
        )
        db.add(q3)
        db.commit()

        # 5. Opportunities
        opp1 = Opportunity(
            id=str(uuid.uuid4()),
            recruiter_id=recruiter_user.id,
            institution_id=inst.id,
            title="Senior Full-Stack Software Intern",
            company_name="TechNova Systems",
            description="Join TechNova Systems to build next-generation AI-powered cloud applications. You will work directly with our engineering team using React, TypeScript, FastAPI, and Docker.",
            opportunity_type=OpportunityType.INTERNSHIP,
            location="Bengaluru / Remote",
            work_mode=WorkMode.HYBRID,
            stipend="₹45,000 / month",
            duration="6 Months",
            minimum_qualification="B.Tech CS / IT",
            minimum_experience=0,
            application_deadline=datetime.utcnow() + timedelta(days=30),
            status=OpportunityStatus.ACTIVE,
        )
        db.add(opp1)
        db.commit()

        # Opportunity Skills
        opp1_skills = [
            ("React", 4),
            ("TypeScript", 3),
            ("FastAPI", 3),
            ("Docker", 2),
            ("SQL", 3),
        ]
        for sname, req_lvl in opp1_skills:
            if sname in created_skills:
                db.add(OpportunitySkill(
                    id=str(uuid.uuid4()),
                    opportunity_id=opp1.id,
                    skill_id=created_skills[sname].id,
                    required_level=req_lvl,
                    weight=1.0,
                ))
        db.commit()

        opp2 = Opportunity(
            id=str(uuid.uuid4()),
            recruiter_id=recruiter_user.id,
            institution_id=inst.id,
            title="Graduate AI / ML Engineer",
            company_name="TechNova Systems",
            description="Develop computer vision and NLP models for enterprise automation. Experience with PyTorch/TensorFlow and Python required.",
            opportunity_type=OpportunityType.FULL_TIME_JOB,
            location="Mumbai, Maharashtra",
            work_mode=WorkMode.ONSITE,
            stipend="₹14,00,000 / year",
            duration="Full Time",
            minimum_qualification="B.Tech / M.Tech",
            minimum_experience=0,
            application_deadline=datetime.utcnow() + timedelta(days=45),
            status=OpportunityStatus.ACTIVE,
        )
        db.add(opp2)
        db.commit()

        opp2_skills = [
            ("Python", 5),
            ("Machine Learning", 4),
            ("Deep Learning", 4),
            ("PyTorch", 3),
        ]
        for sname, req_lvl in opp2_skills:
            if sname in created_skills:
                db.add(OpportunitySkill(
                    id=str(uuid.uuid4()),
                    opportunity_id=opp2.id,
                    skill_id=created_skills[sname].id,
                    required_level=req_lvl,
                    weight=1.0,
                ))
        db.commit()

        # 6. Student Application for Aryan
        app1 = Application(
            id=str(uuid.uuid4()),
            student_id=student_profile.id,
            opportunity_id=opp1.id,
            status=ApplicationStatus.SHORTLISTED,
            match_score=88.5,
            cover_letter="I am very excited about building scalable full-stack applications with React and FastAPI at TechNova Systems.",
            applied_at=datetime.utcnow() - timedelta(days=3),
        )
        db.add(app1)
        db.commit()

        # 7. Learning Programs
        lp1 = LearningProgram(
            id=str(uuid.uuid4()),
            title="Production Docker & Infrastructure for Engineers",
            provider="CogniBridge Academy",
            description="Master containerization, Docker Compose, and multi-stage builds for cloud application deployment.",
            duration="12 Hours",
            delivery_mode="Online Self-Paced",
            certification_available=True,
            url="https://cognibridge.demo/courses/docker-mastery",
            status=ProgramStatus.ACTIVE,
        )
        db.add(lp1)
        db.commit()

        if "Docker" in created_skills:
            db.add(ProgramSkill(
                id=str(uuid.uuid4()),
                program_id=lp1.id,
                skill_id=created_skills["Docker"].id,
                target_level=4,
            ))
            db.commit()

        # Enroll Aryan in Docker program
        db.add(ProgramEnrollment(
            id=str(uuid.uuid4()),
            student_id=student_profile.id,
            program_id=lp1.id,
        ))
        db.commit()

        # 8. Faculty Programs
        fp1 = FacultyProgram(
            id=str(uuid.uuid4()),
            faculty_id=faculty_user.id,
            title="National Workshop on Generative AI & Large Language Models in Academia",
            program_type="FDP",
            partner_company="TechNova Research Labs",
            description="5-day intensive Faculty Development Program covering modern Transformer architectures, Fine-tuning, and Educational AI tooling.",
            status=ProgramStatus.ACTIVE,
            max_participants=50,
            start_date="2026-10-01",
            end_date="2026-10-05",
        )
        db.add(fp1)
        db.commit()

        # 9. Aryan's Digital Portfolio
        portfolio = Portfolio(
            id=str(uuid.uuid4()),
            user_id=student_user.id,
            headline="Full-Stack Developer & AI Enthusiast",
            summary="Building responsive web apps with FastAPI, React, and Python. SIH 2026 Finalist.",
            public_slug="aryan-sharma",
        )
        db.add(portfolio)
        db.commit()

        db.add(PortfolioProject(
            id=str(uuid.uuid4()),
            portfolio_id=portfolio.id,
            title="CogniBridge Skill Mapping Portal",
            description="Built an interactive skill gap analyzer with real-time target path comparison and match scoring.",
            repository_url="https://github.com/aryansharma-demo/cognibridge",
            demo_url="https://cognibridge.demo",
        ))

        db.add(Certification(
            id=str(uuid.uuid4()),
            portfolio_id=portfolio.id,
            name="AWS Certified Cloud Practitioner",
            issuer="Amazon Web Services",
            issued_date="2026-05-15",
            credential_url="https://aws.amazon.com/verification/demo123",
        ))

        db.add(Achievement(
            id=str(uuid.uuid4()),
            portfolio_id=portfolio.id,
            title="Smart India Hackathon 2026 Finalist",
            description="Selected among top 10 teams nationally for building AI-driven skill mapping solutions for education.",
            achieved_on="2026-08-20",
        ))
        db.commit()

        print("Successfully seeded COGNIBRIDGE database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

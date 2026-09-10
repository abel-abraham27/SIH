# COGNIBRIDGE — Academia–Industry Collaboration Platform

> **Smart India Hackathon 2026 Ready MVP**

COGNIBRIDGE is an intelligent full-stack Academia–Industry Collaboration Platform designed to connect **Students**, **Recruiters**, **Faculty**, and **Institutions** for skill mapping, assessment verification, skill gap telemetry, AI opportunity matching, and digital portfolios.

---

## 🌟 Key Features

1. **Student Skill Mapping & Verification Engine**
   - 30+ standardized technical and soft skills across 5 categories.
   - Interactive MCQ assessment suite with instant automated scoring.
   - Verified profile badges for authenticated skills.

2. **Skill Gap Engine & Course Recommendations**
   - Compare student proficiencies against target career paths (Full-Stack Engineer, AI/ML Engineer, Cloud/DevOps).
   - Priority gap classification (HIGH vs MEDIUM priority).
   - Targeted learning program enrollment to bridge missing skill gaps.

3. **Deterministic Opportunity Matching Engine**
   - Weighted 5-factor fit score formula matching candidate verification, qualification, and interests.
   - Recruiter portal for publishing opportunities and shortlisting ranked applicants.

4. **Digital Skill Portfolios**
   - Shareable public portfolio pages (`/portfolio/[slug]`) showcasing verified skills, capstone projects, certifications, and achievements.

5. **Institutional Telemetry Analytics**
   - Visual dashboard for university leadership tracking department readiness percentages, skill competency radars, and FDP initiatives.

---

## 🚀 Quick Demo Login Credentials

All demo accounts use the password: `Demo@123`

| Role | Email | Password | Key Portal Features |
| font-mono | font-mono | font-mono | font-sans |
| **Student** | `student@cognibridge.demo` | `Demo@123` | Skill verification, Skill Gap engine, Opportunity matcher, Portfolio |
| **Recruiter** | `recruiter@cognibridge.demo` | `Demo@123` | Job posting, Candidate fit match rankings, Shortlisting pipeline |
| **Faculty** | `faculty@cognibridge.demo` | `Demo@123` | FDP proposals, Research projects, Workshops |
| **Institution Admin** | `admin@cognibridge.demo` | `Demo@123` | Institutional telemetry, Department readiness charts |

---

## 🛠️ Tech Stack & Architecture

- **Backend**: FastAPI (Python 3.11+), SQLAlchemy 2.0 ORM, Pydantic v2, JWT Security (passlib + bcrypt), SQLite / PostgreSQL.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons, Canvas Confetti.
- **DevOps**: Docker, Docker Compose.

---

## 🏃 Running Locally

### 1. Start Backend Server
```bash
cd backend
python -m venv venv
# Activate venv: venv\Scripts\activate (Windows) or source venv/bin/activate (Linux/Mac)
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000
```
Backend API interactive docs: `http://localhost:8000/docs`

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
Frontend App: `http://localhost:3000`

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

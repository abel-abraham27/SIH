export type UserRole = 'STUDENT' | 'FACULTY' | 'RECRUITER' | 'INSTITUTION_ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentSkill {
  id: string;
  skill_id: string;
  skill_name: string;
  category_name: string;
  proficiency_level: number;
  is_verified: boolean;
  verified_at?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  department: string;
  degree: string;
  graduation_year: number;
  cgpa?: number;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  resume_url?: string;
  target_career_path_id?: string;
  skills: StudentSkill[];
  user: User;
}

export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  category: string;
  current_level: number;
  required_level: number;
  gap: number;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  is_verified: boolean;
}

export interface ReadinessScoreBreakdown {
  overall_score: number;
  skill_match_percentage: number;
  verification_rate: number;
  career_path_title?: string;
  verified_skills_count: number;
  total_required_skills: number;
}

export interface Opportunity {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  type: 'INTERNSHIP' | 'JOB' | 'FACULTY_DEVELOPMENT' | 'PROJECT';
  location: string;
  work_mode: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  stipend_salary: string;
  duration?: string;
  experience_required?: string;
  application_deadline: string;
  is_active: boolean;
  company_name?: string;
  company_industry?: string;
  match_score?: number;
  required_skills?: Array<{
    skill_name: string;
    required_level: number;
    is_required: boolean;
  }>;
}

export interface Application {
  id: string;
  opportunity_id: string;
  student_id: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED';
  match_score: number;
  applied_at: string;
  cover_letter?: string;
  opportunity?: Opportunity;
  student?: StudentProfile;
}

export interface AssessmentOption {
  id: string;
  option_text: string;
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  points: number;
  options: AssessmentOption[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  skill_name?: string;
  target_level: number;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  questions?: AssessmentQuestion[];
}

export interface LearningProgram {
  id: string;
  title: string;
  provider: string;
  description: string;
  duration_hours: number;
  level: string;
  url: string;
  skills_covered?: string[];
  enrollment_status?: {
    progress: number;
    is_completed: boolean;
  };
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  github_url?: string;
  live_url?: string;
  is_featured: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date_achieved: string;
}

export interface Portfolio {
  id: string;
  public_slug: string;
  theme: string;
  is_published: boolean;
  projects: PortfolioProject[];
  certifications: Certification[];
  achievements: Achievement[];
  student?: StudentProfile;
}

export interface FacultyProgram {
  id: string;
  title: string;
  type: 'FDP' | 'RESEARCH' | 'WORKSHOP' | 'INTERNSHIP';
  description: string;
  status: 'PROPOSED' | 'APPROVED' | 'COMPLETED';
  target_audience: string;
  start_date: string;
  end_date: string;
  faculty_name?: string;
  department?: string;
}

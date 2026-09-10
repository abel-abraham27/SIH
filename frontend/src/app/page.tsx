'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  Sparkles, 
  Target, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Layers, 
  TrendingUp,
  Cpu,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const { demoLogin } = useAuth();
  const router = useRouter();
  const [loadingRole, setLoadingRole] = React.useState<string | null>(null);

  const handleQuickDemo = async (role: 'STUDENT' | 'RECRUITER' | 'FACULTY' | 'INSTITUTION_ADMIN') => {
    setLoadingRole(role);
    try {
      await demoLogin(role);
      const routes = {
        STUDENT: '/student/dashboard',
        RECRUITER: '/recruiter/dashboard',
        FACULTY: '/faculty/dashboard',
        INSTITUTION_ADMIN: '/institution/dashboard',
      };
      router.push(routes[role]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-primary/15 via-brand-purple/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-brand-cyan/10 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* SIH Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-brand-primary/30 text-xs font-semibold text-brand-primary shadow-lg shadow-brand-primary/10">
            <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
            <span>Smart India Hackathon 2026 Showcase MVP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
            <span className="text-slate-300">Live Backend Connected</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Bridge the Gap Between <br className="hidden sm:inline" />
            <span className="gradient-text">Academic Skills & Industry Demand</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            COGNIBRIDGE empowers Students with verified skill mapping & gap analytics, enables Recruiters with precision candidate matching, and provides Institutions with placement metrics.
          </p>

          {/* Quick Interactive Demo Login Buttons */}
          <div className="pt-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              ⚡ Launch Interactive Demo (1-Click Instant Login)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <button
                onClick={() => handleQuickDemo('STUDENT')}
                disabled={loadingRole !== null}
                className="p-3.5 rounded-xl glass-card text-left hover:border-brand-primary transition-all group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <GraduationCap className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-brand-indigo px-1.5 py-0.5 rounded bg-brand-primary/20">Student</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Aryan Sharma</div>
                  <div className="text-[10px] text-slate-400">Skill Gap & Opportunities</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemo('RECRUITER')}
                disabled={loadingRole !== null}
                className="p-3.5 rounded-xl glass-card text-left hover:border-brand-cyan transition-all group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <Briefcase className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-brand-cyan px-1.5 py-0.5 rounded bg-brand-cyan/20">Recruiter</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                  <div className="text-[10px] text-slate-400">TechNova Talent Lead</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemo('FACULTY')}
                disabled={loadingRole !== null}
                className="p-3.5 rounded-xl glass-card text-left hover:border-brand-violet transition-all group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <BookOpen className="w-5 h-5 text-brand-violet group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-brand-violet px-1.5 py-0.5 rounded bg-brand-violet/20">Faculty</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Dr. Rajesh Kumar</div>
                  <div className="text-[10px] text-slate-400">IITB CS Department</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemo('INSTITUTION_ADMIN')}
                disabled={loadingRole !== null}
                className="p-3.5 rounded-xl glass-card text-left hover:border-emerald-400 transition-all group flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/20">Admin</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Prof. S. N. Bose</div>
                  <div className="text-[10px] text-slate-400">Institutional Analytics</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-surface-border bg-surface-subtle/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">88.5%</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Average Match Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">30+</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Standardized Industry Skills</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">100%</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Assessment Verified Badges</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white gradient-text">Real-Time</div>
            <div className="text-xs font-medium text-slate-400 mt-1">Skill Gap Radar Analytics</div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Architectural Pillars</span>
          <h2 className="text-3xl font-bold text-white">Built for Every Higher Education Stakeholder</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Student Skill Gap Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identify exact missing proficiencies required for target career roles (Full-Stack, AI/ML, DevOps) with interactive radar charts and course recommendations.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> MCQ Skill Assessments</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> Verified Skill Badges</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> Digital Shareable Portfolios</li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Recruiter Matching Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Deterministic 5-factor weighted algorithm matching candidate skill verification, qualification, and interests with transparent fit scores.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan" /> 0-100 Match Score Calculation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan" /> Instant Candidate Ranking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan" /> Shortlist & Interview Pipelines</li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Institutional Telemetry</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time analytics for university leadership to track overall student readiness, skill distribution across departments, and faculty development programs.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Department Skill Heatmaps</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> FDP & Workshop Collaboration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Placement Trend Metrics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-brand-primary/30 relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white">Ready to Explore COGNIBRIDGE?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Test the live full-stack system now with pre-seeded demo accounts or create your own profile.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => handleQuickDemo('STUDENT')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold text-sm shadow-xl shadow-brand-primary/25 hover:opacity-90 transition-all flex items-center gap-2"
            >
              <span>Explore Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-surface-subtle border border-surface-border text-slate-200 font-bold text-sm hover:border-brand-primary transition-all"
            >
              Custom Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { 
  GraduationCap, 
  Target, 
  Award, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Play,
  Share2
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, oppsData] = await Promise.all([
          apiRequest<any>('/students/dashboard'),
          apiRequest<any[]>('/opportunities/matched'),
        ]);

        setDashboardData(dashData);
        setOpportunities(oppsData);
      } catch (err) {
        console.error('Error loading student dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Loading telemetry & profile metrics...</p>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const employability = dashboardData?.employability;
  const topSkills = dashboardData?.top_skills || [];
  const skillGaps = dashboardData?.skill_gaps || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{profile?.university || 'Set University in Profile'} • {profile?.department || 'Set Department'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Target Career Path: <strong className="text-slate-200">{profile?.career_interests || 'Software Engineer'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/assessment"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-purple text-white text-xs font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Verify Skill Assessment</span>
          </Link>

          <Link
            href="/student/portfolio"
            className="px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-slate-200 text-xs font-bold hover:border-brand-primary transition-all flex items-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>View Digital Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Readiness Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Readiness Score */}
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Career Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white gradient-text">
            {employability?.score?.toFixed(1) || '0.0'}%
          </div>
          <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-primary to-brand-cyan h-full rounded-full transition-all duration-1000"
              style={{ width: `${employability?.score || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">Target Path Match Fit</p>
        </div>

        {/* Card 2: Verified Skills */}
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Skill Verification</span>
            <Award className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {dashboardData?.verified_skills || 0} <span className="text-sm font-normal text-slate-400">/ {dashboardData?.skill_count || 0} verified</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Assessed & Authenticated</span>
          </div>
        </div>

        {/* Card 3: Active Applications */}
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Active Applications</span>
            <Briefcase className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {dashboardData?.application_count || 0}
          </div>
          <div className="text-[11px] text-brand-cyan font-semibold">
            {dashboardData?.active_pipelines || 0} active in pipeline
          </div>
        </div>

        {/* Card 4: Skill Gaps */}
        <div className="glass-card p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Skill Gap Status</span>
            <Target className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {skillGaps.length} {skillGaps.length === 1 ? 'Gap' : 'Gaps'}
          </div>
          <Link href="/student/skill-gap" className="text-[11px] text-brand-primary font-semibold hover:underline block">
            Bridge Gaps with Recommended Courses →
          </Link>
        </div>
      </div>

      {/* Main Grid: Skill Radar & Applications / Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Matched Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                Matched Industry Opportunities
              </h2>
              <p className="text-xs text-slate-400">Ranked by deterministic skill fit score</p>
            </div>
            <Link href="/student/opportunities" className="text-xs font-semibold text-brand-primary hover:underline">
              View All Opportunities →
            </Link>
          </div>

          <div className="space-y-4">
            {opportunities.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-400 text-xs">
                No matched opportunities yet. Add or verify more skills to increase match fit scores!
              </div>
            ) : (
              opportunities.slice(0, 3).map((opp: any) => (
                <div key={opp.id} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-primary/20 text-brand-primary">
                        {opp.opportunity_type || 'INTERNSHIP'}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">{opp.company_name}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{opp.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {opp.location && <span>📍 {opp.location}</span>}
                      {opp.stipend && <span>💰 {opp.stipend}</span>}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-border">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Match Fit</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        {opp.match_score != null ? `${opp.match_score.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <Link
                      href={`/student/opportunities`}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white text-xs font-bold transition-all"
                    >
                      View Details & Apply
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Skills & Actions */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-cyan" />
              Verified Skill Badges
            </h3>

            <div className="space-y-3">
              {topSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills added yet.</p>
              ) : (
                topSkills.map((sk: any) => (
                  <div key={sk.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                    <div>
                      <div className="font-semibold text-white">{sk.skill_name}</div>
                      <div className="text-[10px] text-slate-400">Level {sk.proficiency_level} / 5</div>
                    </div>
                    {sk.verified ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <Link
                        href="/student/assessment"
                        className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                      >
                        Verify Now
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

            <Link
              href="/student/skills"
              className="w-full py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-slate-200 text-xs font-semibold hover:border-brand-primary transition-all text-center block"
            >
              Manage All Skills
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


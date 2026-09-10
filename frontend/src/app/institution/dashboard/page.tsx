'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, Building2, BarChart3, TrendingUp, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function InstitutionDashboardPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await apiRequest<any>('/analytics/institution');
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-medium">Aggregating institutional skill analytics telemetry...</p>
      </div>
    );
  }

  // Format data for charts from backend response
  const departmentGaps = analytics?.department_wise_gaps?.length > 0 
    ? analytics.department_wise_gaps.map((d: any) => ({
        department: d.department,
        gaps: d.gaps,
      }))
    : [
        { department: 'Computer Science', gaps: 12 },
        { department: 'Information Tech', gaps: 18 },
        { department: 'Electronics Eng', gaps: 24 },
      ];

  const skillCompetency = analytics?.skills_distribution?.length > 0
    ? analytics.skills_distribution.map((s: any) => ({
        subject: s.category,
        count: s.count,
      }))
    : [
        { subject: 'Programming', count: 45 },
        { subject: 'Web Tech', count: 35 },
        { subject: 'DevOps', count: 20 },
        { subject: 'Database', count: 30 },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">Institutional Telemetry</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Institutional Analytics Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time skill verification metrics, placement readiness distribution, and department gap analysis.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Institutional Portal</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Enrolled Students</span>
          <div className="text-3xl font-extrabold text-white">{analytics?.total_students ?? 0}</div>
          <span className="text-[11px] text-slate-400">{analytics?.active_students ?? 0} Active</span>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Skill Level</span>
          <div className="text-3xl font-extrabold text-emerald-400">{analytics?.average_skill_score ?? 0} / 5.0</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Assessed across skills
          </span>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Assessment Completion</span>
          <div className="text-3xl font-extrabold text-brand-primary">{analytics?.assessment_completion_rate ?? 0}%</div>
          <span className="text-[11px] text-slate-400">MCQ Authenticated</span>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Internship Participation</span>
          <div className="text-3xl font-extrabold text-brand-cyan">{analytics?.internship_participation ?? 0}%</div>
          <span className="text-[11px] text-brand-cyan">Matches Active Opportunities</span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Department Skill Gaps Bar Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Identified Skill Gaps by Department</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentGaps}>
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181c28', borderColor: '#2b3248', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="gaps" fill="#4cd7f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Skill Distribution Radar Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <span>Skills Category Distribution</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillCompetency}>
                <PolarGrid stroke="#2b3248" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} stroke="#2b3248" />
                <Radar name="Count" dataKey="count" stroke="#8083ff" fill="#8083ff" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Sparkles, Target, AlertTriangle, BookOpen, CheckCircle2, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export default function SkillGapPage() {
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadData = async (pathId?: string) => {
    setLoading(true);
    try {
      const [gapsData, recsData] = await Promise.all([
        apiRequest<any[]>(`/students/skill-gaps${pathId ? `?career_path_id=${pathId}` : ''}`),
        apiRequest<any[]>('/learning-programs/recommended'),
      ]);
      setSkillGaps(gapsData);
      setRecommendations(recsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (programId: string) => {
    try {
      await apiRequest('/learning-programs/enroll', {
        method: 'POST',
        body: JSON.stringify({ program_id: programId }),
      });
      alert('Successfully enrolled in program!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Already enrolled');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-xs font-semibold text-brand-violet">
            <Target className="w-3.5 h-3.5" />
            <span>Deterministic Skill Gap Telemetry Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Target Career Path & Skill Gap Analysis</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Compare your verified skill proficiency against standardized industry requirements to target high-priority missing skills.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Missing Skill Gaps Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Identified Skill Gaps ({skillGaps.length})</span>
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
              <span>Analyzing target role requirements...</span>
            </div>
          ) : skillGaps.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-400 text-xs">
              No skill gaps detected! Your current skills match or exceed requirements for your target path.
            </div>
          ) : (
            <div className="space-y-4">
              {skillGaps.map((gap: any) => {
                const skillName = gap.skill?.name || gap.skill_name || 'Missing Skill';
                const categoryName = gap.skill?.category?.name || gap.category || 'Technical';
                const priority = gap.priority || 'HIGH';
                const currentLevel = gap.current_level ?? 0;
                const targetLevel = gap.target_level ?? gap.required_level ?? 3;
                const missingGap = Math.max(0, targetLevel - currentLevel);

                return (
                  <div key={gap.id || gap.skill_id} className="glass-card p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{categoryName}</span>
                        <h3 className="text-base font-bold text-white">{skillName}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {priority} PRIORITY GAP
                      </span>
                    </div>

                    {/* Level Comparison Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Current Level: <strong>{currentLevel} / 5</strong></span>
                        <span>Required Target Level: <strong className="text-brand-cyan">{targetLevel} / 5</strong></span>
                      </div>
                      <div className="w-full bg-surface-subtle h-3 rounded-full overflow-hidden flex">
                        <div
                          className="bg-brand-primary h-full rounded-l-full"
                          style={{ width: `${(currentLevel / 5) * 100}%` }}
                        />
                        <div
                          className="bg-rose-500/40 h-full rounded-r-full"
                          style={{ width: `${(missingGap / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs">
                      <span className="text-slate-400">Missing Proficiency Gap: +{missingGap} Level</span>
                      <Link
                        href="/student/assessment"
                        className="text-brand-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Verify via Assessment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Recommended Courses / Learning Programs */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-cyan" />
              <span>Recommended Learning Courses</span>
            </h3>
            <p className="text-xs text-slate-400">
              Hand-picked bootcamps & certification modules designed to bridge your missing skills.
            </p>

            <div className="space-y-4">
              {recommendations.map((prog: any) => (
                <div key={prog.id} className="glass-card p-4 rounded-2xl space-y-2">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">
                    {prog.provider || 'CogniBridge Academy'}
                  </span>
                  <h4 className="text-sm font-bold text-white">{prog.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{prog.description}</p>
                  
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-400">⏱ {prog.duration || '12 Hours'}</span>
                    <button
                      onClick={() => handleEnroll(prog.id)}
                      className="px-3 py-1 rounded-lg bg-brand-primary text-white text-xs font-bold hover:opacity-90 transition-all"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

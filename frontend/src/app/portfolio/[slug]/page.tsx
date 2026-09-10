'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, Award, CheckCircle2, Github, ExternalLink, GraduationCap, ShieldCheck } from 'lucide-react';

export default function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await apiRequest<any>(`/portfolios/public/${params.slug}`);
        setPortfolio(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Loading candidate portfolio...</p>
      </div>
    );
  }

  const student = portfolio?.user?.student_profile;
  const verifiedSkills = student?.skills?.filter((s: any) => s.verified || s.is_verified) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Candidate Hero Card */}
      <div className="glass-panel p-8 rounded-3xl border border-brand-primary/30 relative overflow-hidden space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>IIT Bombay • Computer Science & Engineering</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">{portfolio?.user?.full_name || 'Aryan Sharma'}</h1>
          <p className="text-sm text-brand-cyan font-medium">{portfolio?.headline || 'Full-Stack Developer & AI Enthusiast'}</p>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{portfolio?.summary || 'Passionate 3rd-year CS undergrad building scalable web apps.'}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-center">
            <span className="text-2xl font-extrabold text-emerald-400">{verifiedSkills.length}</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Verified Badges</span>
          </div>
        </div>
      </div>

      {/* Verified Skills Showcase */}
      <div className="glass-card p-8 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>COGNIBRIDGE Verified Technical Skills</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {student?.skills?.map((sk: any) => (
            <div key={sk.id} className="p-3 rounded-xl bg-surface-subtle border border-surface-border space-y-1">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>{sk.skill_name || sk.skill?.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400">Level {sk.proficiency_level} / 5</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="glass-card p-8 rounded-3xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-primary" />
          <span>Featured Projects</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolio?.projects?.map((proj: any) => (
            <div key={proj.id} className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
              <h3 className="text-base font-bold text-white">{proj.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
              {proj.repository_url && (
                <a
                  href={proj.repository_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-cyan hover:underline flex items-center gap-1 pt-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repository</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

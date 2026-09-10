'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Sparkles, Share2, Award, ExternalLink, Github, Plus, CheckCircle2 } from 'lucide-react';

export default function StudentPortfolioPage() {
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [addingProject, setAddingProject] = useState(false);

  const loadPortfolio = async () => {
    try {
      const data = await apiRequest<any>('/portfolios/me');
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle) return;
    setAddingProject(true);

    try {
      await apiRequest('/portfolios/me/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: projectTitle,
          description: projectDesc,
          tech_stack: 'React, FastAPI, Python',
        }),
      });
      setProjectTitle('');
      setProjectDesc('');
      loadPortfolio();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Loading digital portfolio builder...</p>
      </div>
    );
  }

  const slug = portfolio?.public_slug || 'aryan-sharma';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-brand-cyan tracking-wider">Shareable Portfolio Profile</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Digital Skill Portfolio</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Showcase your verified technical skill badges, hackathon achievements, and capstone projects to recruiters.
          </p>
        </div>

        <Link
          href={`/portfolio/${slug}`}
          target="_blank"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 text-slate-950 font-bold text-xs shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Public Showcase Page</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Projects & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-primary" />
              <span>Projects ({portfolio?.projects?.length || 0})</span>
            </h2>

            <div className="space-y-4">
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
                      <span>{proj.repository_url}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Hackathons & Certifications</span>
            </h2>

            <div className="space-y-3">
              {portfolio?.certifications?.map((cert: any) => (
                <div key={cert.id} className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{cert.name}</div>
                    <div className="text-[10px] text-slate-400">{cert.issuer} • Issued {cert.issued_date}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              ))}

              {portfolio?.achievements?.map((ach: any) => (
                <div key={ach.id} className="p-3 rounded-xl bg-surface-subtle border border-surface-border space-y-1 text-xs">
                  <div className="font-bold text-amber-300">🏆 {ach.title}</div>
                  <p className="text-slate-400 text-[11px]">{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Add Project Form */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-cyan" />
              <span>Add Portfolio Project</span>
            </h3>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. AI Code Assistant"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Key Contributions</label>
                <textarea
                  rows={3}
                  required
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Summarize project architecture, stack, and features..."
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={addingProject || !projectTitle}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{addingProject ? 'Adding...' : 'Add Project to Showcase'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

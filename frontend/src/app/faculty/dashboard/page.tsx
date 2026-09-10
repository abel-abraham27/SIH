'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, BookOpen, Plus, Users, Calendar, CheckCircle2, Award } from 'lucide-react';

export default function FacultyDashboardPage() {
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New program modal
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [programType, setProgramType] = useState('FDP');
  const [partnerCompany, setPartnerCompany] = useState('TechNova Research Labs');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    try {
      const [dashData, progsData] = await Promise.all([
        apiRequest<any>('/faculty/dashboard'),
        apiRequest<any[]>('/faculty/my-programs'),
      ]);
      setDashboard(dashData);
      setPrograms(progsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/faculty/programs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          program_type: programType,
          partner_company: partnerCompany,
          description,
        }),
      });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-violet mx-auto mb-2" />
        <p className="text-sm font-medium">Loading Educator & Academic Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-brand-violet tracking-wider">Faculty Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Academic & Research Collaboration Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Propose Faculty Development Programs (FDPs), industry research collaborations, and student workshops.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-purple-600 text-white text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Faculty Program</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Programs / FDPs</span>
          <div className="text-3xl font-extrabold text-white">{dashboard?.my_programs_count || programs.length}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Industry Partners</span>
          <div className="text-3xl font-extrabold text-brand-violet">TechNova Labs, DataSphere</div>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Enrolled Participants</span>
          <div className="text-3xl font-extrabold text-emerald-400">45 Faculty / Scholars</div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-violet/40 space-y-4 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-white">Propose FDP, Research Project, or Workshop</h3>
          <form onSubmit={handleCreateProgram} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Program Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. National Workshop on Generative AI & LLMs"
                className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key topics, duration, and objective..."
                className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold"
              >
                Submit Proposal
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl bg-surface-subtle text-xs text-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Programs List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-violet" />
          <span>Active Faculty Initiatives</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog: any) => (
            <div key={prog.id} className="glass-card p-6 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-violet/20 text-brand-violet">
                  {prog.program_type || 'FDP'}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{prog.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{prog.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-surface-border">
                <span>Industry Partner: <strong className="text-brand-cyan">{prog.partner_company || 'TechNova Systems'}</strong></span>
                <span>Max Participants: {prog.max_participants || 50}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

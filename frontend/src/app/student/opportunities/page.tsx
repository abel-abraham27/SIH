'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, Briefcase, MapPin, DollarSign, Clock, CheckCircle2, AlertTriangle, Send, X } from 'lucide-react';

export default function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOpps() {
      try {
        const data = await apiRequest<any[]>('/opportunities/matched');
        setOpportunities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOpps();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setApplying(true);
    setApplyMessage(null);

    try {
      await apiRequest('/applications/', {
        method: 'POST',
        body: JSON.stringify({
          opportunity_id: selectedOpp.id,
          cover_letter: coverLetter,
        }),
      });
      setApplyMessage('Application submitted successfully! Track status in Applications portal.');
      setTimeout(() => {
        setSelectedOpp(null);
        setCoverLetter('');
        setApplyMessage(null);
      }, 2000);
    } catch (err: any) {
      setApplyMessage(err.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Running deterministic candidate matching engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI-Matched Industry Opportunities</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Opportunities algorithmically ranked based on your verified skills, experience, and career profile.
        </p>
      </div>

      {/* Opportunity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.length === 0 ? (
          <div className="md:col-span-2 glass-card p-12 text-center text-slate-400 text-sm">
            No active opportunities posted yet. Check back soon!
          </div>
        ) : (
          opportunities.map((opp: any) => (
            <div key={opp.id} className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-cyan/20 text-brand-cyan">
                    {opp.opportunity_type || 'INTERNSHIP'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">Match Fit:</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {opp.match_score != null ? `${opp.match_score.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                  <p className="text-xs font-semibold text-brand-indigo">{opp.company_name}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {opp.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-surface-border">
                  {opp.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-primary" /> {opp.location}</span>}
                  {opp.stipend && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {opp.stipend}</span>}
                  {opp.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-purple" /> {opp.duration}</span>}
                </div>
              </div>

              <button
                onClick={() => setSelectedOpp(opp)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-purple text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Inspect Match & Apply</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Application Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOpp(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">
                {selectedOpp.opportunity_type}
              </span>
              <h2 className="text-xl font-bold text-white">{selectedOpp.title}</h2>
              <p className="text-xs font-semibold text-brand-primary">{selectedOpp.company_name}</p>
            </div>

            {applyMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                {applyMessage}
              </div>
            )}

            {/* Match breakdown preview */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Deterministic Match Score</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {selectedOpp.match_score != null ? `${selectedOpp.match_score.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              {selectedOpp.matched_skills && selectedOpp.matched_skills.length > 0 && (
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400">Matched Skills: </span>
                  {selectedOpp.matched_skills.map((m: any) => `${m.skill_name} (L${m.student_level}/${m.required_level})`).join(', ')}
                </div>
              )}
              {selectedOpp.skill_gaps && selectedOpp.skill_gaps.length > 0 && (
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-amber-400">Skill Gaps: </span>
                  {selectedOpp.skill_gaps.map((g: any) => `${g.skill_name} (Needs L${g.required_level})`).join(', ')}
                </div>
              )}
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cover Letter / Note to Recruiter</label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why your verified skill profile makes you an ideal fit for this role..."
                  className="w-full p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 rounded-xl bg-surface-subtle text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg hover:opacity-90 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

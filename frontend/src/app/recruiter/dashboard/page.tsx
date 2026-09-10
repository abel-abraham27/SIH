'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, Briefcase, Plus, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function RecruiterDashboardPage() {
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Record<string, any[]>>({});
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // New Opportunity Form state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('');
  const [opportunityType, setOpportunityType] = useState('INTERNSHIP');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [requiredSkills, setRequiredSkills] = useState<{ skill_id: string; required_level: number }[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(3);

  const loadData = async () => {
    try {
      const [dashData, oppsData, skillsData] = await Promise.all([
        apiRequest<any>('/recruiters/dashboard'),
        apiRequest<any[]>('/recruiters/opportunities'),
        apiRequest<any[]>('/skills/'),
      ]);
      setDashboard(dashData);
      setOpportunities(oppsData);
      setAvailableSkills(skillsData);

      // Fetch candidates for each opportunity
      const map: Record<string, any[]> = {};
      await Promise.all(
        oppsData.map(async (opp: any) => {
          try {
            const candList = await apiRequest<any[]>(`/recruiters/candidates/${opp.id}`);
            map[opp.id] = candList;
          } catch {
            map[opp.id] = [];
          }
        })
      );
      setCandidatesMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRequiredSkill = () => {
    if (!selectedSkillId) return;
    if (requiredSkills.some(s => s.skill_id === selectedSkillId)) return;
    setRequiredSkills([...requiredSkills, { skill_id: selectedSkillId, required_level: selectedSkillLevel }]);
    setSelectedSkillId('');
  };

  const handleRemoveRequiredSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(s => s.skill_id !== skillId));
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await apiRequest('/opportunities/', {
        method: 'POST',
        body: JSON.stringify({
          title,
          company_name: companyName,
          description,
          location,
          stipend,
          duration,
          opportunity_type: opportunityType,
          work_mode: workMode,
          required_skills: requiredSkills,
        }),
      });
      setShowCreate(false);
      setTitle('');
      setCompanyName('');
      setDescription('');
      setLocation('');
      setStipend('');
      setDuration('');
      setRequiredSkills([]);
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to create opportunity. Please try again.');
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await apiRequest(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      // Update local state instead of doing a full reload to make UI feel snappier
      setCandidatesMap(prev => {
        const next = { ...prev };
        for (const oppId in next) {
          next[oppId] = next[oppId].map(c => 
            c.application_id === appId ? { ...c, status: newStatus } : c
          );
        }
        return next;
      });
      if (selectedCandidate && selectedCandidate.application_id === appId) {
        setSelectedCandidate({ ...selectedCandidate, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOpportunity = async (oppId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    setErrorMsg(null);
    try {
      await apiRequest(`/opportunities/${oppId}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to delete opportunity. You can only delete opportunities you created.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-cyan mx-auto mb-2" />
        <p className="text-sm font-medium">Loading Recruiter Talent Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
          <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white text-sm font-bold">✕</button>
        </div>
      )}

      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-brand-cyan tracking-wider">Industry Talent Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Recruiter Management Portal</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Post opportunities, rank applicants by deterministic skill fit, and manage candidate pipelines.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 text-slate-950 text-xs font-extrabold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Opportunities</span>
          <div className="text-3xl font-extrabold text-white">{dashboard?.active_opportunities ?? opportunities.length}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Applicants</span>
          <div className="text-3xl font-extrabold text-brand-cyan">{dashboard?.total_applicants ?? 0}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Candidate Match Score</span>
          <div className="text-3xl font-extrabold text-emerald-400">
            {dashboard?.avg_match_score != null ? `${dashboard.avg_match_score}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-cyan/40 space-y-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-white">Create New Internship or Job Posting</h3>
          <form onSubmit={handleCreateOpportunity} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Sportify Technologies"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Backend Developer Intern"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opportunity Type</label>
                <select
                  value={opportunityType}
                  onChange={(e) => setOpportunityType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FULL_TIME_JOB">Full-Time Job</option>
                  <option value="PART_TIME_JOB">Part-Time Job</option>
                  <option value="FACULTY_INTERNSHIP">Faculty Internship</option>
                  <option value="FDP">Faculty Development Program</option>
                  <option value="RESEARCH_COLLABORATION">Research Collaboration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                >
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-Site / In Office</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Coimbatore / Remote"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stipend / Salary</label>
                <input
                  type="text"
                  required
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. ₹25,000 / month"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 Months"
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key responsibilities, project scope, and expectations..."
                className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
              />
            </div>

            {/* Required Skills Selection */}
            <div className="space-y-3 pt-2 border-t border-surface-border">
              <label className="block text-xs font-bold text-slate-200">Required Skills & Proficiency Fit</label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                >
                  <option value="">-- Choose Skill from Taxonomy --</option>
                  {availableSkills.map((sk: any) => (
                    <option key={sk.id} value={sk.id}>{sk.name} ({sk.category?.name || 'Domain'})</option>
                  ))}
                </select>

                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(Number(e.target.value))}
                  className="w-full sm:w-44 p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white"
                >
                  <option value={1}>L1 - Basic</option>
                  <option value={2}>L2 - Elementary</option>
                  <option value={3}>L3 - Intermediate</option>
                  <option value={4}>L4 - Advanced</option>
                  <option value={5}>L5 - Expert</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddRequiredSkill}
                  className="px-4 py-2.5 rounded-xl bg-brand-cyan text-slate-950 text-xs font-bold hover:opacity-90"
                >
                  Add Requirement
                </button>
              </div>

              {requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {requiredSkills.map((rs) => {
                    const skObj = availableSkills.find(s => s.id === rs.skill_id);
                    return (
                      <span key={rs.skill_id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-subtle border border-surface-border text-xs text-slate-200">
                        <strong className="text-brand-cyan">{skObj?.name || 'Skill'}</strong> (Target L{rs.required_level})
                        <button type="button" onClick={() => handleRemoveRequiredSkill(rs.skill_id)} className="text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-surface-border">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 text-slate-950 text-xs font-bold hover:opacity-90 transition-all"
              >
                Publish Opportunity
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-subtle text-xs text-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opportunities & Candidate Funnel */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-cyan" />
          <span>Active Opportunities & Applicants</span>
        </h2>

        <div className="space-y-6">
          {opportunities.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 text-sm">
              No opportunities created yet. Click &quot;Post New Opportunity&quot; to publish one.
            </div>
          ) : (
            opportunities.map((opp: any) => {
              const candidates = candidatesMap[opp.id] || [];

              return (
                <div key={opp.id} className="glass-card p-6 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">
                          {opp.opportunity_type}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-subtle text-slate-300">
                          {opp.work_mode}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{opp.title}</h3>
                      <p className="text-xs font-semibold text-brand-indigo">{opp.company_name}</p>
                      <span className="text-xs text-slate-400">
                        {opp.location && `📍 ${opp.location}`} {opp.stipend && `• 💰 ${opp.stipend}`} {opp.duration && `• ⏱ ${opp.duration}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs text-slate-400 font-semibold">
                      <span>Applicants: <strong className="text-white">{candidates.length}</strong></span>
                      <button onClick={() => handleDeleteOpportunity(opp.id)} className="text-rose-400 hover:text-rose-300 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Applicants list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ranked Applicants</h4>
                    {candidates.length > 0 ? (
                      candidates.map((cand: any) => (
                        <div key={cand.application_id} className="p-4 rounded-2xl bg-surface-subtle border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="text-sm font-bold text-white hover:text-brand-cyan hover:underline text-left"
                              >
                                {cand.student_name}
                              </button>
                              <span className="text-xs font-semibold text-brand-cyan">
                                {cand.university || 'University'} • {cand.department || 'Department'}
                              </span>
                            </div>
                            {cand.cover_letter && (
                              <p className="text-xs text-slate-400 italic line-clamp-2">&quot;{cand.cover_letter}&quot;</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Fit Match</span>
                              <span className="text-base font-extrabold text-emerald-400">
                                {cand.match_score != null ? `${cand.match_score.toFixed(1)}%` : 'N/A'}
                              </span>
                              <span className={`text-[10px] font-bold block mt-0.5 ${
                                cand.status === 'SHORTLISTED' ? 'text-emerald-400' :
                                cand.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                              }`}>
                                {cand.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-cyan text-slate-200 text-xs font-bold transition-all"
                              >
                                View Profile
                              </button>

                              {cand.status !== 'SHORTLISTED' && cand.status !== 'REJECTED' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(cand.application_id, 'SHORTLISTED')}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(cand.application_id, 'REJECTED')}
                                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No applicants yet for this position.</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Candidate Full Profile View Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {/* Candidate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">
                  Applicant Profile
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{selectedCandidate.student_name}</h2>
                <p className="text-xs text-slate-400">{selectedCandidate.student_email}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2 font-semibold">
                  <span>🎓 {selectedCandidate.university}</span>
                  <span>• {selectedCandidate.department}</span>
                  {selectedCandidate.year_of_study && <span>• Year {selectedCandidate.year_of_study}</span>}
                  {selectedCandidate.cgpa && <span className="text-emerald-400">• CGPA {selectedCandidate.cgpa} / 10</span>}
                </div>
              </div>

              <div className="text-right glass-card p-4 rounded-2xl border border-surface-border">
                <span className="text-xs text-slate-400 block">Deterministic Skill Match</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {selectedCandidate.match_score != null ? `${selectedCandidate.match_score.toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-brand-cyan block mt-1 font-bold">Status: {selectedCandidate.status}</span>
              </div>
            </div>

            {/* Cover Letter Note */}
            {selectedCandidate.cover_letter && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cover Letter / Candidate Note</h4>
                <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-slate-200 italic leading-relaxed">
                  &quot;{selectedCandidate.cover_letter}&quot;
                </div>
              </div>
            )}

            {/* Bio / Summary */}
            {selectedCandidate.bio && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Candidate</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-surface-subtle p-3 rounded-xl">
                  {selectedCandidate.bio}
                </p>
              </div>
            )}

            {/* Skills & Badges */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified & Self-Reported Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.all_skills?.map((sk: any, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{sk.name}</span>
                    <span className="text-[10px] text-brand-cyan font-bold">L{sk.level}</span>
                    {sk.verified ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400">
                        Verified
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300">
                        Self-Reported
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio Projects */}
            {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Portfolio Projects ({selectedCandidate.projects.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidate.projects.map((p: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1 text-xs">
                      <h5 className="font-bold text-white">{p.title}</h5>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        {p.repository_url && (
                          <a href={p.repository_url} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline font-semibold">
                            GitHub Repo ↗
                          </a>
                        )}
                        {p.demo_url && (
                          <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-semibold">
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Certifications</h4>
                  <div className="space-y-2">
                    {selectedCandidate.certifications.map((c: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.issuer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.achievements && selectedCandidate.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Achievements</h4>
                  <div className="space-y-2">
                    {selectedCandidate.achievements.map((a: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                        <div className="font-bold text-white">{a.title}</div>
                        <div className="text-[10px] text-slate-400">{a.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle text-xs font-bold text-slate-300"
              >
                Close Profile
              </button>

              <div className="flex items-center gap-3">
                {selectedCandidate.status !== 'SHORTLISTED' && selectedCandidate.status !== 'REJECTED' ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedCandidate.application_id, 'SHORTLISTED')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Shortlist Candidate
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedCandidate.application_id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject Candidate
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    selectedCandidate.status === 'SHORTLISTED' ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'
                  }`}>
                    {selectedCandidate.status === 'SHORTLISTED' ? 'Candidate Shortlisted' : 'Candidate Rejected'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Sparkles, CheckCircle2, Award, Plus, Play, RefreshCw, Star } from 'lucide-react';

export default function StudentSkillsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profData, skillsData] = await Promise.all([
        apiRequest<any>('/students/profile'),
        apiRequest<any[]>('/skills/'),
      ]);
      setProfile(profData);
      setAllSkills(skillsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;
    setAdding(true);
    setMessage(null);

    try {
      await apiRequest('/students/skills', {
        method: 'POST',
        body: JSON.stringify({
          skill_id: selectedSkill,
          proficiency_level: selectedLevel,
        }),
      });
      setMessage('Skill added successfully!');
      loadData();
    } catch (err: any) {
      setMessage(err.message || 'Error adding skill');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateProficiency = async (skillId: string, newLevel: number) => {
    try {
      await apiRequest('/students/skills', {
        method: 'POST',
        body: JSON.stringify({
          skill_id: skillId,
          proficiency_level: newLevel,
        }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Loading skills directory...</p>
      </div>
    );
  }

  const studentSkills = profile?.skills || [];
  const existingSkillIds = new Set(studentSkills.map((s: any) => s.skill_id));
  const availableSkillsToAdd = allSkills.filter((s: any) => !existingSkillIds.has(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Skill Profile & Verification</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your technical & soft skills, update proficiency scores, and complete MCQ assessments to earn verified badges.
          </p>
        </div>
        <Link
          href="/student/assessment"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-purple text-white text-xs font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>Take Assessment</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Skills */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <span>My Active Skills ({studentSkills.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studentSkills.map((sk: any) => {
              const skillName = sk.skill?.name || sk.skill_name || 'Skill';
              const categoryName = sk.skill?.category?.name || sk.category_name || 'Technical';
              const isVerified = sk.verified || sk.is_verified;

              return (
                <div key={sk.id} className="glass-card p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-cyan">
                        {categoryName}
                      </span>
                      <h3 className="text-base font-bold text-white">{skillName}</h3>
                    </div>
                    {isVerified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300">
                        Self-Reported
                      </span>
                    )}
                  </div>

                  {/* Star rating for proficiency 1-5 */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Proficiency Level</span>
                      <span className="font-bold text-white">Level {sk.proficiency_level} / 5</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleUpdateProficiency(sk.skill_id, star)}
                          className={`p-1 rounded transition-transform hover:scale-110 ${
                            star <= sk.proficiency_level ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isVerified && (
                    <Link
                      href="/student/assessment"
                      className="w-full py-1.5 rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white text-xs font-bold text-center block transition-colors"
                    >
                      Take Verification MCQ
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Add Skill Form */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-cyan" />
              <span>Add New Skill</span>
            </h3>

            {message && (
              <div className="p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs">
                {message}
              </div>
            )}

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="">-- Choose Skill from Taxonomy --</option>
                  {availableSkillsToAdd.map((sk: any) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category?.name || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Proficiency Level (1-5)</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value={1}>1 - Beginner / Basic Awareness</option>
                  <option value={2}>2 - Elementary / Academic Knowledge</option>
                  <option value={3}>3 - Intermediate / Project Hands-On</option>
                  <option value={4}>4 - Advanced / Production Ready</option>
                  <option value={5}>5 - Expert / Architect</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={adding || !selectedSkill}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{adding ? 'Adding...' : 'Add Skill to Profile'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

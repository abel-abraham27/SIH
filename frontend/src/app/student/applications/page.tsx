'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, Briefcase } from 'lucide-react';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      try {
        const data = await apiRequest<any[]>('/applications/my');
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Fetching application pipeline...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Shortlisted</span>;
      case 'INTERVIEWING':
      case 'INTERVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">Interviewing</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Accepted & Hired</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Not Selected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Application Submitted</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Application Pipeline & Tracker</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Track real-time candidate shortlist & interview status across your submitted industry applications.
        </p>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No applications submitted yet.</p>
          </div>
        ) : (
          applications.map((app: any) => (
            <div key={app.id} className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                  <span className="text-xs text-slate-400">Applied on {new Date(app.applied_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{app.opportunity?.title || 'Role'}</h3>
                <p className="text-xs font-semibold text-brand-primary">{app.opportunity?.company_name || 'Company'}</p>
                {app.cover_letter && (
                  <p className="text-xs text-slate-400 line-clamp-2 bg-surface-subtle p-2.5 rounded-xl mt-2 italic">
                    &quot;{app.cover_letter}&quot;
                  </p>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-surface-border gap-2">
                <span className="text-xs text-slate-400">Deterministic Fit Score</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {app.match_score != null ? `${app.match_score.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


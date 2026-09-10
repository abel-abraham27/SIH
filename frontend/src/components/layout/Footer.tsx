import React from 'react';
import Link from 'next/link';
import { Sparkles, Award, Shield, Cpu, Github, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border bg-[#0a0d14] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">COGNIBRIDGE</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Next-generation Academia–Industry Collaboration & Skill Alignment Platform for Higher Education.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[11px] font-semibold text-brand-primary">
              <Award className="w-3.5 h-3.5" />
              <span>Smart India Hackathon 2026 Ready</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/student/skills" className="hover:text-white transition-colors">Skill Mapping & Verification</Link></li>
              <li><Link href="/student/skill-gap" className="hover:text-white transition-colors">Skill Gap Engine</Link></li>
              <li><Link href="/student/opportunities" className="hover:text-white transition-colors">Opportunity Matcher</Link></li>
              <li><Link href="/student/portfolio" className="hover:text-white transition-colors">Digital Skill Portfolios</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Stakeholders</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white transition-colors">Students & Graduates</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Industry Recruiters</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Faculty & Educators</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Institution Administrators</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Powered by FastAPI backend microservices, SQLAlchemy ORM, and Next.js 14 frontend with real-time match scoring.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://iitb.ac.in" target="_blank" rel="noreferrer" className="hover:text-white">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 COGNIBRIDGE — Intelligent Academia–Industry Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Grade JWT Auth</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-brand-cyan" /> Deterministic Matching Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sparkles, Mail, Lock, LogIn, GraduationCap, Briefcase, BookOpen, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Retrieve updated user from storage
      const user = JSON.parse(localStorage.getItem('cognibridge_user') || '{}');
      const routes = {
        STUDENT: '/student/dashboard',
        RECRUITER: '/recruiter/dashboard',
        FACULTY: '/faculty/dashboard',
        INSTITUTION_ADMIN: '/institution/dashboard',
      };
      router.push(routes[user.role as keyof typeof routes] || '/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'STUDENT' | 'RECRUITER' | 'FACULTY' | 'INSTITUTION_ADMIN') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      const routes = {
        STUDENT: '/student/dashboard',
        RECRUITER: '/recruiter/dashboard',
        FACULTY: '/faculty/dashboard',
        INSTITUTION_ADMIN: '/institution/dashboard',
      };
      router.push(routes[role]);
    } catch (err: any) {
      setError('Demo login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/20 text-brand-primary mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back to COGNIBRIDGE</h1>
          <p className="text-xs text-slate-400">Sign in to access your role-based dashboard</p>
        </div>

        {/* Quick Demo Selector */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Quick Demo Accounts (1-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemo('STUDENT')}
              className="px-3 py-2 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-primary text-xs font-semibold text-slate-200 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-brand-primary" />
              <span>Student Demo</span>
            </button>
            <button
              onClick={() => handleDemo('RECRUITER')}
              className="px-3 py-2 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-cyan text-xs font-semibold text-slate-200 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-brand-cyan" />
              <span>Recruiter Demo</span>
            </button>
            <button
              onClick={() => handleDemo('FACULTY')}
              className="px-3 py-2 rounded-lg bg-surface-subtle border border-surface-border hover:border-brand-violet text-xs font-semibold text-slate-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-violet" />
              <span>Faculty Demo</span>
            </button>
            <button
              onClick={() => handleDemo('INSTITUTION_ADMIN')}
              className="px-3 py-2 rounded-lg bg-surface-subtle border border-surface-border hover:border-emerald-400 text-xs font-semibold text-slate-200 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@cognibridge.demo"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-subtle border border-surface-border text-sm text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-subtle border border-surface-border text-sm text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-purple text-white font-bold text-sm shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="text-brand-primary font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

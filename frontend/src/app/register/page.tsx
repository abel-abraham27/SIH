'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';
import { Sparkles, Mail, Lock, User, UserPlus, GraduationCap, Briefcase, BookOpen } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
      });

      const routes = {
        STUDENT: '/student/dashboard',
        RECRUITER: '/recruiter/dashboard',
        FACULTY: '/faculty/dashboard',
        INSTITUTION_ADMIN: '/institution/dashboard',
      };
      router.push(routes[role]);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/20 text-brand-primary mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your COGNIBRIDGE Account</h1>
          <p className="text-xs text-slate-400">Join the academia–industry ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  role === 'STUDENT'
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-surface-border bg-surface-subtle text-slate-400'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  role === 'RECRUITER'
                    ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                    : 'border-surface-border bg-surface-subtle text-slate-400'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Recruiter</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('FACULTY')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  role === 'FACULTY'
                    ? 'border-brand-violet bg-brand-violet/10 text-brand-violet'
                    : 'border-surface-border bg-surface-subtle text-slate-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Faculty</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aryan Sharma"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-subtle border border-surface-border text-sm text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.edu"
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
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

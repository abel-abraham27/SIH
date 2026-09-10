'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Building2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'RECRUITER': return '/recruiter/dashboard';
      case 'FACULTY': return '/faculty/dashboard';
      case 'INSTITUTION_ADMIN': return '/institution/dashboard';
      default: return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple via-brand-primary to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight gradient-text">
                COGNIBRIDGE
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">
                Academia × Industry
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
            
            {user?.role === 'STUDENT' && (
              <>
                <Link href="/student/dashboard" className="hover:text-brand-primary transition-colors">Dashboard</Link>
                <Link href="/student/skills" className="hover:text-brand-primary transition-colors">Skills</Link>
                <Link href="/student/skill-gap" className="hover:text-brand-primary transition-colors">Skill Gap Engine</Link>
                <Link href="/student/opportunities" className="hover:text-brand-primary transition-colors">Opportunities</Link>
                <Link href="/student/applications" className="hover:text-brand-primary transition-colors">Applications</Link>
                <Link href="/student/portfolio" className="hover:text-brand-primary transition-colors">Portfolio</Link>
              </>
            )}

            {user?.role === 'RECRUITER' && (
              <>
                <Link href="/recruiter/dashboard" className="hover:text-brand-primary transition-colors">Recruiter Portal</Link>
              </>
            )}

            {user?.role === 'FACULTY' && (
              <>
                <Link href="/faculty/dashboard" className="hover:text-brand-primary transition-colors">Faculty Portal</Link>
              </>
            )}

            {user?.role === 'INSTITUTION_ADMIN' && (
              <>
                <Link href="/institution/dashboard" className="hover:text-brand-primary transition-colors">Analytics Portal</Link>
              </>
            )}
          </div>

          {/* Auth Button / User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href={getDashboardRoute()} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs font-semibold text-slate-200 hover:border-brand-primary transition-colors"
                >
                  {user.role === 'STUDENT' && <GraduationCap className="w-4 h-4 text-brand-primary" />}
                  {user.role === 'RECRUITER' && <Briefcase className="w-4 h-4 text-brand-cyan" />}
                  {user.role === 'FACULTY' && <BookOpen className="w-4 h-4 text-brand-violet" />}
                  {user.role === 'INSTITUTION_ADMIN' && <Building2 className="w-4 h-4 text-emerald-400" />}
                  <span>{user.full_name}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-brand-primary/20 text-brand-primary">
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-surface-subtle transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-brand-primary to-brand-purple text-white shadow-lg shadow-brand-primary/25 hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-surface-border px-4 pt-2 pb-6 space-y-3">
          <Link href="/" className="block py-2 text-slate-200">Home</Link>
          {user ? (
            <>
              <Link href={getDashboardRoute()} className="block py-2 text-brand-primary font-bold">
                Go to {user.role} Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  router.push('/');
                }}
                className="w-full text-left py-2 text-rose-400 font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" className="py-2 text-center rounded-lg bg-surface-subtle text-slate-200 font-semibold">
                Sign In
              </Link>
              <Link href="/register" className="py-2 text-center rounded-lg bg-brand-primary text-white font-semibold">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

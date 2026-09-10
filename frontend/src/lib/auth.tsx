'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '@/types';
import { apiRequest } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'STUDENT' | 'RECRUITER' | 'FACULTY' | 'INSTITUTION_ADMIN') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cognibridge_token');
    const savedUser = localStorage.getItem('cognibridge_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cognibridge_token');
        localStorage.removeItem('cognibridge_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(response.access_token);
      setUser(response.user);

      localStorage.setItem('cognibridge_token', response.access_token);
      localStorage.setItem('cognibridge_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'STUDENT' | 'RECRUITER' | 'FACULTY' | 'INSTITUTION_ADMIN') => {
    const demoEmails = {
      STUDENT: 'student@cognibridge.demo',
      RECRUITER: 'recruiter@cognibridge.demo',
      FACULTY: 'faculty@cognibridge.demo',
      INSTITUTION_ADMIN: 'admin@cognibridge.demo',
    };

    await login(demoEmails[role], 'Demo@123');
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setToken(response.access_token);
      setUser(response.user);

      localStorage.setItem('cognibridge_token', response.access_token);
      localStorage.setItem('cognibridge_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cognibridge_token');
    localStorage.removeItem('cognibridge_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, demoLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DemoAccount,
  UserRole,
  demoAccounts,
  homePathForRole,
  registerAccount,
  findAccount,
} from '@/lib/demoAccounts';

interface AuthContextValue {
  user: DemoAccount | null;
  role: UserRole | null;
  ready: boolean;
  login: (email: string, password: string, remember?: boolean) => DemoAccount | null;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => DemoAccount | null;
  switchAccount: (email: string) => void;
  logout: () => void;
  homePath: () => string;
}

const STORAGE_KEY = 'zoox-current-user';
const SESSION_KEY = 'zoox-current-user-session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoAccount;
        if (findAccount(parsed.email)) {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = (account: DemoAccount | null, remember = true) => {
    try {
      if (account) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
        else sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
      } else {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  };

  const login = (email: string, password: string, remember = true): DemoAccount | null => {
    const found = demoAccounts.find((a) => a.email === email && a.password === password) ?? null;
    if (found) {
      setUser(found);
      persist(found, remember);
    }
    return found;
  };

  const register = (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): DemoAccount | null => {
    const created = registerAccount(data);
    if (created) {
      setUser(created);
      persist(created);
    }
    return created;
  };

  const switchAccount = (email: string) => {
    const found = demoAccounts.find((a) => a.email === email) ?? null;
    if (found) {
      setUser(found);
      persist(found);
    }
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  const homePath = () => homePathForRole(user?.role ?? 'staff');

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        ready,
        login,
        register,
        switchAccount,
        logout,
        homePath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

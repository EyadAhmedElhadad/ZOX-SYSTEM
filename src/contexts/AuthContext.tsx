'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { homePathForRole } from '@/lib/auth-guards';
import { roleBadgeColors } from '@/lib/demoAccounts';
import type { Database } from '@/lib/supabase/types';

type UserRole = Database['public']['Tables']['profiles']['Row']['role'];

export interface ZooxUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  color: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthContextValue {
  user: ZooxUser | null;
  role: UserRole | null;
  ready: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<ZooxUser | null>;
  register: (data: RegisterData) => Promise<ZooxUser | null>;
  sendMagicLink: (email: string) => Promise<boolean>;
  switchAccount?: undefined;
  logout: () => Promise<void>;
  homePath: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toZooxUser(
  user: User,
  profile?: { full_name: string; phone: string; role: UserRole } | null
): ZooxUser {
  const role = (profile?.role ?? 'customer') as UserRole;
  return {
    id: user.id,
    name: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? user.email ?? 'User',
    email: user.email ?? '',
    phone: profile?.phone ?? (user.user_metadata?.phone as string) ?? '',
    role,
    color: roleBadgeColors[role],
  };
}

async function loadProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase
    .from('profiles')
    .select('full_name, phone, role')
    .eq('id', userId)
    .single();
  return data as { full_name: string; phone: string; role: UserRole } | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof loadProfile>>>(null);
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const supabase = getSupabaseBrowserClient();

    const applySession = async (nextSession: Session | null) => {
      setSession(nextSession);
      if (nextSession?.user) {
        const p = await loadProfile(nextSession.user.id);
        if (mounted.current) setProfile(p);
      } else if (mounted.current) {
        setProfile(null);
      }
      if (mounted.current) setReady(true);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = useMemo(
    () => (session?.user ? toZooxUser(session.user, profile) : null),
    [session, profile]
  );

  const login = useCallback(async (email: string, password: string): Promise<ZooxUser | null> => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return null;
    setSession(data.session);
    const p = await loadProfile(data.user.id);
    setProfile(p);
    return toZooxUser(data.user, p);
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<ZooxUser | null> => {
    const supabase = getSupabaseBrowserClient();
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name, phone: data.phone ?? '' } },
    });
    if (error || !res.user) return null;
    // Profile row is auto-created by the handle_new_user trigger.
    const p = res.session ? await loadProfile(res.user.id) : null;
    if (res.session) {
      setSession(res.session);
      setProfile(p);
    }
    return toZooxUser(res.user, p);
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<boolean> => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const homePath = useCallback(() => homePathForRole(user?.role ?? 'staff'), [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        ready,
        login,
        register,
        sendMagicLink,
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

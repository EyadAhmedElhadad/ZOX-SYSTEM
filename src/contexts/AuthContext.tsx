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

export type LoginResult =
  { ok: true; user: ZooxUser } | { ok: false; error: string; code?: string };

export type RegisterResult =
  { ok: true; user: ZooxUser } | { ok: false; error: string; code?: string };

interface AuthContextValue {
  user: ZooxUser | null;
  role: UserRole | null;
  ready: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  sendMagicLink: (email: string) => Promise<boolean>;
  switchAccount?: undefined;
  logout: () => Promise<void>;
  homePath: () => string;
}

function friendlyAuthError(error: { message?: string; code?: string } | null): string {
  const msg = (error?.message ?? '').toLowerCase();
  const code = error?.code;
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (code === 'user_not_found' || msg.includes('user not found')) {
    return 'No account was found with this email address.';
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('signup is disabled') || msg.includes('sign-ups not allowed')) {
    return 'Account registration is currently disabled.';
  }
  if (msg) return error?.message ?? 'Unable to sign in. Please try again.';
  return 'Unable to sign in. Please try again.';
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

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session || !data.user) {
        return { ok: false, error: friendlyAuthError(error), code: error?.code };
      }
      setSession(data.session);
      let p: Awaited<ReturnType<typeof loadProfile>> = null;
      try {
        p = await loadProfile(data.user.id);
      } catch {
        // Profile row may not exist yet; fall back to metadata.
      }
      setProfile(p);
      return { ok: true, user: toZooxUser(data.user, p) };
    } catch {
      return {
        ok: false,
        error: 'Network error — unable to reach the server. Check your connection.',
      };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<RegisterResult> => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: res, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name, phone: data.phone ?? '' } },
      });
      if (error || !res.user) {
        return { ok: false, error: friendlyAuthError(error), code: error?.code };
      }
      // Profile row is auto-created by the handle_new_user trigger.
      const p = res.session ? await loadProfile(res.user.id) : null;
      if (res.session) {
        setSession(res.session);
        setProfile(p);
      }
      return { ok: true, user: toZooxUser(res.user, p) };
    } catch {
      return {
        ok: false,
        error: 'Network error — unable to reach the server. Check your connection.',
      };
    }
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

export function useRole(): UserRole | null {
  return useAuth().role;
}

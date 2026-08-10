'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import BrandPanel from './BrandPanel';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPageContent() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const { user, ready, homePath } = useAuth();

  useEffect(() => {
    if (ready && user) {
      router.replace(homePath());
    }
  }, [ready, user, homePath, router]);

  if (ready && user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center px-6 py-12 min-h-screen">
        <div className="w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm onSwitchToSignUp={() => setMode('signup')} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}

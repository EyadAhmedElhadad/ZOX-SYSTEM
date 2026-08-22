'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessRoute, homePathForRole } from '@/lib/demoAccounts';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  role?: 'owner' | 'manager' | 'staff' | 'customer';
}

export default function AppLayout({ children, currentPath, role = 'staff' }: AppLayoutProps) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/sign-up-login-screen');
      return;
    }
    if (!canAccessRoute(user.role, currentPath)) {
      router.replace(homePathForRole(user.role));
    }
  }, [user, ready, role, currentPath, router]);

  if (!ready) return null;
  if (!user) return null;
  if (!canAccessRoute(user.role, currentPath)) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath={currentPath} role={role} />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}

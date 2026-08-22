import type { UserRole } from '@/lib/supabase/types';

export const PUBLIC_ROUTES = ['/sign-up-login-screen'];

export const CUSTOMER_ROUTES = [
  '/customer-dashboard',
  '/reservations',
  '/loyalty',
  '/customers',
  '/settings',
];

export const STAFF_ROUTES = [
  '/',
  '/staff-dashboard',
  '/reservations',
  '/live-sessions',
  '/customers',
  '/waiting-list',
  '/sales',
  '/inventory',
  '/hardware',
  '/lost-found',
];

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true;
  if (role === 'customer') return CUSTOMER_ROUTES.includes(path);
  if (role === 'staff') return STAFF_ROUTES.includes(path);
  return true;
}

export function homePathForRole(role: UserRole): string {
  return role === 'customer' ? '/customer-dashboard' : '/';
}

export function loginPath(): string {
  return '/sign-up-login-screen';
}

export function initialsFor(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

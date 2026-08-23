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
];

export const MANAGER_ROUTES = [
  ...STAFF_ROUTES,
  '/inventory',
  '/rooms',
  '/reports',
  '/hardware',
  '/lost-found',
];

export const OWNER_ROUTES = [
  ...MANAGER_ROUTES,
  '/sales',
  '/expenses',
  '/staff',
  '/staff-attendance',
  '/loyalty',
  '/feedback',
  '/audit-logs',
  '/settings',
  '/maintenance',
];

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true;
  if (role === 'customer') return CUSTOMER_ROUTES.includes(path);
  if (role === 'staff') return STAFF_ROUTES.includes(path);
  if (role === 'manager') return MANAGER_ROUTES.includes(path);
  if (role === 'owner') return OWNER_ROUTES.includes(path);
  // Unknown/unexpected role -> fail closed (consistent with middleware.ts).
  return false;
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

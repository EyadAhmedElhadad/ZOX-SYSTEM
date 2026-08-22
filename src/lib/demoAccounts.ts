export type UserRole = 'owner' | 'manager' | 'staff' | 'customer';

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  color: string;
}

export const demoAccounts: DemoAccount[] = [
  {
    name: 'Ahmed Hassan',
    email: 'owner@zoox-ps.com',
    password: 'ZooxOwner@2026',
    role: 'owner',
    color: 'text-warning',
  },
  {
    name: 'Omar Saleh',
    email: 'manager@zoox-ps.com',
    password: 'ZooxMgr@2026',
    role: 'manager',
    color: 'text-info',
  },
  {
    name: 'Karim Adel',
    email: 'staff@zoox-ps.com',
    password: 'ZooxStaff@2026',
    role: 'staff',
    color: 'text-accent',
  },
  {
    name: 'Ahmed Khalil',
    email: 'ahmed.k@gmail.com',
    password: 'AhmedK@2026',
    role: 'customer',
    color: 'text-primary',
  },
];

const REGISTERED_KEY = 'zoox-registered-accounts';

export function loadRegisteredAccounts(): DemoAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    if (raw) return JSON.parse(raw) as DemoAccount[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveRegisteredAccounts(accounts: DemoAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

export function findAccount(email: string): DemoAccount | undefined {
  return (
    demoAccounts.find((a) => a.email === email) ??
    loadRegisteredAccounts().find((a) => a.email === email)
  );
}

export function registerAccount(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): DemoAccount | null {
  const exists = findAccount(data.email);
  if (exists) return null;
  const account: DemoAccount = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'customer',
    color: 'text-primary',
  };
  const next = [account, ...loadRegisteredAccounts()];
  saveRegisteredAccounts(next);
  return account;
}

export const roleLabels: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
  customer: 'Customer',
};

export const roleBadgeColors: Record<UserRole, string> = {
  owner: 'text-warning',
  manager: 'text-info',
  staff: 'text-accent',
  customer: 'text-primary',
};

export function homePathForRole(role: UserRole): string {
  return role === 'customer' ? '/customer-dashboard' : '/';
}

const CUSTOMER_ROUTES = [
  '/customer-dashboard',
  '/reservations',
  '/loyalty',
  '/customers',
  '/settings',
];

const STAFF_ROUTES = [
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
  if (role === 'customer') return CUSTOMER_ROUTES.includes(path);
  if (role === 'staff') return STAFF_ROUTES.includes(path);
  return true;
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

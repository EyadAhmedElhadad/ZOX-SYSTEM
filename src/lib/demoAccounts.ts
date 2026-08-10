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

export function initialsFor(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export interface LoyaltyMember {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  visits: number;
  joinDate: string;
  lastActivity: string;
  status: 'Active' | 'Inactive';
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
  enabled: boolean;
}

const MEMBERS_KEY = 'zoox-loyalty-members';
const REWARDS_KEY = 'zoox-loyalty-rewards';

export const seedMembers: LoyaltyMember[] = [
  {
    id: 'loy-001',
    name: 'Ahmed Khalil',
    phone: '0100-xxx-4521',
    points: 3240,
    tier: 'Gold',
    visits: 34,
    joinDate: '2025-06-12',
    lastActivity: '2026-08-13',
    status: 'Active',
  },
  {
    id: 'loy-002',
    name: 'Omar Nasser',
    phone: '0111-xxx-2267',
    points: 5220,
    tier: 'VIP',
    visits: 48,
    joinDate: '2025-02-01',
    lastActivity: '2026-08-13',
    status: 'Active',
  },
  {
    id: 'loy-003',
    name: 'Sara Mostafa',
    phone: '0112-xxx-8834',
    points: 1860,
    tier: 'Silver',
    visits: 21,
    joinDate: '2025-09-20',
    lastActivity: '2026-08-12',
    status: 'Active',
  },
  {
    id: 'loy-004',
    name: 'Youssef Mahmoud',
    phone: '0115-xxx-3312',
    points: 2580,
    tier: 'Gold',
    visits: 27,
    joinDate: '2025-07-08',
    lastActivity: '2026-08-11',
    status: 'Active',
  },
  {
    id: 'loy-005',
    name: 'Mariam El-Sayed',
    phone: '0106-xxx-7741',
    points: 870,
    tier: 'Silver',
    visits: 12,
    joinDate: '2026-01-15',
    lastActivity: '2026-08-10',
    status: 'Active',
  },
  {
    id: 'loy-006',
    name: 'Hassan Nour',
    phone: '0103-xxx-9901',
    points: 590,
    tier: 'Bronze',
    visits: 8,
    joinDate: '2026-03-22',
    lastActivity: '2026-08-08',
    status: 'Inactive',
  },
];

export const seedRewards: Reward[] = [
  {
    id: 'rw-001',
    name: 'Free Drink',
    description: 'Any drink from the café menu up to 35 EGP.',
    cost: 500,
    emoji: '🥤',
    enabled: true,
  },
  {
    id: 'rw-002',
    name: '30 Min Extra',
    description: '30 minutes added to your current session.',
    cost: 800,
    emoji: '⏱️',
    enabled: true,
  },
  {
    id: 'rw-003',
    name: 'Free 1-Hour Session',
    description: '1 hour in any standard room.',
    cost: 2000,
    emoji: '🎮',
    enabled: true,
  },
  {
    id: 'rw-004',
    name: 'VIP Room Upgrade',
    description: 'Upgrade a session to a VIP room.',
    cost: 3000,
    emoji: '💎',
    enabled: true,
  },
  {
    id: 'rw-005',
    name: '10% Member Discount',
    description: '10% off a single café order.',
    cost: 1200,
    emoji: '🏷️',
    enabled: false,
  },
];

export function loadMembers(): LoyaltyMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (raw) return JSON.parse(raw) as LoyaltyMember[];
  } catch {
    /* ignore */
  }
  return seedMembers;
}

export function saveMembers(members: LoyaltyMember[]): void {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  } catch {
    /* ignore */
  }
}

export function loadRewards(): Reward[] {
  try {
    const raw = localStorage.getItem(REWARDS_KEY);
    if (raw) return JSON.parse(raw) as Reward[];
  } catch {
    /* ignore */
  }
  return seedRewards;
}

export function saveRewards(rewards: Reward[]): void {
  try {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
  } catch {
    /* ignore */
  }
}

export function addMember(
  data: Omit<
    LoyaltyMember,
    'id' | 'points' | 'tier' | 'visits' | 'joinDate' | 'lastActivity' | 'status'
  >
): LoyaltyMember[] {
  const next: LoyaltyMember[] = [
    {
      ...data,
      id: `loy-${Date.now()}`,
      points: 0,
      tier: 'Bronze',
      visits: 0,
      joinDate: new Date().toISOString().slice(0, 10),
      lastActivity: '—',
      status: 'Active',
    },
    ...loadMembers(),
  ];
  saveMembers(next);
  return next;
}

export function tierForPoints(points: number): LoyaltyMember['tier'] {
  if (points >= 5000) return 'VIP';
  if (points >= 2000) return 'Gold';
  if (points >= 800) return 'Silver';
  return 'Bronze';
}

export function adjustPoints(id: string, delta: number): LoyaltyMember[] {
  const next = loadMembers().map((m) => {
    if (m.id !== id) return m;
    const points = Math.max(0, m.points + delta);
    return { ...m, points, tier: tierForPoints(points) };
  });
  saveMembers(next);
  return next;
}

export function updateReward(id: string, patch: Partial<Reward>): Reward[] {
  const next = loadRewards().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveRewards(next);
  return next;
}

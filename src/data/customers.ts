export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  lastVisit: string;
  notes: string;
}

const STORAGE_KEY = 'zoox-customers';

export const seedCustomers: Customer[] = [
  {
    id: 'cus-001',
    name: 'Ahmed Khalil',
    phone: '0100-xxx-4521',
    email: 'ahmed.k@gmail.com',
    visits: 34,
    totalSpent: 5400,
    loyaltyPoints: 3240,
    tier: 'Gold',
    lastVisit: '2026-08-13',
    notes: 'Prefers FC 26 and energy drinks.',
  },
  {
    id: 'cus-002',
    name: 'Sara Mostafa',
    phone: '0112-xxx-8834',
    email: 'sara.m@gmail.com',
    visits: 21,
    totalSpent: 3100,
    loyaltyPoints: 1860,
    tier: 'Silver',
    lastVisit: '2026-08-12',
    notes: 'Weekend regular with friends.',
  },
  {
    id: 'cus-003',
    name: 'Omar Nasser',
    phone: '0111-xxx-2267',
    email: 'omar.n@gmail.com',
    visits: 48,
    totalSpent: 8700,
    loyaltyPoints: 5220,
    tier: 'VIP',
    lastVisit: '2026-08-13',
    notes: 'Books VIP room every Friday.',
  },
  {
    id: 'cus-004',
    name: 'Mariam El-Sayed',
    phone: '0106-xxx-7741',
    email: 'mariam.e@gmail.com',
    visits: 12,
    totalSpent: 1450,
    loyaltyPoints: 870,
    tier: 'Bronze',
    lastVisit: '2026-08-10',
    notes: 'Café regular, enjoys PES 2024.',
  },
  {
    id: 'cus-005',
    name: 'Youssef Mahmoud',
    phone: '0115-xxx-3312',
    email: 'youssef.m@gmail.com',
    visits: 27,
    totalSpent: 4300,
    loyaltyPoints: 2580,
    tier: 'Gold',
    lastVisit: '2026-08-11',
    notes: 'Billiards fan, brings groups.',
  },
  {
    id: 'cus-006',
    name: 'Hassan Nour',
    phone: '0103-xxx-9901',
    email: 'hassan.n@gmail.com',
    visits: 8,
    totalSpent: 980,
    loyaltyPoints: 590,
    tier: 'Bronze',
    lastVisit: '2026-08-08',
    notes: 'New customer, likes Call of Duty.',
  },
];

export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Customer[];
  } catch {
    /* ignore */
  }
  return seedCustomers;
}

export function saveCustomers(entries: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function tierForPoints(points: number): Customer['tier'] {
  if (points >= 5000) return 'VIP';
  if (points >= 2000) return 'Gold';
  if (points >= 800) return 'Silver';
  return 'Bronze';
}

export function addCustomer(
  data: Omit<Customer, 'id' | 'visits' | 'totalSpent' | 'loyaltyPoints' | 'tier' | 'lastVisit'>
): Customer[] {
  const next: Customer[] = [
    {
      ...data,
      id: `cus-${Date.now()}`,
      visits: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      tier: 'Bronze',
      lastVisit: '—',
    },
    ...loadCustomers(),
  ];
  saveCustomers(next);
  return next;
}

export function updateCustomer(id: string, patch: Partial<Customer>): Customer[] {
  const next = loadCustomers().map((c) =>
    c.id === id
      ? { ...c, ...patch, tier: tierForPoints(patch.loyaltyPoints ?? c.loyaltyPoints) }
      : c
  );
  saveCustomers(next);
  return next;
}

export function deleteCustomer(id: string): Customer[] {
  const next = loadCustomers().filter((c) => c.id !== id);
  saveCustomers(next);
  return next;
}

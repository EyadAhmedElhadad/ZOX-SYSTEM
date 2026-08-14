export type ItemCategory = 'Phone' | 'Wallet' | 'Accessory' | 'Clothing' | 'Other';
export type ItemStatus = 'Unclaimed' | 'Returned' | 'Disposed';

export interface LostFoundItem {
  id: string;
  description: string;
  category: ItemCategory;
  foundLocation: string;
  foundBy: string;
  foundAt: string;
  status: ItemStatus;
  claimedBy: string;
  claimedAt: string;
  notes: string;
}

const STORAGE_KEY = 'zoox-lost-found';

export const seedLostFound: LostFoundItem[] = [
  {
    id: 'lf-001',
    description: 'Samsung Galaxy A54 - black case',
    category: 'Phone',
    foundLocation: 'Room 3',
    foundBy: 'Karim Adel',
    foundAt: '2026-08-13 19:45',
    status: 'Unclaimed',
    claimedBy: '',
    claimedAt: '',
    notes: 'Locked with a cracked screen protector.',
  },
  {
    id: 'lf-002',
    description: 'Black leather wallet',
    category: 'Wallet',
    foundLocation: 'Café Counter',
    foundBy: 'Sara Mahmoud',
    foundAt: '2026-08-12 21:10',
    status: 'Returned',
    claimedBy: 'Ahmed Khalil',
    claimedAt: '2026-08-12 22:00',
    notes: 'Returned after verifying ID.',
  },
  {
    id: 'lf-003',
    description: 'PS5 headset - black',
    category: 'Accessory',
    foundLocation: 'Room 6',
    foundBy: 'Tarek Nabil',
    foundAt: '2026-08-12 16:30',
    status: 'Unclaimed',
    claimedBy: '',
    claimedAt: '',
    notes: '',
  },
  {
    id: 'lf-004',
    description: 'Blue hoodie, size L',
    category: 'Clothing',
    foundLocation: 'Waiting Area',
    foundBy: 'Sara Mahmoud',
    foundAt: '2026-08-11 23:05',
    status: 'Unclaimed',
    claimedBy: '',
    claimedAt: '',
    notes: 'Stored in lost & found locker.',
  },
  {
    id: 'lf-005',
    description: 'Car keys - Honda',
    category: 'Other',
    foundLocation: 'Parking Entrance',
    foundBy: 'Youssef Adel',
    foundAt: '2026-08-10 20:20',
    status: 'Disposed',
    claimedBy: '',
    claimedAt: '',
    notes: 'Unclaimed for 60 days, disposed per policy.',
  },
];

export function loadLostFound(): LostFoundItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LostFoundItem[];
  } catch {
    /* ignore */
  }
  return seedLostFound;
}

export function saveLostFound(items: LostFoundItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function addLostFound(
  data: Omit<LostFoundItem, 'id' | 'status' | 'claimedBy' | 'claimedAt'>
): LostFoundItem[] {
  const next: LostFoundItem[] = [
    {
      ...data,
      id: `lf-${Date.now()}`,
      status: 'Unclaimed',
      claimedBy: '',
      claimedAt: '',
    },
    ...loadLostFound(),
  ];
  saveLostFound(next);
  return next;
}

export function updateLostFound(id: string, patch: Partial<LostFoundItem>): LostFoundItem[] {
  const next = loadLostFound().map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveLostFound(next);
  return next;
}

export function claimItem(id: string, claimedBy: string): LostFoundItem[] {
  const next = loadLostFound().map<LostFoundItem>((item) =>
    item.id === id
      ? {
          ...item,
          status: 'Returned' as ItemStatus,
          claimedBy,
          claimedAt: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      : item
  );
  saveLostFound(next);
  return next;
}

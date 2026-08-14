export interface WaitingEntry {
  id: string;
  name: string;
  partySize: number;
  roomPreference: string;
  game?: string;
  phone?: string;
  joinedAt: string;
  status: 'Waiting' | 'Notified' | 'Seated' | 'Cancelled';
  notifiedAt?: string;
  seatedRoom?: string;
  notes?: string;
}

const STORAGE_KEY = 'zoox-waiting-list';

export const seedWaiting: WaitingEntry[] = [
  {
    id: 'wq-001',
    name: 'Adel Fathy',
    partySize: 2,
    roomPreference: 'Standard',
    game: 'FC 26',
    phone: '0102-xxx-1190',
    joinedAt: '2026-08-13 18:05',
    status: 'Waiting',
  },
  {
    id: 'wq-002',
    name: 'Mona & Farah',
    partySize: 4,
    roomPreference: 'Premium',
    game: 'GTA V',
    phone: '0114-xxx-8820',
    joinedAt: '2026-08-13 18:22',
    status: 'Waiting',
  },
  {
    id: 'wq-003',
    name: 'Ramy Tarek',
    partySize: 2,
    roomPreference: 'Any',
    phone: '0107-xxx-3345',
    joinedAt: '2026-08-13 18:31',
    status: 'Waiting',
  },
  {
    id: 'wq-004',
    name: 'Sherif Adel',
    partySize: 3,
    roomPreference: 'Standard',
    game: 'PES 2024',
    phone: '0110-xxx-2211',
    joinedAt: '2026-08-13 18:40',
    status: 'Notified',
  },
];

export function loadWaiting(): WaitingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as WaitingEntry[];
  } catch {
    /* ignore */
  }
  return seedWaiting;
}

export function saveWaiting(entries: WaitingEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function addWaiting(data: Omit<WaitingEntry, 'id' | 'joinedAt' | 'status'>): WaitingEntry[] {
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const next: WaitingEntry[] = [
    { ...data, id: `wq-${Date.now()}`, joinedAt: now, status: 'Waiting' },
    ...loadWaiting(),
  ];
  saveWaiting(next);
  return next;
}

export function updateWaiting(id: string, patch: Partial<WaitingEntry>): WaitingEntry[] {
  const next = loadWaiting().map((w) => (w.id === id ? { ...w, ...patch } : w));
  saveWaiting(next);
  return next;
}

export function notifyWaiting(id: string): WaitingEntry[] {
  const now = new Date().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return updateWaiting(id, { status: 'Notified', notifiedAt: now });
}

export function removeWaiting(id: string): WaitingEntry[] {
  const next = loadWaiting().filter((w) => w.id !== id);
  saveWaiting(next);
  return next;
}

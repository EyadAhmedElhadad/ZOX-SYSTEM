export interface FeedbackEntry {
  id: string;
  customer: string;
  game: string;
  room: string;
  date: string;
  time: string;
  rating: number;
  tags: string[];
  notes: string;
  submittedAt: string;
  status: 'new' | 'reviewed';
}

const STORAGE_KEY = 'zoox-feedback';

const seedFeedback: FeedbackEntry[] = [
  {
    id: 'fb-001',
    customer: 'Ahmed Khalil',
    game: 'FC 26',
    room: 'Room 2',
    date: '2026-08-05',
    time: '17:30',
    rating: 5,
    tags: ['Great staff', 'Clean room', 'Fast start'],
    notes: 'Best place to play in the area. Controllers were in perfect condition.',
    submittedAt: '2026-08-05T18:10:00.000Z',
    status: 'new',
  },
  {
    id: 'fb-002',
    customer: 'Sara Mostafa',
    game: 'Call of Duty',
    room: 'Room 5',
    date: '2026-08-04',
    time: '19:00',
    rating: 4,
    tags: ['Good atmosphere', 'Clean room'],
    notes: 'Great session, the headset had a bit of static but overall very good.',
    submittedAt: '2026-08-04T20:25:00.000Z',
    status: 'new',
  },
  {
    id: 'fb-003',
    customer: 'Omar Nasser',
    game: 'GTA V',
    room: 'Room 8',
    date: '2026-08-03',
    time: '21:00',
    rating: 3,
    tags: ['Noise issues'],
    notes: 'The room next to us was very loud. Soundproofing needs improvement.',
    submittedAt: '2026-08-03T22:40:00.000Z',
    status: 'reviewed',
  },
  {
    id: 'fb-004',
    customer: 'Mariam El-Sayed',
    game: 'PES 2024',
    room: 'Room 1',
    date: '2026-08-01',
    time: '16:30',
    rating: 5,
    tags: ['Great staff', 'Fast start', 'Good atmosphere'],
    notes: 'Loved it! Staff were super friendly and the console started instantly.',
    submittedAt: '2026-08-01T17:50:00.000Z',
    status: 'reviewed',
  },
];

export function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FeedbackEntry[];
  } catch {
    /* ignore */
  }
  return seedFeedback;
}

export function saveFeedback(entries: FeedbackEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function addFeedback(
  entry: Omit<FeedbackEntry, 'id' | 'submittedAt' | 'status'>
): FeedbackEntry[] {
  const current = loadFeedback();
  const next: FeedbackEntry[] = [
    {
      ...entry,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'new',
    },
    ...current,
  ];
  saveFeedback(next);
  return next;
}

export function updateFeedbackStatus(id: string, status: 'new' | 'reviewed'): FeedbackEntry[] {
  const next = loadFeedback().map((f) => (f.id === id ? { ...f, status } : f));
  saveFeedback(next);
  return next;
}

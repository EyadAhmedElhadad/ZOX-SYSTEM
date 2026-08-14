export interface Room {
  id: string;
  name: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  capacity: number;
  controllers: number;
  hourlyRate: number;
  psModel: string;
  customer?: string;
}

const STORAGE_KEY = 'zoox-rooms';

export const seedRooms: Room[] = [
  {
    id: 'rm-01',
    name: 'Room 1',
    roomType: 'Standard',
    status: 'Occupied',
    capacity: 2,
    controllers: 2,
    hourlyRate: 80,
    psModel: 'PS5',
    customer: 'Mohamed Khalil',
  },
  {
    id: 'rm-02',
    name: 'Room 2',
    roomType: 'Standard',
    status: 'Occupied',
    capacity: 4,
    controllers: 4,
    hourlyRate: 120,
    psModel: 'PS5',
    customer: 'Ahmed Samir & Group',
  },
  {
    id: 'rm-03',
    name: 'Room 3',
    roomType: 'Standard',
    status: 'Available',
    capacity: 2,
    controllers: 2,
    hourlyRate: 80,
    psModel: 'PS5',
  },
  {
    id: 'rm-04',
    name: 'Room 4',
    roomType: 'VIP',
    status: 'Occupied',
    capacity: 6,
    controllers: 6,
    hourlyRate: 200,
    psModel: 'PS5 Pro',
    customer: 'Karim Mostafa',
  },
  {
    id: 'rm-05',
    name: 'Room 5',
    roomType: 'Standard',
    status: 'Reserved',
    capacity: 2,
    controllers: 2,
    hourlyRate: 80,
    psModel: 'PS5',
  },
  {
    id: 'rm-06',
    name: 'Room 6',
    roomType: 'Premium',
    status: 'Occupied',
    capacity: 2,
    controllers: 2,
    hourlyRate: 100,
    psModel: 'PS5',
    customer: 'Youssef Mahmoud',
  },
  {
    id: 'rm-07',
    name: 'Room 7',
    roomType: 'Premium',
    status: 'Available',
    capacity: 2,
    controllers: 2,
    hourlyRate: 100,
    psModel: 'PS5',
  },
  {
    id: 'rm-08',
    name: 'Room 8',
    roomType: 'Standard',
    status: 'Maintenance',
    capacity: 2,
    controllers: 2,
    hourlyRate: 80,
    psModel: 'PS4',
  },
  {
    id: 'rm-09',
    name: 'Room 9',
    roomType: 'Standard',
    status: 'Occupied',
    capacity: 2,
    controllers: 2,
    hourlyRate: 80,
    psModel: 'PS5',
    customer: 'Hassan Nour',
  },
  {
    id: 'rm-10',
    name: 'Room 10',
    roomType: 'Premium',
    status: 'Occupied',
    capacity: 2,
    controllers: 2,
    hourlyRate: 100,
    psModel: 'PS5',
    customer: 'Sara & Nadia',
  },
];

export function loadRooms(): Room[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Room[];
  } catch {
    /* ignore */
  }
  return seedRooms;
}

export function saveRooms(rooms: Room[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    /* ignore */
  }
}

export function updateRoom(id: string, patch: Partial<Room>): Room[] {
  const next = loadRooms().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveRooms(next);
  return next;
}

export function addRoom(data: Omit<Room, 'id'>): Room[] {
  const next: Room[] = [
    { ...data, id: `rm-${String(loadRooms().length + 1).padStart(2, '0')}` },
    ...loadRooms(),
  ];
  saveRooms(next);
  return next;
}

export type HardwareType = 'Console' | 'Controller' | 'Headset' | 'Monitor' | 'Cable';
export type HardwareStatus = 'In Use' | 'Available' | 'Maintenance' | 'Retired';

export interface HardwareItem {
  id: string;
  name: string;
  type: HardwareType;
  model: string;
  serial: string;
  location: string;
  room: string;
  status: HardwareStatus;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  purchaseDate: string;
  lastServiced: string;
  notes: string;
}

const STORAGE_KEY = 'zoox-hardware';

export const seedHardware: HardwareItem[] = [
  {
    id: 'hw-001',
    name: 'PS5 Console',
    type: 'Console',
    model: 'PS5 Standard',
    serial: 'PS5-0001',
    location: 'Room 1',
    room: 'Room 1',
    status: 'In Use',
    condition: 'Excellent',
    purchaseDate: '2025-03-15',
    lastServiced: '2026-07-20',
    notes: '',
  },
  {
    id: 'hw-002',
    name: 'DualSense Controller',
    type: 'Controller',
    model: 'DualSense White',
    serial: 'CTR-01',
    location: 'Room 1',
    room: 'Room 1',
    status: 'In Use',
    condition: 'Good',
    purchaseDate: '2025-03-15',
    lastServiced: '2026-08-01',
    notes: 'Slight stick drift on left analog.',
  },
  {
    id: 'hw-003',
    name: 'DualSense Controller',
    type: 'Controller',
    model: 'DualSense Black',
    serial: 'CTR-13',
    location: 'Room 4',
    room: 'Room 4',
    status: 'Available',
    condition: 'Excellent',
    purchaseDate: '2025-06-01',
    lastServiced: '2026-07-25',
    notes: '',
  },
  {
    id: 'hw-004',
    name: 'Pulse 3D Headset',
    type: 'Headset',
    model: 'Pulse 3D White',
    serial: 'HDS-021',
    location: 'Room 4',
    room: 'Room 4',
    status: 'Maintenance',
    condition: 'Fair',
    purchaseDate: '2025-04-10',
    lastServiced: '2026-06-15',
    notes: 'Ear cushion replacement needed.',
  },
  {
    id: 'hw-005',
    name: 'LG UltraGear Monitor',
    type: 'Monitor',
    model: 'LG 27" 144Hz',
    serial: 'MON-004',
    location: 'Room 8',
    room: 'Room 8',
    status: 'Maintenance',
    condition: 'Poor',
    purchaseDate: '2024-09-01',
    lastServiced: '2026-05-10',
    notes: 'Backlight flicker - awaiting spare part.',
  },
  {
    id: 'hw-006',
    name: 'HDMI Cable 2m',
    type: 'Cable',
    model: 'High-speed',
    serial: 'CBL-102',
    location: 'Store',
    room: 'Store',
    status: 'Available',
    condition: 'Excellent',
    purchaseDate: '2025-11-20',
    lastServiced: '—',
    notes: '',
  },
  {
    id: 'hw-007',
    name: 'PS5 Pro Console',
    type: 'Console',
    model: 'PS5 Pro',
    serial: 'PS5P-0001',
    location: 'Room 4',
    room: 'Room 4',
    status: 'In Use',
    condition: 'Excellent',
    purchaseDate: '2026-01-15',
    lastServiced: '2026-08-02',
    notes: '',
  },
];

export function loadHardware(): HardwareItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as HardwareItem[];
  } catch {
    /* ignore */
  }
  return seedHardware;
}

export function saveHardware(items: HardwareItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function addHardware(data: Omit<HardwareItem, 'id'>): HardwareItem[] {
  const next: HardwareItem[] = [{ ...data, id: `hw-${String(Date.now())}` }, ...loadHardware()];
  saveHardware(next);
  return next;
}

export function updateHardware(id: string, patch: Partial<HardwareItem>): HardwareItem[] {
  const next = loadHardware().map((h) => (h.id === id ? { ...h, ...patch } : h));
  saveHardware(next);
  return next;
}

export function deleteHardware(id: string): HardwareItem[] {
  const next = loadHardware().filter((h) => h.id !== id);
  saveHardware(next);
  return next;
}

import type { SessionProduct } from './sessions';

export type ZoneType = 'playstation' | 'billiards' | 'cafe';

export interface ZoneSession {
  id: string;
  zoneName: string;
  zoneType: ZoneType;
  emoji: string;
  customer: string;
  players: number;
  hourlyRate: number;
  sessionType: 'open' | 'fixed';
  fixedDurationMinutes?: number;
  extendedMinutes?: number;
  products: SessionProduct[];
  status: 'active' | 'idle';
}

const cafeTables: ZoneSession[] = Array.from({ length: 10 }, (_, i) => ({
  id: `zone-cf${i + 1}`,
  zoneName: `Cafe Table ${i + 1}`,
  zoneType: 'cafe',
  emoji: '☕',
  customer: 'Available',
  players: 0,
  hourlyRate: 0,
  sessionType: 'open',
  products: [],
  status: 'idle',
}));

export const ZONES: ZoneSession[] = [
  {
    id: 'zone-ps',
    zoneName: 'PlayStation (Room)',
    zoneType: 'playstation',
    emoji: '🎮',
    customer: 'Mohamed Khalil',
    players: 2,
    hourlyRate: 80,
    sessionType: 'open',
    products: [{ id: 'zp-001', name: 'Pepsi', price: 25, qty: 2 }],
    status: 'active',
  },
  {
    id: 'zone-b1',
    zoneName: 'Billiards Table 1',
    zoneType: 'billiards',
    emoji: '🎱',
    customer: 'Tarek Elsaid',
    players: 2,
    hourlyRate: 60,
    sessionType: 'fixed',
    fixedDurationMinutes: 60,
    products: [{ id: 'zb1-001', name: 'Water', price: 15, qty: 1 }],
    status: 'active',
  },
  {
    id: 'zone-b2',
    zoneName: 'Billiards Table 2',
    zoneType: 'billiards',
    emoji: '🎱',
    customer: 'Available',
    players: 0,
    hourlyRate: 60,
    sessionType: 'open',
    products: [],
    status: 'idle',
  },
  ...cafeTables,
];

import type { SessionProduct } from './sessions';

export interface SaleItem {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  qty: number;
}

export interface Sale {
  id: string;
  customer: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Wallet';
  date: string;
  time: string;
}

export type { SessionProduct };

const STORAGE_KEY = 'zoox-sales';

export const seedSales: Sale[] = [
  {
    id: 'sl-001',
    customer: 'Walk-in',
    items: [
      { id: 'cat-001', name: 'Pepsi', category: 'Drinks', price: 25, emoji: '🥤', qty: 2 },
      { id: 'cat-007', name: 'Chocolate', category: 'Snacks', price: 25, emoji: '🍫', qty: 1 },
    ],
    subtotal: 75,
    tax: 10.5,
    total: 85.5,
    paymentMethod: 'Cash',
    date: '2026-08-13',
    time: '18:24',
  },
  {
    id: 'sl-002',
    customer: 'Walk-in',
    items: [{ id: 'cat-005', name: 'Chips', category: 'Snacks', price: 20, emoji: '🍟', qty: 3 }],
    subtotal: 60,
    tax: 8.4,
    total: 68.4,
    paymentMethod: 'Card',
    date: '2026-08-13',
    time: '19:05',
  },
  {
    id: 'sl-003',
    customer: 'Walk-in',
    items: [
      { id: 'cat-009', name: 'Sandwich', category: 'Food', price: 50, emoji: '🥪', qty: 2 },
      { id: 'cat-002', name: 'Water', category: 'Drinks', price: 15, emoji: '💧', qty: 2 },
    ],
    subtotal: 130,
    tax: 18.2,
    total: 148.2,
    paymentMethod: 'Wallet',
    date: '2026-08-13',
    time: '20:12',
  },
];

export function loadSales(): Sale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Sale[];
  } catch {
    /* ignore */
  }
  return seedSales;
}

export function saveSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  } catch {
    /* ignore */
  }
}

export function addSale(sale: Omit<Sale, 'id'>): Sale[] {
  const next: Sale[] = [{ ...sale, id: `sl-${Date.now()}` }, ...loadSales()];
  saveSales(next);
  return next;
}

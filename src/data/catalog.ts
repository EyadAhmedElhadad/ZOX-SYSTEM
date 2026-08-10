export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
}

export const catalogProducts: CatalogProduct[] = [
  { id: 'cat-001', name: 'Pepsi', category: 'Drinks', price: 25, emoji: '🥤' },
  { id: 'cat-002', name: 'Water', category: 'Drinks', price: 15, emoji: '💧' },
  { id: 'cat-003', name: 'Juice', category: 'Drinks', price: 35, emoji: '🧃' },
  { id: 'cat-004', name: 'Energy Drink', category: 'Drinks', price: 45, emoji: '⚡' },
  { id: 'cat-005', name: 'Chips', category: 'Snacks', price: 20, emoji: '🍟' },
  { id: 'cat-006', name: 'Indomie', category: 'Food', price: 30, emoji: '🍜' },
  { id: 'cat-007', name: 'Chocolate', category: 'Snacks', price: 25, emoji: '🍫' },
  { id: 'cat-008', name: 'Popcorn', category: 'Snacks', price: 20, emoji: '🍿' },
  { id: 'cat-009', name: 'Sandwich', category: 'Food', price: 50, emoji: '🥪' },
  { id: 'cat-010', name: 'Headphone Adapter', category: 'Accessories', price: 80, emoji: '🎧' },
];

export const categories = ['All', 'Drinks', 'Snacks', 'Food', 'Accessories'];

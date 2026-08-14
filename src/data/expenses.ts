export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  vendor: string;
  date: string;
  paymentMethod: 'Cash' | 'Card' | 'Transfer';
  notes: string;
  recurring: boolean;
}

const STORAGE_KEY = 'zoox-expenses';

export const seedExpenses: Expense[] = [
  {
    id: 'exp-001',
    title: 'Electricity bill - August',
    category: 'Utilities',
    amount: 4200,
    vendor: 'EGYPOWER',
    date: '2026-08-05',
    paymentMethod: 'Transfer',
    notes: 'Monthly consumption bill.',
    recurring: true,
  },
  {
    id: 'exp-002',
    title: 'Internet fiber 300Mbps',
    category: 'Utilities',
    amount: 950,
    vendor: 'Orange',
    date: '2026-08-01',
    paymentMethod: 'Card',
    notes: '',
    recurring: true,
  },
  {
    id: 'exp-003',
    title: 'PS5 game licenses',
    category: 'Software',
    amount: 1800,
    vendor: 'PlayStation Store',
    date: '2026-08-10',
    paymentMethod: 'Card',
    notes: 'FC 26 + GTA V bundles.',
    recurring: false,
  },
  {
    id: 'exp-004',
    title: 'Stock - drinks & snacks',
    category: 'Inventory',
    amount: 2600,
    vendor: 'Masrawy Beverages',
    date: '2026-08-08',
    paymentMethod: 'Cash',
    notes: '',
    recurring: false,
  },
  {
    id: 'exp-005',
    title: 'Air conditioning repair',
    category: 'Maintenance',
    amount: 700,
    vendor: 'CoolFix Co',
    date: '2026-08-11',
    paymentMethod: 'Cash',
    notes: 'Refrigerant leak fixed.',
    recurring: false,
  },
  {
    id: 'exp-006',
    title: 'Cleaning supplies',
    category: 'Supplies',
    amount: 350,
    vendor: 'CleanMart',
    date: '2026-08-06',
    paymentMethod: 'Cash',
    notes: '',
    recurring: false,
  },
  {
    id: 'exp-007',
    title: 'Staff salaries - July',
    category: 'Payroll',
    amount: 16500,
    vendor: 'Staff',
    date: '2026-08-03',
    paymentMethod: 'Transfer',
    notes: '9 staff members.',
    recurring: true,
  },
];

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Expense[];
  } catch {
    /* ignore */
  }
  return seedExpenses;
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    /* ignore */
  }
}

export function addExpense(data: Omit<Expense, 'id'>): Expense[] {
  const next: Expense[] = [{ ...data, id: `exp-${Date.now()}` }, ...loadExpenses()];
  saveExpenses(next);
  return next;
}

export function deleteExpense(id: string): Expense[] {
  const next = loadExpenses().filter((e) => e.id !== id);
  saveExpenses(next);
  return next;
}

export const expenseCategories = [
  'Utilities',
  'Inventory',
  'Maintenance',
  'Payroll',
  'Supplies',
  'Software',
  'Marketing',
  'Other',
];

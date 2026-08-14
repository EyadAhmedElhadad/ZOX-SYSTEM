'use client';
import React, { useState } from 'react';
import {
  Plus,
  Search,
  Receipt,
  CalendarDays,
  Wallet,
  TrendingUp,
  X,
  Trash2,
  Inbox,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loadExpenses, addExpense, deleteExpense, expenseCategories } from '@/data/expenses';
import type { Expense } from '@/data/expenses';

type MonthFilter = 'all' | 'this' | 'last';

const monthOptions: { id: MonthFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'this', label: 'This Month' },
  { id: 'last', label: 'Last Month' },
];

const paymentStyles: Record<Expense['paymentMethod'], string> = {
  Cash: 'bg-accent/10 text-accent border border-accent/20',
  Card: 'bg-primary/10 text-primary border border-primary/20',
  Transfer: 'bg-info/10 text-info border border-info/20',
};

const categoryStyles: Record<string, string> = {
  Utilities: 'bg-info/10 text-info border border-info/20',
  Inventory: 'bg-accent/10 text-accent border border-accent/20',
  Maintenance: 'bg-warning/10 text-warning border border-warning/20',
  Payroll: 'bg-primary/10 text-primary border border-primary/20',
  Supplies: 'bg-muted text-muted-foreground border border-border',
  Software: 'bg-primary/10 text-primary border border-primary/20',
  Marketing: 'bg-danger/10 text-danger border border-danger/20',
};

const categoryStyle = (cat: string) =>
  categoryStyles[cat] || 'bg-muted text-muted-foreground border border-border';

function expenseMonth(date: string) {
  const [y, m] = date.split('-').map(Number);
  return { y, m };
}

function lastMonth() {
  const now = new Date();
  if (now.getMonth() === 0) return { y: now.getFullYear() - 1, m: 11 };
  return { y: now.getFullYear(), m: now.getMonth() - 1 };
}

export default function ExpensesContent() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState<MonthFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    vendor: '',
    date: '',
    paymentMethod: 'Cash' as Expense['paymentMethod'],
    notes: '',
    recurring: false,
  });

  const now = new Date();
  const thisM = { y: now.getFullYear(), m: now.getMonth() };
  const lastM = lastMonth();

  const filtered = expenses
    .filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      const em = expenseMonth(e.date);
      const matchesMonth =
        monthFilter === 'all' ||
        (monthFilter === 'this' && em.y === thisM.y && em.m === thisM.m) ||
        (monthFilter === 'last' && em.y === lastM.y && em.m === lastM.m);
      return matchesSearch && matchesCategory && matchesMonth;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const thisMonthExpenses = expenses.filter((e) => {
    const em = expenseMonth(e.date);
    return em.y === thisM.y && em.m === thisM.m;
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = thisMonthExpenses.length ? thisMonthTotal / thisMonthExpenses.length : 0;
  const largestExpense = thisMonthExpenses.length
    ? Math.max(...thisMonthExpenses.map((e) => e.amount))
    : 0;
  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim() || !newExpense.amount) {
      toast.error('Title and amount are required');
      return;
    }
    const next = addExpense({
      title: newExpense.title.trim(),
      category: newExpense.category,
      amount: Number(newExpense.amount) || 0,
      vendor: newExpense.vendor.trim() || '—',
      date: newExpense.date || new Date().toISOString().slice(0, 10),
      paymentMethod: newExpense.paymentMethod,
      notes: newExpense.notes.trim(),
      recurring: newExpense.recurring,
    });
    setExpenses(next);
    setNewExpense({
      title: '',
      category: 'Utilities',
      amount: '',
      vendor: '',
      date: '',
      paymentMethod: 'Cash',
      notes: '',
      recurring: false,
    });
    setAddOpen(false);
    toast.success('Expense recorded');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const next = deleteExpense(deleteTarget.id);
    setExpenses(next);
    toast.success('Expense deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {expenses.length} expenses — track operating costs and outflows
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center gap-2 h-9 self-start sm:self-auto"
        >
          <Plus size={14} />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Wallet size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Month Total</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {thisMonthTotal.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
              <Receipt size={18} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Month Count</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {thisMonthExpenses.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg / Expense</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {avgExpense.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <CalendarDays size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Largest Expense</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {largestExpense.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or vendor..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {expenseCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c === categoryFilter ? 'All' : c)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors border ${
                categoryFilter === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value as MonthFilter)}
            className="input-field !w-auto px-3 py-1.5 text-xs"
          >
            {monthOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Vendor
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Notes
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                    <Inbox size={24} className="mx-auto mb-2 opacity-50" />
                    No expenses match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{item.title}</span>
                        {item.recurring && (
                          <span className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Recurring
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${categoryStyle(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.vendor}</td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">{item.date}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${paymentStyles[item.paymentMethod]}`}>
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-tabular font-semibold text-foreground">
                      {item.amount.toLocaleString()} EGP
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Total ({filtered.length} expense{filtered.length !== 1 ? 's' : ''})
                  </td>
                  <td className="px-4 py-3 text-right font-tabular font-bold text-foreground">
                    {filteredTotal.toLocaleString()} EGP
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Add Expense</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Title</label>
                <input
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="e.g. Electricity bill"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Category
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="input-field"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Amount (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Vendor
                  </label>
                  <input
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    placeholder="e.g. EGYPOWER"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Payment method
                  </label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        paymentMethod: e.target.value as Expense['paymentMethod'],
                      })
                    }
                    className="input-field"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExpense.recurring}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, recurring: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Recurring</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Notes</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Optional details..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm card-base p-6 fade-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 mb-4 mx-auto">
              <Trash2 size={22} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold text-foreground text-center mb-1">
              Delete this expense?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-5">
              “{deleteTarget.title}” ({deleteTarget.amount.toLocaleString()} EGP) will be
              permanently removed.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 h-10">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex-1 h-10 bg-danger/10 hover:bg-danger/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

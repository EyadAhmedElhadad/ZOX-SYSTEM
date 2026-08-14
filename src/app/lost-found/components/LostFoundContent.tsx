'use client';
import React, { useState } from 'react';
import {
  Package,
  Smartphone,
  Wallet,
  Headphones,
  Shirt,
  Plus,
  X,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Boxes,
  UserCheck,
  FolderX,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loadLostFound, addLostFound, updateLostFound, claimItem } from '@/data/lostFound';
import type { LostFoundItem, ItemCategory, ItemStatus } from '@/data/lostFound';

const statusFilters: { id: ItemStatus | 'All'; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Unclaimed', label: 'Unclaimed' },
  { id: 'Returned', label: 'Returned' },
  { id: 'Disposed', label: 'Disposed' },
];

const categories: ItemCategory[] = ['Phone', 'Wallet', 'Accessory', 'Clothing', 'Other'];

const categoryIcons: Record<
  ItemCategory,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Phone: Smartphone,
  Wallet: Wallet,
  Accessory: Headphones,
  Clothing: Shirt,
  Other: Package,
};

const categoryStyles: Record<ItemCategory, string> = {
  Phone: 'bg-primary/10 text-primary border border-primary/20',
  Wallet: 'bg-accent/10 text-accent border border-accent/20',
  Accessory: 'bg-info/10 text-info border border-info/20',
  Clothing: 'bg-warning/10 text-warning border border-warning/20',
  Other: 'bg-muted text-muted-foreground border border-border',
};

const statusStyles: Record<ItemStatus, string> = {
  Unclaimed: 'bg-warning/10 text-warning border border-warning/20',
  Returned: 'bg-accent/10 text-accent border border-accent/20',
  Disposed: 'bg-muted text-muted-foreground border border-border',
};

const initialForm = {
  description: '',
  category: 'Phone' as ItemCategory,
  foundLocation: '',
  foundBy: '',
  notes: '',
};

export default function LostFoundContent() {
  const [items, setItems] = useState<LostFoundItem[]>(() => loadLostFound());
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'All'>('All');
  const [logOpen, setLogOpen] = useState(false);
  const [newItem, setNewItem] = useState(initialForm);
  const [claimTarget, setClaimTarget] = useState<LostFoundItem | null>(null);
  const [claimantName, setClaimantName] = useState('');

  const unclaimed = items.filter((i) => i.status === 'Unclaimed').length;
  const returned = items.filter((i) => i.status === 'Returned').length;
  const disposed = items.filter((i) => i.status === 'Disposed').length;

  const filtered = items.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleLogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.description.trim()) {
      toast.error('Description is required');
      return;
    }
    const foundAt = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const next = addLostFound({
      description: newItem.description.trim(),
      category: newItem.category,
      foundLocation: newItem.foundLocation.trim() || '—',
      foundBy: newItem.foundBy.trim() || 'Staff',
      foundAt,
      notes: newItem.notes.trim(),
    });
    setItems(next);
    setNewItem(initialForm);
    setLogOpen(false);
    toast.success('Found item logged');
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTarget) return;
    const name = claimantName.trim();
    if (!name) {
      toast.error('Claimant name is required');
      return;
    }
    const next = claimItem(claimTarget.id, name);
    setItems(next);
    setClaimTarget(null);
    setClaimantName('');
    toast.success(`Item returned to ${name}`);
  };

  const handleDispose = (item: LostFoundItem) => {
    const next = updateLostFound(item.id, { status: 'Disposed' as ItemStatus });
    setItems(next);
    toast.success('Item marked as disposed');
  };

  const handleReopen = (item: LostFoundItem) => {
    const next = updateLostFound(item.id, {
      status: 'Unclaimed' as ItemStatus,
      claimedBy: '',
      claimedAt: '',
    });
    setItems(next);
    toast.success('Item reopened as unclaimed');
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lost & Found</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} items — track found items and returns
          </p>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="btn-primary flex items-center gap-2 h-9 self-start"
        >
          <Plus size={14} />
          Log Found Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Package size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unclaimed</p>
              <p className="text-lg font-bold text-warning font-tabular">{unclaimed}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <UserCheck size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Returned</p>
              <p className="text-lg font-bold text-accent font-tabular">{returned}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
              <FolderX size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Disposed</p>
              <p className="text-lg font-bold text-muted-foreground font-tabular">{disposed}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Boxes size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Items</p>
              <p className="text-lg font-bold text-foreground font-tabular">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((f) => {
            const count =
              f.id === 'All' ? items.length : items.filter((i) => i.status === f.id).length;
            return (
              <button
                key={`filter-${f.id}`}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  statusFilter === f.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    statusFilter === f.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-background text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | 'All')}
          className="input-field !w-auto px-3 py-1.5 text-xs"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center text-center gap-3 py-16">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
            <Package size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No items here</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Try a different filter or log a newly found item.
          </p>
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Item
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Found Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Found By
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Found At
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const Icon = categoryIcons[item.category];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-muted-foreground" />
                          </div>
                          <span className="font-semibold text-foreground truncate">
                            {item.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${categoryStyles[item.category]}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.foundLocation}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.foundBy}</td>
                      <td className="px-4 py-3 text-muted-foreground font-tabular text-xs">
                        {item.foundAt}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="block max-w-[180px] truncate">
                          {item.status === 'Returned' && item.claimedBy
                            ? `Claimed by ${item.claimedBy} — ${item.notes || 'no notes'}`
                            : item.notes || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'Unclaimed' && (
                            <>
                              <button
                                onClick={() => {
                                  setClaimTarget(item);
                                  setClaimantName('');
                                }}
                                className="btn-success flex items-center gap-1.5 h-8 px-3"
                              >
                                <CheckCircle2 size={14} />
                                Mark Returned
                              </button>
                              <button
                                onClick={() => handleDispose(item)}
                                className="btn-danger flex items-center gap-1.5 h-8 px-3"
                              >
                                <Trash2 size={14} />
                                Dispose
                              </button>
                            </>
                          )}
                          {item.status !== 'Unclaimed' && (
                            <button
                              onClick={() => handleReopen(item)}
                              className="btn-secondary flex items-center gap-1.5 h-8 px-3"
                            >
                              <RotateCcw size={14} />
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Found Item Modal */}
      {logOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setLogOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Log Found Item</h2>
              <button
                onClick={() => setLogOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLogItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Description
                </label>
                <input
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="e.g. Samsung Galaxy A54 - black case"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value as ItemCategory })
                  }
                  className="input-field"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Found location
                  </label>
                  <input
                    value={newItem.foundLocation}
                    onChange={(e) => setNewItem({ ...newItem, foundLocation: e.target.value })}
                    placeholder="e.g. Room 3"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Found by
                  </label>
                  <input
                    value={newItem.foundBy}
                    onChange={(e) => setNewItem({ ...newItem, foundBy: e.target.value })}
                    placeholder="e.g. Karim Adel"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Notes</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Any details that help identify the owner..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogOpen(false)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Log Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setClaimTarget(null)} />
          <div className="relative w-full max-w-sm card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Return Item</h2>
              <button
                onClick={() => setClaimTarget(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">{claimTarget.description}</span> —
              enter the claimant&apos;s name to mark it returned.
            </p>
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Claimant name
                </label>
                <input
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. Ahmed Khalil"
                  className="input-field"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setClaimTarget(null)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-success flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

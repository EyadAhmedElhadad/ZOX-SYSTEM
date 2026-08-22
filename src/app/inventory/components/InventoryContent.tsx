'use client';
import React, { useState } from 'react';
import { Package, Plus, Search, Download, AlertTriangle, Boxes, Wallet, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  status: StockStatus;
}

const categories = ['All', 'Drinks', 'Snacks', 'Controllers', 'Accessories'];

export const mockInventory: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Pepsi 330ml',
    category: 'Drinks',
    sku: 'DRK-PEP-330',
    stock: 120,
    reorderLevel: 40,
    unitPrice: 15,
    supplier: 'Masrawy Beverages',
    lastRestocked: '2026-08-05',
    status: 'In Stock',
  },
  {
    id: 'inv-002',
    name: 'Coca-Cola 330ml',
    category: 'Drinks',
    sku: 'DRK-COK-330',
    stock: 85,
    reorderLevel: 40,
    unitPrice: 15,
    supplier: 'Masrawy Beverages',
    lastRestocked: '2026-08-05',
    status: 'In Stock',
  },
  {
    id: 'inv-003',
    name: 'Water 500ml',
    category: 'Drinks',
    sku: 'DRK-WTR-500',
    stock: 200,
    reorderLevel: 60,
    unitPrice: 8,
    supplier: 'Aqua Nile',
    lastRestocked: '2026-08-06',
    status: 'In Stock',
  },
  {
    id: 'inv-004',
    name: 'Orange Juice 250ml',
    category: 'Drinks',
    sku: 'DRK-JUS-250',
    stock: 22,
    reorderLevel: 25,
    unitPrice: 20,
    supplier: 'Fresh Press',
    lastRestocked: '2026-08-03',
    status: 'Low Stock',
  },
  {
    id: 'inv-005',
    name: 'Red Bull 250ml',
    category: 'Drinks',
    sku: 'DRK-RDB-250',
    stock: 8,
    reorderLevel: 30,
    unitPrice: 45,
    supplier: 'El Sharq Trading',
    lastRestocked: '2026-07-28',
    status: 'Low Stock',
  },
  {
    id: 'inv-006',
    name: "Lay's Chips - Salt",
    category: 'Snacks',
    sku: 'SNK-LYS-SLT',
    stock: 64,
    reorderLevel: 30,
    unitPrice: 12,
    supplier: 'Snack World',
    lastRestocked: '2026-08-06',
    status: 'In Stock',
  },
  {
    id: 'inv-007',
    name: 'Doritos - Cheese',
    category: 'Snacks',
    sku: 'SNK-DRT-CHS',
    stock: 0,
    reorderLevel: 25,
    unitPrice: 12,
    supplier: 'Snack World',
    lastRestocked: '2026-07-20',
    status: 'Out of Stock',
  },
  {
    id: 'inv-008',
    name: 'Indomie - Spicy',
    category: 'Snacks',
    sku: 'SNK-IND-SPY',
    stock: 48,
    reorderLevel: 35,
    unitPrice: 18,
    supplier: 'Snack World',
    lastRestocked: '2026-08-04',
    status: 'In Stock',
  },
  {
    id: 'inv-009',
    name: 'Chocolate Bar',
    category: 'Snacks',
    sku: 'SNK-CHO-BAR',
    stock: 15,
    reorderLevel: 20,
    unitPrice: 25,
    supplier: 'Candy House',
    lastRestocked: '2026-08-01',
    status: 'Low Stock',
  },
  {
    id: 'inv-010',
    name: 'PS5 DualSense White',
    category: 'Controllers',
    sku: 'CTR-PS5-WHT',
    stock: 6,
    reorderLevel: 3,
    unitPrice: 1600,
    supplier: 'Gamers Zone',
    lastRestocked: '2026-07-15',
    status: 'In Stock',
  },
  {
    id: 'inv-011',
    name: 'PS5 DualSense Black',
    category: 'Controllers',
    sku: 'CTR-PS5-BLK',
    stock: 3,
    reorderLevel: 3,
    unitPrice: 1600,
    supplier: 'Gamers Zone',
    lastRestocked: '2026-07-15',
    status: 'Low Stock',
  },
  {
    id: 'inv-012',
    name: 'Xbox Wireless Controller',
    category: 'Controllers',
    sku: 'CTR-XBX-WRL',
    stock: 0,
    reorderLevel: 4,
    unitPrice: 1400,
    supplier: 'Gamers Zone',
    lastRestocked: '2026-06-20',
    status: 'Out of Stock',
  },
  {
    id: 'inv-013',
    name: 'HDMI Cable 2m',
    category: 'Accessories',
    sku: 'ACC-HDMI-2M',
    stock: 18,
    reorderLevel: 10,
    unitPrice: 80,
    supplier: 'Tech Supplies Co',
    lastRestocked: '2026-08-02',
    status: 'In Stock',
  },
  {
    id: 'inv-014',
    name: 'USB-C Charging Cable',
    category: 'Accessories',
    sku: 'ACC-USBC-CHG',
    stock: 25,
    reorderLevel: 15,
    unitPrice: 60,
    supplier: 'Tech Supplies Co',
    lastRestocked: '2026-08-02',
    status: 'In Stock',
  },
];

const statusStyles: Record<StockStatus, string> = {
  'In Stock': 'bg-accent/10 text-accent border border-accent/20',
  'Low Stock': 'bg-warning/10 text-warning border border-warning/20',
  'Out of Stock': 'bg-danger/10 text-danger border border-danger/20',
};

const STORAGE_KEY = 'zoox-inventory';

function loadInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InventoryItem[];
  } catch {
    /* ignore */
  }
  return mockInventory;
}

function saveInventory(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export default function InventoryContent() {
  const [items, setItems] = useState<InventoryItem[]>(() => loadInventory());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'All'>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Drinks',
    sku: '',
    stock: 0,
    unitPrice: 0,
  });

  const filtered = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatus = (stock: number, reorderLevel: number): StockStatus => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.sku.trim()) {
      toast.error('Name and SKU are required');
      return;
    }
    const stock = Number(newItem.stock) || 0;
    const reorderLevel = Math.max(5, Math.ceil(stock * 0.35));
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name.trim(),
      category: newItem.category,
      sku: newItem.sku.trim().toUpperCase(),
      stock,
      reorderLevel,
      unitPrice: Number(newItem.unitPrice) || 0,
      supplier: '—',
      lastRestocked: new Date().toISOString().slice(0, 10),
      status: getStatus(stock, reorderLevel),
    };
    setItems((prev) => {
      const next = [item, ...prev];
      saveInventory(next);
      return next;
    });
    setNewItem({ name: '', category: 'Drinks', sku: '', stock: 0, unitPrice: 0 });
    setAddOpen(false);
    toast.success(`${item.name} added to inventory`);
  };

  const handleStatusChange = (id: string, status: StockStatus) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, status, stock: status === 'Out of Stock' ? 0 : item.stock }
          : item
      );
      saveInventory(next);
      return next;
    });
    toast.success(`Status updated to ${status}`);
  };

  const handleExport = () => {
    const header = 'Name,Category,SKU,Stock,Reorder Level,Unit Price,Supplier,Status';
    const rows = items.map((i) =>
      [i.name, i.category, i.sku, i.stock, i.reorderLevel, i.unitPrice, i.supplier, i.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoox-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Inventory exported as CSV');
  };

  const lowStockCount = items.filter((i) => i.status === 'Low Stock').length;
  const outCount = items.filter((i) => i.status === 'Out of Stock').length;
  const stockValue = items.reduce((sum, i) => sum + i.stock * i.unitPrice, 0);

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} products — track stock, prices, and reorders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 h-9">
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="btn-primary flex items-center gap-2 h-9"
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Boxes size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-lg font-bold text-foreground font-tabular">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-lg font-bold text-warning font-tabular">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <X size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
              <p className="text-lg font-bold text-danger font-tabular">{outCount}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Wallet size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock Value</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {stockValue.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or supplier..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StockStatus | 'All')}
            className="input-field !w-auto px-3 py-1.5 text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
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
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Supplier
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <Package size={24} className="mx-auto mb-2 opacity-50" />
                    No items match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                          <Package size={14} className="text-muted-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold font-tabular ${item.stock <= 0 ? 'text-danger' : item.stock <= item.reorderLevel ? 'text-warning' : 'text-foreground'}`}
                      >
                        {item.stock}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {item.reorderLevel}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-muted-foreground">
                      {item.unitPrice.toLocaleString()} EGP
                    </td>
                    <td className="px-4 py-3 text-right font-tabular font-semibold text-foreground">
                      {(item.stock * item.unitPrice).toLocaleString()} EGP
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.supplier}</td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as StockStatus)}
                        className={`status-badge cursor-pointer outline-none appearance-none text-center pr-2 ${statusStyles[item.status]}`}
                        title="Edit status"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Add Inventory Item</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Product name
                </label>
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Pepsi 330ml"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">SKU</label>
                  <input
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    placeholder="DRK-XXX-000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Drinks">Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Controllers">Controllers</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Stock quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Unit price (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
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
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

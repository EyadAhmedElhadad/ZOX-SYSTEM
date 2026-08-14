'use client';
import React, { useState } from 'react';
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { addSale, loadSales } from '@/data/sales';
import type { Sale, SaleItem } from '@/data/sales';
import { catalogProducts, categories } from '@/data/catalog';
import type { CatalogProduct } from '@/data/catalog';

interface CartLine {
  product: CatalogProduct;
  qty: number;
}

const TAX_RATE = 0.14;

const paymentOptions: Sale['paymentMethod'][] = ['Cash', 'Card', 'Wallet'];

const paymentStyles: Record<Sale['paymentMethod'], string> = {
  Cash: 'bg-accent/10 text-accent border border-accent/20',
  Card: 'bg-info/10 text-info border border-info/20',
  Wallet: 'bg-warning/10 text-warning border border-warning/20',
};

function todayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function nowTime(): string {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function SalesContent() {
  const [sales, setSales] = useState<Sale[]>(() => loadSales());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in');
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Cash');

  const visibleProducts = catalogProducts.filter(
    (p) => categoryFilter === 'All' || p.category === categoryFilter
  );

  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0);
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);

  const addToCart = (product: CatalogProduct) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.emoji} ${product.name} added`, { duration: 1200 });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.product.id === id ? { ...line, qty: Math.max(0, line.qty + delta) } : line
        )
        .filter((line) => line.qty > 0)
    );
  };

  const removeLine = (id: string) => {
    setCart((prev) => prev.filter((line) => line.product.id !== id));
  };

  const clearCart = () => setCart([]);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty — add at least one item');
      return;
    }
    const items: SaleItem[] = cart.map((line) => ({
      id: line.product.id,
      name: line.product.name,
      category: line.product.category,
      price: line.product.price,
      emoji: line.product.emoji,
      qty: line.qty,
    }));
    const next = addSale({
      customer: customerName.trim() || 'Walk-in',
      items,
      subtotal: round2(subtotal),
      tax,
      total,
      paymentMethod,
      date: todayKey(),
      time: nowTime(),
    });
    setSales(next);
    setCart([]);
    setCustomerName('Walk-in');
    setPaymentMethod('Cash');
    toast.success(`Sale completed — ${round2(total).toLocaleString()} EGP`);
  };

  const today = todayKey();
  const todaysSales = sales.filter((s) => s.date === today);
  const revenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
  const avgOrder = todaysSales.length ? revenue / todaysSales.length : 0;

  const topItem = (() => {
    const counts = new Map<string, number>();
    sales.forEach((s) =>
      s.items.forEach((it) => counts.set(it.name, (counts.get(it.name) ?? 0) + it.qty))
    );
    let bestName: string | null = null;
    let bestQty = 0;
    counts.forEach((qty, name) => {
      if (qty > bestQty) {
        bestQty = qty;
        bestName = name;
      }
    });
    return bestName;
  })();

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales · Point of Sale</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build an order from the catalog and complete the sale
          </p>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart} className="btn-secondary flex items-center gap-2 h-9">
            <Trash2 size={14} />
            Clear Cart
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Banknote size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today&apos;s Revenue</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {revenue.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Receipt size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold text-foreground font-tabular">{todaysSales.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {avgOrder.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vip/10 border border-vip/20 flex items-center justify-center">
              <Trophy size={18} className="text-vip" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Top Item</p>
              <p className="text-lg font-bold text-foreground truncate">{topItem ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* POS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Catalog */}
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                  categoryFilter === cat
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="card-base p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                  <span className="text-lg">{product.emoji}</span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <p className="mt-2 text-sm font-bold text-primary font-tabular">
                  {product.price.toLocaleString()} EGP
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="card-base p-5 xl:sticky xl:top-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Current Order</h2>
            <span className="ml-auto status-badge bg-primary/10 text-primary border border-primary/20">
              {cart.reduce((sum, l) => sum + l.qty, 0)} items
            </span>
          </div>

          <div className="space-y-3 mb-5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-10 border border-dashed border-border rounded-lg">
                <ShoppingCart size={22} className="text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Cart is empty — tap a product to add it
                </p>
              </div>
            ) : (
              cart.map((line) => (
                <div
                  key={line.product.id}
                  className="flex items-center gap-3 bg-muted/30 border border-border rounded-lg p-3"
                >
                  <span className="text-lg">{line.product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {line.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-tabular">
                      {line.product.price.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changeQty(line.product.id, -1)}
                      className="w-6 h-6 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                      title="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-foreground font-tabular">
                      {line.qty}
                    </span>
                    <button
                      onClick={() => changeQty(line.product.id, 1)}
                      className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                      title="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="w-16 text-right text-sm font-bold text-foreground font-tabular">
                    {(line.product.price * line.qty).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeLine(line.product.id)}
                    className="p-1 text-muted-foreground hover:text-danger transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Customer</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Payment method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {paymentOptions.map((method) => {
                  const Icon =
                    method === 'Cash' ? Banknote : method === 'Card' ? CreditCard : Wallet;
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold border transition-all duration-150 ${
                        paymentMethod === method
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={13} />
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 space-y-1.5 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-tabular font-semibold">
                  {round2(subtotal).toLocaleString()} EGP
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tax (14%)</span>
                <span className="font-tabular font-semibold">{tax.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-foreground pt-1">
                <span>Total</span>
                <span className="font-tabular">{total.toLocaleString()} EGP</span>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              className="btn-primary w-full h-11 flex items-center justify-center gap-2"
            >
              <Banknote size={15} />
              Complete Sale
            </button>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card-base overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
          <span className="text-xs text-muted-foreground">{sales.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date / Time
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Receipt size={24} className="mx-auto mb-2 opacity-50" />
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                        {sale.items.map((item) => (
                          <span
                            key={`${sale.id}-${item.id}`}
                            className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] font-semibold text-muted-foreground"
                          >
                            {item.emoji} {item.name} ×{item.qty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{sale.customer}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${paymentStyles[sale.paymentMethod]}`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-tabular font-semibold text-foreground">
                      {sale.total.toLocaleString()} EGP
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular">
                      {sale.date} · {sale.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

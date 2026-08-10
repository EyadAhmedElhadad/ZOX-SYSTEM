'use client';
import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { LiveSession, SessionProduct } from './LiveSessionsContent';
import { catalogProducts, categories } from '../../../data/catalog';
import { toast } from 'sonner';

const products = catalogProducts;

interface AddProductModalProps {
  session: LiveSession;
  onClose: () => void;
  onAdd: (sessionId: string, product: SessionProduct) => void;
}

export default function AddProductModal({ session, onClose, onAdd }: AddProductModalProps) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, 0]))
  );

  const filtered =
    categoryFilter === 'All' ? products : products.filter((p) => p.category === categoryFilter);

  const adjustQty = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta),
    }));
  };

  const selectedItems = products.filter((p) => quantities[p.id] > 0);
  const selectedTotal = selectedItems.reduce((sum, p) => sum + p.price * quantities[p.id], 0);

  const handleAddToSession = () => {
    if (selectedItems.length === 0) return;
    selectedItems.forEach((prod) => {
      onAdd(session.id, {
        id: `${session.id}-${prod.id}-${Date.now()}`,
        name: prod.name,
        price: prod.price,
        qty: quantities[prod.id],
      });
    });
    toast.success(
      `${selectedItems.length} product${selectedItems.length > 1 ? 's' : ''} added to ${session.room}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Add Products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {session.room} · {session.customer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category filter */}
        <div className="px-5 py-3 border-b border-border flex gap-1.5 overflow-x-auto scrollbar-thin flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={`cat-filter-${cat}`}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          <div className="grid grid-cols-1 gap-2">
            {filtered.map((prod) => {
              const qty = quantities[prod.id] || 0;
              return (
                <div
                  key={prod.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                    qty > 0
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-muted/20 hover:border-border/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{prod.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{prod.name}</p>
                      <p className="text-xs text-muted-foreground">{prod.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-tabular text-foreground mr-1">
                      {prod.price} EGP
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustQty(prod.id, -1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 flex items-center justify-center transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-tabular font-bold text-foreground">
                        {qty}
                      </span>
                      <button
                        onClick={() => adjustQty(prod.id, 1)}
                        className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <span className="text-sm font-bold font-tabular text-foreground">
                +{selectedTotal.toLocaleString()} EGP
              </span>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleAddToSession}
              disabled={selectedItems.length === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={14} />
              Add to Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

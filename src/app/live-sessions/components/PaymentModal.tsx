'use client';
import React, { useState, useEffect } from 'react';
import { X, Banknote, Smartphone, Wallet, CheckCircle } from 'lucide-react';
import type { LiveSession } from './LiveSessionsContent';
import { toast } from 'sonner';

type PaymentMethod = 'cash' | 'instapay' | 'vodafone';

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: 'cash',
    label: 'Cash',
    icon: <Banknote size={22} />,
    description: 'Physical cash payment',
  },
  {
    id: 'instapay',
    label: 'InstaPay',
    icon: <Smartphone size={22} />,
    description: 'Instant bank transfer',
  },
  {
    id: 'vodafone',
    label: 'Vodafone Cash',
    icon: <Wallet size={22} />,
    description: 'Mobile wallet payment',
  },
];

interface PaymentModalProps {
  session: LiveSession;
  onClose: () => void;
  onPaymentComplete: (sessionId: string) => void;
}

function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function PaymentModal({ session, onClose, onPaymentComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [elapsedMin, setElapsedMin] = useState(session.startMinutesAgo);

  useEffect(() => {
    const interval = setInterval(() => setElapsedMin((m) => m + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const sessionCost = Math.round((elapsedMin / 60) * session.hourlyRate);
  const productsCost = session.products.reduce((s, p) => s + p.price * p.qty, 0);
  const total = sessionCost + productsCost;
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const change = cashReceivedNum - total;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    // Backend integration point: POST /api/sessions/:id/payment with { method, amount, sessionId }
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(
      `Payment of ${total.toLocaleString()} EGP received via ${paymentMethods.find((m) => m.id === selectedMethod)?.label}`
    );
    setIsProcessing(false);
    onPaymentComplete(session.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">End Session & Pay</h2>
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

        <div className="p-5 space-y-5">
          {/* Bill summary */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Bill Summary
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Session ({formatElapsed(elapsedMin)} × {session.hourlyRate} EGP/hr)
              </span>
              <span className="font-tabular font-semibold text-foreground">
                {sessionCost.toLocaleString()} EGP
              </span>
            </div>
            {session.products.map((prod) => (
              <div key={`bill-${prod.id}`} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {prod.name} × {prod.qty}
                </span>
                <span className="font-tabular font-medium text-foreground">
                  {(prod.price * prod.qty).toLocaleString()} EGP
                </span>
              </div>
            ))}
            {session.products.length === 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">No café products</span>
                <span className="font-tabular text-muted-foreground">— EGP</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-xl font-bold font-tabular text-foreground">
                {total.toLocaleString()} EGP
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={`pm-${method.id}`}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150 active:scale-95 ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  {method.icon}
                  <span className="text-xs font-semibold">{method.label}</span>
                  {selectedMethod === method.id && (
                    <CheckCircle size={12} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cash change calculator */}
          {selectedMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Cash Received (EGP)
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="input-field text-lg font-tabular font-bold"
                  placeholder={String(total)}
                  min={total}
                />
              </div>
              {cashReceived && cashReceivedNum >= total && (
                <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-xl">
                  <span className="text-sm font-semibold text-accent">Change to return</span>
                  <span className="text-lg font-bold font-tabular text-accent">
                    {change.toLocaleString()} EGP
                  </span>
                </div>
              )}
              {cashReceived && cashReceivedNum < total && (
                <div className="flex items-center justify-between p-3 bg-danger/10 border border-danger/20 rounded-xl">
                  <span className="text-sm font-semibold text-danger">Insufficient amount</span>
                  <span className="text-sm font-tabular text-danger">
                    Short by {(total - cashReceivedNum).toLocaleString()} EGP
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={
              isProcessing ||
              (selectedMethod === 'cash' && cashReceived !== '' && cashReceivedNum < total)
            }
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={15} />
                Confirm {total.toLocaleString()} EGP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

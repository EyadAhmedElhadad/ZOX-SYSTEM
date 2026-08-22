'use client';
import React, { useState } from 'react';
import LiveSessionsHeader from './LiveSessionsHeader';
import SessionsGrid from './SessionsGrid';
import PaymentModal from './PaymentModal';
import EvaluationPopup from './EvaluationPopup';
import AddProductModal from './AddProductModal';
import QuickActionModal, { type QuickActionTarget } from './QuickActionModal';
import QuickActionsMenu from './QuickActionsMenu';
import { Toaster } from 'sonner';
import { MapPin } from 'lucide-react';
import { initialSessions } from '../../../data/sessions';
import type { LiveSession, SessionProduct } from '../../../data/sessions';
import { ZONES } from '../../../data/zones';
import type { ZoneSession } from '../../../data/zones';

export type { LiveSession, SessionProduct };

export const sessionsData = initialSessions;

export default function LiveSessionsContent() {
  const [sessions, setSessions] = useState<LiveSession[]>(initialSessions);
  const [paymentTarget, setPaymentTarget] = useState<LiveSession | null>(null);
  const [paymentElapsedMin, setPaymentElapsedMin] = useState(0);
  const [evaluationTarget, setEvaluationTarget] = useState<LiveSession | null>(null);
  const [addProductTarget, setAddProductTarget] = useState<LiveSession | null>(null);
  const [quickActionTarget, setQuickActionTarget] = useState<LiveSession | null>(null);
  const [zones, setZones] = useState<ZoneSession[]>(ZONES);
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false);
  const [zoneQuickActionTarget, setZoneQuickActionTarget] = useState<ZoneSession | null>(null);

  const sessionToTarget = (session: LiveSession): QuickActionTarget => ({
    ...session,
    label: session.room,
  });

  const handleAddProduct = (sessionId: string, product: SessionProduct) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const existing = s.products.find((p) => p.name === product.name);
        if (existing) {
          return {
            ...s,
            products: s.products.map((p) =>
              p.name === product.name ? { ...p, qty: p.qty + product.qty } : p
            ),
          };
        }
        return { ...s, products: [...s.products, product] };
      })
    );
    setAddProductTarget(null);
  };

  const handleTogglePause = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
      )
    );
  };

  const handleEndSession = (session: LiveSession, elapsedMin: number) => {
    setPaymentElapsedMin(elapsedMin);
    setPaymentTarget(session);
  };

  const handlePaymentComplete = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setPaymentTarget(null);
      setEvaluationTarget(session);
    }
  };

  const handleEvaluationComplete = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setEvaluationTarget(null);
  };

  const handleQuickAction = (updated: QuickActionTarget) => {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
    setQuickActionTarget(null);
  };

  const handleZoneSelect = (zone: ZoneSession) => {
    setZoneMenuOpen(false);
    setZoneQuickActionTarget(zone);
  };

  const handleZoneQuickAction = (updated: QuickActionTarget) => {
    setZones((prev) => prev.map((z) => (z.id === updated.id ? { ...z, ...updated } : z)));
    setZoneQuickActionTarget(null);
  };

  const activeCount = sessions.filter((s) => s.status === 'active').length;
  const liveRevenue = sessions.reduce((sum, s) => {
    const sessionCost = Math.round((s.startMinutesAgo / 60) * s.hourlyRate);
    const productsCost = s.products.reduce((p, prod) => p + prod.price * prod.qty, 0);
    return sum + sessionCost + productsCost;
  }, 0);
  const pendingOrders = sessions.reduce(
    (sum, s) => sum + s.products.reduce((p, prod) => p + prod.qty, 0),
    0
  );

  return (
    <div className="relative p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <div className="pointer-events-none absolute -top-32 -right-24 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="relative">
        <Toaster position="bottom-right" theme="system" />
        <LiveSessionsHeader
          sessionCount={sessions.length}
          onQuickStart={() => setZoneMenuOpen(true)}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel rounded-xl p-5 glow-hover">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Active Stations
            </p>
            <p className="text-3xl font-bold text-foreground font-tabular">
              {activeCount}
              <span className="text-lg font-semibold text-muted-foreground">/10</span>
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5 glow-hover">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Live Revenue
            </p>
            <p className="text-3xl font-bold text-accent font-tabular">
              {liveRevenue.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-accent/70">EGP</span>
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5 glow-hover">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Pending Orders
            </p>
            <p className="text-3xl font-bold text-warning font-tabular">{pendingOrders}</p>
          </div>
          <button className="glass-panel rounded-xl p-5 glow-hover text-left flex items-center gap-3 group hover:border-primary/50 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary group-hover:underline underline-offset-2">
                View Floor Plan
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Open interactive map</p>
            </div>
          </button>
        </div>
        <SessionsGrid
          sessions={sessions}
          onAddProduct={(s) => setAddProductTarget(s)}
          onQuickAction={(s) => setQuickActionTarget(s)}
          onTogglePause={handleTogglePause}
          onEndSession={handleEndSession}
        />
        {paymentTarget && (
          <PaymentModal
            session={paymentTarget}
            elapsedMin={paymentElapsedMin}
            onClose={() => setPaymentTarget(null)}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
        {evaluationTarget && (
          <EvaluationPopup session={evaluationTarget} onComplete={handleEvaluationComplete} />
        )}
        {addProductTarget && (
          <AddProductModal
            session={addProductTarget}
            onClose={() => setAddProductTarget(null)}
            onAdd={handleAddProduct}
          />
        )}
        {quickActionTarget && (
          <QuickActionModal
            target={sessionToTarget(quickActionTarget)}
            apiPath="/api/quick-action"
            onClose={() => setQuickActionTarget(null)}
            onApply={handleQuickAction}
          />
        )}
        {zoneMenuOpen && (
          <QuickActionsMenu
            zones={zones}
            onClose={() => setZoneMenuOpen(false)}
            onSelect={handleZoneSelect}
          />
        )}
        {zoneQuickActionTarget && (
          <QuickActionModal
            target={{ ...zoneQuickActionTarget, label: zoneQuickActionTarget.zoneName }}
            apiPath="/api/zones/quick-action"
            onClose={() => setZoneQuickActionTarget(null)}
            onApply={handleZoneQuickAction}
          />
        )}
      </div>
    </div>
  );
}

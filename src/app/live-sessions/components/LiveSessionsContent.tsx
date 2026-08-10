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
import { initialSessions } from '../../../data/sessions';
import type { LiveSession, SessionProduct } from '../../../data/sessions';
import { ZONES } from '../../../data/zones';
import type { ZoneSession } from '../../../data/zones';

export type { LiveSession, SessionProduct };

export const sessionsData = initialSessions;

export default function LiveSessionsContent() {
  const [sessions, setSessions] = useState<LiveSession[]>(initialSessions);
  const [paymentTarget, setPaymentTarget] = useState<LiveSession | null>(null);
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

  const handleEndSession = (session: LiveSession) => {
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
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? (updated as unknown as LiveSession) : s))
    );
    setQuickActionTarget(null);
  };

  const handleZoneSelect = (zone: ZoneSession) => {
    setZoneMenuOpen(false);
    setZoneQuickActionTarget(zone);
  };

  const handleZoneQuickAction = (updated: QuickActionTarget) => {
    setZones((prev) =>
      prev.map((z) => (z.id === updated.id ? (updated as unknown as ZoneSession) : z))
    );
    setZoneQuickActionTarget(null);
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <Toaster position="bottom-right" theme="system" />
      <LiveSessionsHeader
        sessionCount={sessions.length}
        onQuickAction={() => setZoneMenuOpen(true)}
      />
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
  );
}

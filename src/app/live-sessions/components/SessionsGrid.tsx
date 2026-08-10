'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Pause, Play, CreditCard, Gamepad2, Users, Clock, Zap } from 'lucide-react';
import type { LiveSession } from './LiveSessionsContent';

interface SessionsGridProps {
  sessions: LiveSession[];
  onAddProduct: (session: LiveSession) => void;
  onQuickAction: (session: LiveSession) => void;
  onTogglePause: (sessionId: string) => void;
  onEndSession: (session: LiveSession) => void;
}

function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}m`;
}

function calculateBill(session: LiveSession, elapsedMin: number): number {
  const sessionCost = Math.round((elapsedMin / 60) * session.hourlyRate);
  const productsCost = session.products.reduce((sum, p) => sum + p.price * p.qty, 0);
  return sessionCost + productsCost;
}

const roomTypeColors: Record<string, { badge: string; glow: string }> = {
  Standard: { badge: 'bg-muted text-muted-foreground', glow: '' },
  Premium: { badge: 'bg-info/10 text-info border border-info/20', glow: 'hover:shadow-info/10' },
  VIP: {
    badge: 'bg-vip/10 text-vip border border-vip/20',
    glow: 'hover:shadow-vip/10',
  },
};

export default function SessionsGrid({
  sessions,
  onAddProduct,
  onQuickAction,
  onTogglePause,
  onEndSession,
}: SessionsGridProps) {
  const [elapsed, setElapsed] = useState<Record<string, number>>(
    Object.fromEntries(sessions.map((s) => [s.id, s.startMinutesAgo]))
  );

  const pausedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    pausedRef.current = new Set(sessions.filter((s) => s.status === 'paused').map((s) => s.id));
  }, [sessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([k, v]) => (pausedRef.current.has(k) ? [k, v] : [k, v + 1]))
        )
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync new sessions
  useEffect(() => {
    setElapsed((prev) => {
      const updated = { ...prev };
      sessions.forEach((s) => {
        if (!(s.id in updated)) {
          updated[s.id] = s.startMinutesAgo;
        }
      });
      return updated;
    });
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="card-base p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <Gamepad2 size={28} className="text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground mb-1">No active sessions</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          All rooms are currently free. Start a session from the Reservations screen or assign a
          walk-in customer to an available room.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {sessions.map((session) => {
        const elapsedMin = elapsed[session.id] ?? session.startMinutesAgo;
        const billTotal = calculateBill(session, elapsedMin);
        const rtColors = roomTypeColors[session.roomType];
        const totalDuration =
          session.sessionType === 'fixed'
            ? (session.fixedDurationMinutes ?? 0) + (session.extendedMinutes ?? 0)
            : undefined;
        const isNearEnd =
          session.sessionType === 'fixed' && totalDuration && elapsedMin >= totalDuration - 10;
        const isOvertime =
          session.sessionType === 'fixed' && totalDuration && elapsedMin >= totalDuration;

        return (
          <div
            key={session.id}
            className={`card-base border transition-all duration-200 hover:border-primary/30 flex flex-col ${
              session.status === 'paused' ? 'opacity-70' : ''
            } ${
              session.roomType === 'VIP'
                ? 'room-vip-bg'
                : session.roomType === 'Premium'
                  ? 'room-premium-bg'
                  : 'room-standard-bg'
            } ${isOvertime ? 'border-danger/40' : isNearEnd ? 'border-warning/40' : ''}`}
          >
            {/* Card header */}
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-base font-bold text-foreground">{session.room}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rtColors.badge}`}
                    >
                      {session.roomType}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {session.customer}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.phone}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {session.status === 'paused' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 border border-warning/20 px-2 py-1 rounded-full">
                      <Pause size={10} />
                      Paused
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Session info */}
            <div className="px-4 py-3 space-y-2 flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Gamepad2 size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Game</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{session.game}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Players</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{session.players}</p>
                </div>
              </div>

              {/* Timer */}
              <div
                className={`rounded-lg p-2.5 ${
                  isOvertime
                    ? 'bg-danger/10 border border-danger/20'
                    : isNearEnd
                      ? 'bg-warning/10 border border-warning/20'
                      : 'bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      size={12}
                      className={
                        isOvertime ? 'text-danger' : isNearEnd ? 'text-warning' : 'text-accent'
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {isOvertime ? 'Overtime' : isNearEnd ? 'Ending soon' : 'Elapsed'}
                    </span>
                  </div>
                  <span
                    className={`font-tabular text-sm font-bold ${
                      isOvertime ? 'text-danger' : isNearEnd ? 'text-warning' : 'text-accent'
                    }`}
                  >
                    {formatElapsed(elapsedMin)}
                  </span>
                </div>
                {session.sessionType === 'fixed' && totalDuration ? (
                  <div className="mt-1.5">
                    <div className="w-full bg-background/60 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          isOvertime ? 'bg-danger' : isNearEnd ? 'bg-warning' : 'bg-accent'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((elapsedMin / totalDuration) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.min(100, Math.round((elapsedMin / totalDuration) * 100))}% of{' '}
                      {totalDuration}min
                      {session.extendedMinutes ? ` (+${session.extendedMinutes}min)` : ''}
                    </p>
                  </div>
                ) : session.extendedMinutes ? (
                  <div className="mt-1.5">
                    <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                      +{session.extendedMinutes}min time credit
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Controllers */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Controllers</p>
                <div className="flex flex-wrap gap-1">
                  {session.controllers.map((ctrl) => (
                    <span
                      key={`ctrl-${session.id}-${ctrl}`}
                      className="text-xs font-mono font-medium bg-secondary border border-border px-1.5 py-0.5 rounded text-secondary-foreground"
                    >
                      {ctrl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Products */}
              {session.products.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Products ({session.products.length} items)
                  </p>
                  <div className="space-y-1">
                    {session.products.map((prod) => (
                      <div
                        key={`${session.id}-${prod.id}`}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {prod.name} × {prod.qty}
                        </span>
                        <span className="font-tabular font-medium text-foreground">
                          {(prod.price * prod.qty).toLocaleString()} EGP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session.products.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No products added yet</p>
              )}
            </div>

            {/* Bill total */}
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-bold font-tabular text-foreground">
                  {billTotal.toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-muted-foreground">EGP</span>
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <span>
                  Session: {Math.round((elapsedMin / 60) * session.hourlyRate).toLocaleString()} EGP
                </span>
                {session.products.length > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      Café:{' '}
                      {session.products.reduce((s, p) => s + p.price * p.qty, 0).toLocaleString()}{' '}
                      EGP
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 pt-2 grid grid-cols-4 gap-2">
              <button
                onClick={() => onQuickAction(session)}
                title="Quick action: add a drink and extend time"
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-warning/10 border border-warning/25 text-warning hover:bg-warning/20 transition-all duration-150 active:scale-95"
              >
                <Zap size={15} />
                <span className="text-xs font-semibold">Quick</span>
              </button>
              <button
                onClick={() => onAddProduct(session)}
                title="Add café product"
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-150 active:scale-95"
              >
                <ShoppingCart size={15} />
                <span className="text-xs font-semibold">Add</span>
              </button>
              <button
                onClick={() => onTogglePause(session.id)}
                title={session.status === 'paused' ? 'Resume session' : 'Pause session'}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-150 active:scale-95 ${
                  session.status === 'paused'
                    ? 'bg-accent/10 border-accent/20 text-accent hover:bg-accent/20'
                    : 'bg-warning/10 border-warning/20 text-warning hover:bg-warning/20'
                }`}
              >
                {session.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
                <span className="text-xs font-semibold">
                  {session.status === 'paused' ? 'Resume' : 'Pause'}
                </span>
              </button>
              <button
                onClick={() => onEndSession(session)}
                title="End session and take payment"
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all duration-150 active:scale-95"
              >
                <CreditCard size={15} />
                <span className="text-xs font-semibold">End</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

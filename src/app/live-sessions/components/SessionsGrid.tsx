'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Pause,
  Play,
  CreditCard,
  Gamepad2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LiveSession } from './LiveSessionsContent';

interface SessionsGridProps {
  sessions: LiveSession[];
  onAddProduct: (session: LiveSession) => void;
  onQuickAction: (session: LiveSession) => void;
  onTogglePause: (sessionId: string) => void;
  onEndSession: (session: LiveSession, elapsedMin: number) => void;
}

const PAGE_SIZE = 5;

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

function roomShort(room: string): string {
  return room.replace(/[^0-9]/g, '');
}

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
  const [page, setPage] = useState(0);

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

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, sessions.length);
  const paginatedSessions = sessions.slice(pageStart, pageEnd);

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
    <div>
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-[#0a1526]">
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Room / Station
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Game
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Elapsed
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bill Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Controls
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSessions.map((session, idx) => {
                const elapsedMin = elapsed[session.id] ?? session.startMinutesAgo;
                const billTotal = calculateBill(session, elapsedMin);
                const totalDuration =
                  session.sessionType === 'fixed'
                    ? (session.fixedDurationMinutes ?? 0) + (session.extendedMinutes ?? 0)
                    : undefined;
                const isNearEnd =
                  session.sessionType === 'fixed' &&
                  totalDuration &&
                  elapsedMin >= totalDuration - 10;
                const isOvertime =
                  session.sessionType === 'fixed' && totalDuration && elapsedMin >= totalDuration;
                const isPaused = session.status === 'paused';

                return (
                  <tr
                    key={session.id}
                    className={`border-t border-[#273647] transition-colors duration-150 ${
                      idx % 2 === 1 ? 'bg-[#0a1526]/40' : ''
                    } hover:bg-[#1c2b3c] ${isOvertime ? 'border-t-danger/40' : ''}`}
                  >
                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex flex-col items-center gap-1">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isPaused ? 'bg-[#c7b3ff]' : 'bg-accent pulse-dot animate-pulse'
                          }`}
                        />
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {isPaused ? 'Paused' : 'Active'}
                        </span>
                      </span>
                    </td>

                    {/* Room / Station */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#051424] border border-[#273647] flex items-center justify-center font-data-mono text-xs font-bold text-primary flex-shrink-0">
                          R{roomShort(session.room)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{session.room}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {session.roomType} · {session.players} players
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {session.customer.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {session.customer}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{session.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Game */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground whitespace-nowrap">
                        <Gamepad2 size={12} className="text-primary" />
                        {session.game}
                      </span>
                    </td>

                    {/* Elapsed */}
                    <td className="px-4 py-3">
                      <span
                        className={`font-data-mono font-bold ${
                          isOvertime
                            ? 'text-danger'
                            : isNearEnd
                              ? 'text-warning'
                              : isPaused
                                ? 'text-muted-foreground'
                                : 'text-accent session-timer-pulse'
                        }`}
                      >
                        {formatElapsed(elapsedMin)}
                      </span>
                      {session.sessionType === 'fixed' && totalDuration ? (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {Math.min(100, Math.round((elapsedMin / totalDuration) * 100))}% of{' '}
                          {totalDuration}min
                          {session.extendedMinutes ? ` (+${session.extendedMinutes}min)` : ''}
                        </p>
                      ) : session.extendedMinutes ? (
                        <p className="text-[11px] text-primary mt-0.5">
                          +{session.extendedMinutes}min credit
                        </p>
                      ) : null}
                    </td>

                    {/* Bill Total */}
                    <td className="px-4 py-3">
                      <p className="font-data-mono font-bold text-foreground whitespace-nowrap">
                        {billTotal.toLocaleString()}{' '}
                        <span className="text-[11px] font-semibold text-muted-foreground">EGP</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {session.products.length > 0
                          ? `${session.products.reduce((s, p) => s + p.qty, 0)} products`
                          : 'No products'}
                      </p>
                    </td>

                    {/* Controls */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onQuickAction(session)}
                          title="Add time and a drink"
                          className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/25 text-warning hover:bg-warning/20 flex items-center justify-center transition-all duration-150 active:scale-90"
                        >
                          <Clock size={14} />
                        </button>
                        <button
                          onClick={() => onAddProduct(session)}
                          title="Add café order"
                          className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 flex items-center justify-center transition-all duration-150 active:scale-90"
                        >
                          <ShoppingCart size={14} />
                        </button>
                        <button
                          onClick={() => onTogglePause(session.id)}
                          title={isPaused ? 'Resume session' : 'Pause session'}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 active:scale-90 ${
                            isPaused
                              ? 'bg-accent/10 border-accent/25 text-accent hover:bg-accent/20'
                              : 'bg-muted/40 border-border text-muted-foreground hover:text-warning hover:border-warning/40'
                          }`}
                        >
                          {isPaused ? <Play size={13} /> : <Pause size={13} />}
                        </button>
                        <button
                          onClick={() => onEndSession(session, elapsedMin)}
                          className="ml-1 flex items-center gap-1.5 bg-accent/15 border border-accent/25 text-accent hover:bg-accent/25 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 whitespace-nowrap"
                        >
                          <CreditCard size={13} />
                          Checkout
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between gap-3 mt-4">
        <p className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-semibold text-foreground">
            {pageStart + 1}–{pageEnd}
          </span>{' '}
          of <span className="font-semibold text-foreground">{sessions.length}</span> sessions
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass-panel text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-all duration-150 active:scale-95"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-xs text-muted-foreground font-tabular">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass-panel text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-all duration-150 active:scale-95"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

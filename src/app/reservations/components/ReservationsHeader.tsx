'use client';
import React, { useState } from 'react';
import { Calendar, CalendarPlus, Download, List, Zap } from 'lucide-react';

interface ReservationsHeaderProps {
  onNewReservation: () => void;
  onQuickBook: () => void;
  count: number;
  isCustomer?: boolean;
}

export default function ReservationsHeader({
  onNewReservation,
  onQuickBook,
  count,
  isCustomer = false,
}: ReservationsHeaderProps) {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground tracking-tight">
          {isCustomer ? 'My Reservations' : 'Reservations'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isCustomer
            ? `Your bookings and visit history — ${count} reservation${count !== 1 ? 's' : ''}`
            : 'Manage upcoming bookings and room allocations.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="glass-panel rounded-lg p-1 flex items-center gap-1">
          {(['list', 'calendar'] as const).map((v) => (
            <button
              key={`view-${v}`}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                view === v
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v === 'list' ? <List size={13} /> : <Calendar size={13} />}
              {v === 'list' ? 'List' : 'Calendar'}
            </button>
          ))}
        </div>
        <button
          onClick={onQuickBook}
          className="btn-secondary flex items-center gap-2 h-9 text-warning border-warning/25 hover:bg-warning/10"
        >
          <Zap size={14} />
          Quick Book
        </button>
        <button className="btn-secondary flex items-center gap-2 h-9">
          <Download size={14} />
          Export
        </button>
        {!isCustomer && (
          <button
            onClick={onNewReservation}
            className="flex items-center gap-2 h-9 px-4 rounded-lg font-semibold text-sm text-accent-foreground bg-accent glow-accent hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            <CalendarPlus size={14} />
            Add Reservation
          </button>
        )}
      </div>
    </div>
  );
}

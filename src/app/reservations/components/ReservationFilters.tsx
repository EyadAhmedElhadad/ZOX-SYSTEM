'use client';
import React from 'react';
import { Search } from 'lucide-react';
import type { ReservationStatus, Reservation } from './ReservationsContent';

const statuses: (ReservationStatus | 'all')[] = [
  'all',
  'Reserved',
  'Arrived',
  'Active',
  'Completed',
  'Cancelled',
  'No Show',
  'Waiting',
  'Late',
];

interface ReservationFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: ReservationStatus | 'all';
  onStatusChange: (s: ReservationStatus | 'all') => void;
  dateFilter: string;
  onDateChange: (d: string) => void;
  reservations: Reservation[];
}

export default function ReservationFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  reservations,
}: ReservationFiltersProps) {
  const countByStatus = (s: ReservationStatus | 'all') => {
    if (s === 'all') return reservations.length;
    return reservations.filter((r) => r.status === s).length;
  };

  return (
    <div className="space-y-3 mb-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer, phone, room, or game..."
            className="input-field pl-9"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="input-field w-auto sm:w-44"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((s) => {
          const count = countByStatus(s);
          return (
            <button
              key={`filter-status-${s}`}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All' : s}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

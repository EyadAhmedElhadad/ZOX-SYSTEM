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
  isCustomer?: boolean;
}

export default function ReservationFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  isCustomer = false,
}: ReservationFiltersProps) {
  return (
    <div className="glass-panel rounded-xl p-4">
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
            className="w-full bg-[#051424] border border-[#273647] rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-150"
          />
        </div>
        {!isCustomer && (
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="input-field w-auto sm:w-44"
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {statuses.map((s) => (
          <button
            key={`filter-status-${s}`}
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${
              statusFilter === s
                ? 'border-primary text-primary bg-primary/10'
                : 'border-[#273647] bg-[#0d1c2d] text-muted-foreground hover:text-foreground hover:border-border/60'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>
    </div>
  );
}

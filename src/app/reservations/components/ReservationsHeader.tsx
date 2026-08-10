import React from 'react';
import { CalendarPlus, Download, Zap } from 'lucide-react';

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
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isCustomer ? 'My Reservations' : 'Reservations'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isCustomer
            ? `Your bookings and visit history — ${count} reservation${count !== 1 ? 's' : ''}`
            : `${count} reservation${count !== 1 ? 's' : ''} — manage bookings and session assignments`}
        </p>
      </div>
      <div className="flex items-center gap-2">
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
          <button onClick={onNewReservation} className="btn-primary flex items-center gap-2 h-9">
            <CalendarPlus size={14} />
            New Reservation
          </button>
        )}
      </div>
    </div>
  );
}

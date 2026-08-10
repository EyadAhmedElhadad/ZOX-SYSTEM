import React from 'react';
import { CalendarPlus, Download } from 'lucide-react';

interface ReservationsHeaderProps {
  onNewReservation: () => void;
  count: number;
}

export default function ReservationsHeader({ onNewReservation, count }: ReservationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {count} reservation{count !== 1 ? 's' : ''} — manage bookings and session assignments
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-secondary flex items-center gap-2 h-9">
          <Download size={14} />
          Export
        </button>
        <button onClick={onNewReservation} className="btn-primary flex items-center gap-2 h-9">
          <CalendarPlus size={14} />
          New Reservation
        </button>
      </div>
    </div>
  );
}

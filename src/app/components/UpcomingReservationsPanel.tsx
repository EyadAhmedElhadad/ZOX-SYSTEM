import React from 'react';
import { CalendarClock, Users } from 'lucide-react';
import Link from 'next/link';

const upcoming = [
  {
    id: 'res-up-001',
    customer: 'Tarek Samir',
    room: 'Room 3',
    game: 'Call of Duty',
    time: '16:00',
    players: 2,
    minutesUntil: 23,
  },
  {
    id: 'res-up-002',
    customer: 'Nour Ibrahim',
    room: 'Room 5',
    game: 'FC 26',
    time: '16:15',
    players: 4,
    minutesUntil: 38,
  },
  {
    id: 'res-up-003',
    customer: 'Walid Hassan',
    room: 'Room 8',
    game: 'GTA V',
    time: '16:30',
    players: 6,
    minutesUntil: 53,
  },
  {
    id: 'res-up-004',
    customer: 'Rana Mostafa',
    room: 'Room 1',
    game: 'FC 26',
    time: '17:00',
    players: 2,
    minutesUntil: 83,
  },
  {
    id: 'res-up-005',
    customer: 'Samy Adel',
    room: 'Room 6',
    game: 'PES 2024',
    time: '17:30',
    players: 2,
    minutesUntil: 113,
  },
];

export default function UpcomingReservationsPanel() {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Upcoming Reservations</h2>
        <Link href="/reservations">
          <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
            View all
          </span>
        </Link>
      </div>
      <div className="space-y-2">
        {upcoming?.map((r) => (
          <div
            key={r?.id}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors ${
              r?.minutesUntil <= 15
                ? 'border-warning/30 bg-warning/5'
                : 'border-border bg-muted/30 hover:border-border/60'
            }`}
          >
            <div
              className={`flex-shrink-0 w-11 rounded-lg border flex flex-col items-center justify-center py-1.5 gap-0.5 ${
                r?.minutesUntil <= 15
                  ? 'border-warning/30 bg-warning/10'
                  : 'border-border/60 bg-[#0a1626]'
              }`}
            >
              <CalendarClock
                size={12}
                className={r?.minutesUntil <= 15 ? 'text-warning' : 'text-muted-foreground'}
              />
              <span className="text-[11px] font-bold font-data-mono text-foreground leading-none">
                {r?.time}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{r?.customer}</p>
              <p className="text-xs text-muted-foreground">
                {r?.room} · {r?.game}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Users size={9} /> {r?.players}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <span
                className={`text-xs font-bold font-tabular ${r?.minutesUntil <= 15 ? 'text-warning' : 'text-muted-foreground'}`}
              >
                {r?.minutesUntil}m
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">until</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

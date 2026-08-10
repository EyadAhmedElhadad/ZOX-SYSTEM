'use client';
import React, { useState, useEffect } from 'react';
import { Clock, ShoppingCart, CreditCard, Pause, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ActiveSession {
  id: string;
  room: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  customer: string;
  phone: string;
  game: string;
  startTime: string;
  startMinutesAgo: number;
  players: number;
  products: number;
  billTotal: number;
  hourlyRate: number;
  sessionType: 'open' | 'fixed';
  fixedDurationMinutes?: number;
}

const sessions: ActiveSession[] = [
  {
    id: 'session-001',
    room: 'Room 1',
    roomType: 'Standard',
    customer: 'Mohamed Khalil',
    phone: '0100-xxx-4521',
    game: 'FC 26',
    startTime: '14:30',
    startMinutesAgo: 47,
    players: 2,
    products: 2,
    billTotal: 145,
    hourlyRate: 80,
    sessionType: 'open',
  },
  {
    id: 'session-002',
    room: 'Room 2',
    roomType: 'Standard',
    customer: 'Ahmed & Group',
    phone: '0112-xxx-8834',
    game: 'GTA V',
    startTime: '13:45',
    startMinutesAgo: 92,
    players: 4,
    products: 5,
    billTotal: 310,
    hourlyRate: 120,
    sessionType: 'fixed',
    fixedDurationMinutes: 120,
  },
  {
    id: 'session-003',
    room: 'Room 4',
    roomType: 'VIP',
    customer: 'Karim Mostafa',
    phone: '0111-xxx-2267',
    game: 'FC 26',
    startTime: '14:00',
    startMinutesAgo: 77,
    players: 6,
    products: 8,
    billTotal: 520,
    hourlyRate: 200,
    sessionType: 'open',
  },
  {
    id: 'session-004',
    room: 'Room 6',
    roomType: 'Premium',
    customer: 'Youssef Mahmoud',
    phone: '0100-xxx-9901',
    game: 'PES 2024',
    startTime: '15:10',
    startMinutesAgo: 27,
    players: 2,
    products: 1,
    billTotal: 95,
    hourlyRate: 100,
    sessionType: 'fixed',
    fixedDurationMinutes: 60,
  },
  {
    id: 'session-005',
    room: 'Room 9',
    roomType: 'Standard',
    customer: 'Hassan Nour',
    phone: '0115-xxx-3312',
    game: 'Call of Duty',
    startTime: '14:50',
    startMinutesAgo: 47,
    players: 2,
    products: 0,
    billTotal: 62,
    hourlyRate: 80,
    sessionType: 'open',
  },
  {
    id: 'session-006',
    room: 'Room 10',
    roomType: 'Premium',
    customer: 'Sara & Nadia',
    phone: '0106-xxx-7741',
    game: 'FC 26',
    startTime: '15:20',
    startMinutesAgo: 17,
    players: 2,
    products: 3,
    billTotal: 78,
    hourlyRate: 100,
    sessionType: 'fixed',
    fixedDurationMinutes: 90,
  },
];

function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m`;
}

const typeColors: Record<string, string> = {
  Standard: 'text-muted-foreground bg-muted',
  Premium: 'text-info bg-info/10',
  VIP: 'text-warning bg-warning/10',
};

export default function ActiveSessionsList() {
  const [elapsed, setElapsed] = useState<Record<string, number>>(
    Object.fromEntries(sessions.map((s) => [s.id, s.startMinutesAgo]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v + 1])));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Active Sessions</h2>
          <p className="text-xs text-muted-foreground">{sessions.length} sessions running now</p>
        </div>
        <Link href="/live-sessions">
          <button className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
            Manage All <ChevronRight size={14} />
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {[
                'Room',
                'Customer',
                'Game',
                'Elapsed',
                'Players',
                'Products',
                'Bill (EGP)',
                'Actions',
              ].map((h) => (
                <th
                  key={`th-${h}`}
                  className="text-left text-xs font-semibold text-muted-foreground pb-2.5 pr-4 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const elapsedMin = elapsed[session.id] || session.startMinutesAgo;
              const sessionCost = Math.round((elapsedMin / 60) * session.hourlyRate);
              const total = sessionCost + session.products * 15;
              const isNearEnd =
                session.sessionType === 'fixed' && session.fixedDurationMinutes
                  ? elapsedMin >= session.fixedDurationMinutes - 10
                  : false;

              return (
                <tr
                  key={session.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3 pr-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{session.room}</p>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${typeColors[session.roomType]}`}
                      >
                        {session.roomType}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-foreground">{session.customer}</p>
                    <p className="text-xs text-muted-foreground">{session.phone}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm text-foreground">{session.game}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.sessionType === 'fixed'
                        ? `Fixed ${session.fixedDurationMinutes}min`
                        : 'Open-ended'}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <div
                      className={`flex items-center gap-1 ${isNearEnd ? 'text-warning' : 'text-accent'}`}
                    >
                      <Clock
                        size={12}
                        className={isNearEnd ? 'text-warning' : 'session-timer-pulse'}
                      />
                      <span className="font-tabular text-sm font-semibold">
                        {formatElapsed(elapsedMin)}
                      </span>
                    </div>
                    {isNearEnd && <p className="text-xs text-warning">Ending soon</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-foreground font-tabular">{session.players}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-sm font-tabular ${session.products > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {session.products}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-bold font-tabular text-foreground">
                      {total.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">EGP</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Add product"
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <ShoppingCart size={13} />
                      </button>
                      <button
                        title="Pause session"
                        className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                      >
                        <Pause size={13} />
                      </button>
                      <Link href="/live-sessions">
                        <button
                          title="End session & pay"
                          className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                        >
                          <CreditCard size={13} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

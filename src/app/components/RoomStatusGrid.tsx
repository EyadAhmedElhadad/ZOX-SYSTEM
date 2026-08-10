'use client';
import React, { useState } from 'react';
import { Gamepad2, Users, Clock, Zap, Tv2, Star } from 'lucide-react';
import Link from 'next/link';

type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
type RoomType = 'Standard' | 'Premium' | 'VIP';

interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  currentCustomer?: string;
  game?: string;
  sessionStart?: string;
  elapsedMinutes?: number;
  controllers: number;
  quality: number;
  psModel: string;
  note?: string;
}

const rooms: Room[] = [
  {
    id: 'room-001',
    name: 'Room 1',
    type: 'Standard',
    capacity: 2,
    status: 'occupied',
    currentCustomer: 'Mohamed K.',
    game: 'FC 26',
    sessionStart: '14:30',
    elapsedMinutes: 47,
    controllers: 2,
    quality: 3,
    psModel: 'PS5',
  },
  {
    id: 'room-002',
    name: 'Room 2',
    type: 'Standard',
    capacity: 4,
    status: 'occupied',
    currentCustomer: 'Ahmed & Group',
    game: 'GTA V',
    sessionStart: '13:45',
    elapsedMinutes: 92,
    controllers: 4,
    quality: 3,
    psModel: 'PS5',
  },
  {
    id: 'room-003',
    name: 'Room 3',
    type: 'Premium',
    capacity: 4,
    status: 'reserved',
    currentCustomer: 'Omar Sherif',
    game: 'Call of Duty',
    sessionStart: '16:00',
    elapsedMinutes: 0,
    controllers: 4,
    quality: 4,
    psModel: 'PS5',
  },
  {
    id: 'room-004',
    name: 'Room 4',
    type: 'VIP',
    capacity: 6,
    status: 'occupied',
    currentCustomer: 'Karim & Friends',
    game: 'FC 26',
    sessionStart: '14:00',
    elapsedMinutes: 77,
    controllers: 6,
    quality: 5,
    psModel: 'PS5 Pro',
    note: 'VIP — Extra drinks requested',
  },
  {
    id: 'room-005',
    name: 'Room 5',
    type: 'Standard',
    capacity: 2,
    status: 'available',
    controllers: 2,
    quality: 2,
    psModel: 'PS4',
  },
  {
    id: 'room-006',
    name: 'Room 6',
    type: 'Premium',
    capacity: 4,
    status: 'occupied',
    currentCustomer: 'Youssef M.',
    game: 'PES 2024',
    sessionStart: '15:10',
    elapsedMinutes: 27,
    controllers: 2,
    quality: 4,
    psModel: 'PS5',
  },
  {
    id: 'room-007',
    name: 'Room 7',
    type: 'Standard',
    capacity: 2,
    status: 'maintenance',
    controllers: 2,
    quality: 2,
    psModel: 'PS4',
    note: 'Controller #07 damaged',
  },
  {
    id: 'room-008',
    name: 'Room 8',
    type: 'VIP',
    capacity: 8,
    status: 'available',
    controllers: 8,
    quality: 5,
    psModel: 'PS5 Pro',
  },
];

const statusConfig: Record<
  RoomStatus,
  { label: string; bg: string; text: string; dot: string; cardClass: string }
> = {
  available: {
    label: 'Available',
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
    cardClass: 'room-available-bg',
  },
  occupied: {
    label: 'Occupied',
    bg: 'bg-danger/10',
    text: 'text-danger',
    dot: 'bg-danger',
    cardClass: 'room-occupied-bg',
  },
  reserved: {
    label: 'Reserved',
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
    cardClass: 'room-reserved-bg',
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
    cardClass: 'room-maintenance-bg',
  },
};

const typeConfig: Record<RoomType, { color: string; bg: string }> = {
  Standard: { color: 'text-muted-foreground', bg: 'bg-muted' },
  Premium: { color: 'text-info', bg: 'bg-info/10' },
  VIP: { color: 'text-warning', bg: 'bg-warning/10' },
};

function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function QualityStars({ quality }: { quality: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={`star-${i}`}
          size={10}
          className={i <= quality ? 'text-warning fill-warning' : 'text-muted-foreground'}
        />
      ))}
    </div>
  );
}

export default function RoomStatusGrid() {
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);
  const counts = {
    all: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    reserved: rooms.filter((r) => r.status === 'reserved').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Room Status</h2>
          <p className="text-xs text-muted-foreground">All gaming rooms — live view</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'available', 'occupied', 'reserved', 'maintenance'] as const).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
        {filtered.map((room) => {
          const sc = statusConfig[room.status];
          const tc = typeConfig[room.type];
          return (
            <div
              key={room.id}
              className={`border rounded-xl p-3 transition-all duration-200 cursor-pointer hover:border-primary/40 ${sc.cardClass}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{room.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`status-badge text-xs ${tc.bg} ${tc.color}`}>{room.type}</span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tv2 size={11} />
                  <span className="font-medium text-foreground">{room.psModel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users size={11} />
                  <span>Max {room.capacity} players</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Gamepad2 size={11} />
                  <span>{room.controllers} controllers</span>
                </div>
                <QualityStars quality={room.quality} />
              </div>

              {room.status === 'occupied' && room.currentCustomer && (
                <div className="bg-background/50 rounded-lg p-2 space-y-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {room.currentCustomer}
                  </p>
                  {room.game && <p className="text-xs text-muted-foreground">{room.game}</p>}
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <Clock size={10} className="session-timer-pulse" />
                    <span className="font-tabular font-semibold">
                      {formatElapsed(room.elapsedMinutes || 0)}
                    </span>
                    <span className="text-muted-foreground">since {room.sessionStart}</span>
                  </div>
                </div>
              )}

              {room.status === 'reserved' && room.currentCustomer && (
                <div className="bg-background/50 rounded-lg p-2">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {room.currentCustomer}
                  </p>
                  <p className="text-xs text-warning">Arriving at {room.sessionStart}</p>
                </div>
              )}

              {room.status === 'maintenance' && room.note && (
                <div className="bg-danger/5 rounded-lg p-2">
                  <p className="text-xs text-danger">{room.note}</p>
                </div>
              )}

              {room.status === 'available' && (
                <Link
                  href="/reservations"
                  className="w-full mt-1 py-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold rounded-lg hover:bg-accent/20 transition-colors flex items-center justify-center"
                >
                  <Zap size={11} className="mr-1" />
                  Quick Assign
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

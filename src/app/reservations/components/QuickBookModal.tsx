'use client';
import React, { useState } from 'react';
import { X, Zap, Gamepad2, Users, CalendarClock, Check } from 'lucide-react';
import type { Reservation } from './ReservationsContent';
import { toast } from 'sonner';

type Category = 'playstation' | 'billiards' | 'cafe';

interface BookingLocation {
  name: string;
  roomType: Reservation['roomType'];
  capacity: number;
}

const locations: Record<Category, BookingLocation[]> = {
  playstation: [
    { name: 'Room 1', roomType: 'Standard', capacity: 2 },
    { name: 'Room 2', roomType: 'Standard', capacity: 4 },
    { name: 'Room 3', roomType: 'Premium', capacity: 4 },
    { name: 'Room 4', roomType: 'VIP', capacity: 6 },
    { name: 'Room 5', roomType: 'Standard', capacity: 2 },
    { name: 'Room 6', roomType: 'Premium', capacity: 4 },
    { name: 'Room 7', roomType: 'Standard', capacity: 2 },
    { name: 'Room 8', roomType: 'VIP', capacity: 8 },
  ],
  billiards: [
    { name: 'Billiards Table 1', roomType: 'Standard', capacity: 4 },
    { name: 'Billiards Table 2', roomType: 'Standard', capacity: 4 },
  ],
  cafe: Array.from({ length: 10 }, (_, i) => ({
    name: `Cafe Table ${i + 1}`,
    roomType: 'Standard',
    capacity: 4,
  })),
};

const games = ['FC 26', 'GTA V', 'Call of Duty', 'PES 2024', 'Mortal Kombat 1', 'WWE 2K25'];

const categoryMeta: Record<Category, { label: string; emoji: string }> = {
  playstation: { label: 'PlayStation', emoji: '🎮' },
  billiards: { label: 'Billiards', emoji: '🎱' },
  cafe: { label: 'Cafe', emoji: '☕' },
};

interface QuickBookModalProps {
  defaultCustomer?: string;
  createdBy?: 'staff' | 'customer';
  onClose: () => void;
  onSave: (res: Reservation) => void;
}

export default function QuickBookModal({
  defaultCustomer = '',
  createdBy = 'staff',
  onClose,
  onSave,
}: QuickBookModalProps) {
  const [category, setCategory] = useState<Category>('playstation');
  const [table, setTable] = useState<string | null>(null);
  const [customer, setCustomer] = useState(defaultCustomer);
  const [phone, setPhone] = useState('');
  const [game, setGame] = useState('FC 26');
  const [players, setPlayers] = useState(2);
  const [date, setDate] = useState('2026-08-08');
  const [time, setTime] = useState('17:00');
  const [duration, setDuration] = useState('60');

  const currentLocations = locations[category];
  const selected = currentLocations.find((l) => l.name === table);

  const switchCategory = (c: Category) => {
    setCategory(c);
    setTable(null);
  };

  const handleBook = () => {
    if (!table) {
      toast.error('Pick a table or room first');
      return;
    }
    if (!customer.trim()) {
      toast.error('Enter the customer name');
      return;
    }
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      customer: customer.trim(),
      phone: phone.trim() || '—',
      room: table,
      roomType: selected?.roomType ?? 'Standard',
      game: category === 'playstation' ? game : '—',
      players: Math.min(players, selected?.capacity ?? 8),
      date,
      time,
      duration: duration || null,
      status: 'Reserved',
      sessionType: duration ? 'fixed' : 'open',
      createdBy,
      customerStatus: 'New',
      category,
    };
    onSave(newRes);
    toast.success(`${table} booked for ${customer.trim()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-warning/15 border border-warning/25 text-warning flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Quick Book</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick a location and book in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin flex-1">
          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Customer <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="input-field"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Location type
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(categoryMeta) as Category[]).map((c) => (
                <button
                  key={`cat-${c}`}
                  onClick={() => switchCategory(c)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-95 ${
                    category === c
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{categoryMeta[c].emoji}</span>
                  {categoryMeta[c].label}
                </button>
              ))}
            </div>
          </div>

          {/* Tables */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Select{' '}
              {category === 'playstation'
                ? 'room'
                : category === 'billiards'
                  ? 'billiards table'
                  : 'cafe table'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentLocations.map((loc) => {
                const isSelected = table === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => setTable(loc.name)}
                    className={`relative p-3 rounded-xl border text-left transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/20 hover:border-border/60'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={10} />
                      </span>
                    )}
                    <p className="text-sm font-semibold text-foreground">{loc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {category === 'playstation'
                        ? `${loc.roomType} · max ${loc.capacity}`
                        : `Seats up to ${loc.capacity}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game (playstation only) + players */}
          <div className="grid grid-cols-2 gap-3">
            {category === 'playstation' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  <Gamepad2 size={13} className="inline mr-1" />
                  Game
                </label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="input-field"
                >
                  {games.map((g) => (
                    <option key={`qb-game-${g}`} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <Users size={13} className="inline mr-1" />
                Players
              </label>
              <select
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={`qb-p-${n}`} value={n}>
                    {n} {n === 1 ? 'player' : 'players'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                <CalendarClock size={13} className="inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field"
              >
                <option value="">Open</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          {table && (
            <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-xl">
              <span className="text-sm font-semibold text-accent">
                {categoryMeta[category].emoji} {table}
              </span>
              <span className="text-xs text-muted-foreground">
                {date} · {time} · {duration ? `${duration} min` : 'Open-ended'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={!table || !customer.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Zap size={14} />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

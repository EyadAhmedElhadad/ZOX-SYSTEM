'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CalendarClock,
  Users,
  Star,
  Gamepad2,
  Monitor,
  ChevronRight,
  Plus,
  X,
  Trophy,
  History,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const upcoming = [
  {
    id: 'cus-res-001',
    room: 'Room 5',
    roomType: 'Premium',
    game: 'FC 26',
    date: '2026-08-12',
    time: '17:00',
    players: 2,
    duration: '120 min',
    status: 'Confirmed',
  },
  {
    id: 'cus-res-002',
    room: 'Room 3',
    roomType: 'Standard',
    game: 'Call of Duty',
    date: '2026-08-14',
    time: '19:30',
    players: 2,
    duration: '60 min',
    status: 'Confirmed',
  },
];

const pastVisits = [
  {
    id: 'pv-001',
    game: 'FC 26',
    room: 'Room 2',
    date: '2026-08-05',
    duration: '90 min',
    cost: 160,
  },
  {
    id: 'pv-002',
    game: 'GTA V',
    room: 'Room 8',
    date: '2026-08-02',
    duration: '120 min',
    cost: 260,
  },
  {
    id: 'pv-003',
    game: 'PES 2024',
    room: 'Room 6',
    date: '2026-07-29',
    duration: '60 min',
    cost: 110,
  },
];

const statusStyles: Record<string, string> = {
  Confirmed: 'bg-accent/10 text-accent border border-accent/20',
  Pending: 'bg-warning/10 text-warning border border-warning/20',
  Cancelled: 'bg-danger/10 text-danger border border-danger/20',
};

export default function CustomerDashboardContent() {
  const { user } = useAuth();
  const [bookOpen, setBookOpen] = useState(false);
  const [booking, setBooking] = useState({
    date: '2026-08-15',
    time: '18:00',
    game: 'FC 26',
    players: 2,
    roomType: 'Standard',
  });

  const firstName = user?.name?.split(' ')[0] ?? 'Guest';
  const loyaltyPoints = 1240;
  const nextReward = 2000;
  const progress = Math.min(100, Math.round((loyaltyPoints / nextReward) * 100));

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Reservation requested — we will confirm shortly');
    setBookOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your sessions, rewards, and bookings
          </p>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="btn-primary flex items-center gap-2 h-9"
        >
          <Plus size={14} />
          Book a Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Gamepad2 size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loyalty Points</p>
              <p className="text-lg font-bold text-foreground font-tabular">
                {loyaltyPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CalendarClock size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Upcoming Bookings</p>
              <p className="text-lg font-bold text-foreground font-tabular">{upcoming.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Trophy size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Tier</p>
              <p className="text-lg font-bold text-warning">Gold</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
              <History size={18} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Visits</p>
              <p className="text-lg font-bold text-foreground font-tabular">27</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Loyalty card */}
          <div className="card-base p-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
              <div>
                <h2 className="text-base font-semibold text-foreground">Loyalty Rewards</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {nextReward - loyaltyPoints} points to your next free session
                </p>
              </div>
              <div className="flex items-center gap-2 text-warning">
                <Star size={18} className="fill-warning" />
                <span className="text-sm font-bold">{loyaltyPoints.toLocaleString()} pts</span>
              </div>
            </div>
            <div className="mt-4 relative">
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-muted-foreground font-tabular">
                <span>0</span>
                <span>{nextReward.toLocaleString()} pts → Free Session</span>
              </div>
            </div>
          </div>

          {/* Upcoming bookings */}
          <div className="card-base p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Upcoming Bookings</h2>
                <p className="text-xs text-muted-foreground">Your reserved sessions</p>
              </div>
              <Link href="/reservations">
                <button className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                  View all <ChevronRight size={14} />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcoming.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.game}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.room} · {r.roomType}
                      </p>
                    </div>
                    <span className={`status-badge ${statusStyles[r.status]}`}>{r.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock size={11} /> {r.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {r.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {r.players}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                    <span className="text-xs text-muted-foreground">{r.duration}</span>
                    <button className="text-xs text-danger font-semibold hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visit history */}
          <div className="card-base overflow-hidden">
            <div className="p-4 pb-3">
              <h2 className="text-base font-semibold text-foreground">Visit History</h2>
              <p className="text-xs text-muted-foreground">Your recent gaming sessions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-y border-border bg-muted/30">
                    {['Game', 'Room', 'Date', 'Duration', 'Cost (EGP)'].map((h) => (
                      <th
                        key={`th-${h}`}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pastVisits.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">{v.game}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.room}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.duration}</td>
                      <td className="px-4 py-3 font-semibold text-foreground font-tabular">
                        {v.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="card-base p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Monitor size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No Active Session</p>
                <p className="text-xs text-muted-foreground">Book a room to start playing</p>
              </div>
            </div>
            <button
              onClick={() => setBookOpen(true)}
              className="w-full btn-primary flex items-center justify-center gap-2 h-10"
            >
              <Plus size={14} />
              Book Now
            </button>
          </div>

          <div className="card-base p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Popular Games</h2>
            <div className="space-y-2">
              {[
                { game: 'FC 26', players: 42 },
                { game: 'Call of Duty', players: 31 },
                { game: 'GTA V', players: 25 },
                { game: 'PES 2024', players: 18 },
              ].map((g) => (
                <div
                  key={g.game}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20"
                >
                  <span className="text-sm font-medium text-foreground">{g.game}</span>
                  <span className="text-xs text-muted-foreground">{g.players} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {bookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setBookOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Book a Session</h2>
              <button
                onClick={() => setBookOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Date</label>
                  <input
                    type="date"
                    value={booking.date}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Time</label>
                  <input
                    type="time"
                    value={booking.time}
                    onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Game</label>
                <select
                  value={booking.game}
                  onChange={(e) => setBooking({ ...booking, game: e.target.value })}
                  className="input-field"
                >
                  <option>FC 26</option>
                  <option>Call of Duty</option>
                  <option>GTA V</option>
                  <option>PES 2024</option>
                  <option>Mortal Kombat 1</option>
                  <option>WWE 2K25</option>
                  <option>Spider-Man 2</option>
                  <option>God of War</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Players
                  </label>
                  <select
                    value={booking.players}
                    onChange={(e) => setBooking({ ...booking, players: Number(e.target.value) })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'player' : 'players'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Room Type
                  </label>
                  <select
                    value={booking.roomType}
                    onChange={(e) => setBooking({ ...booking, roomType: e.target.value })}
                    className="input-field"
                  >
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>VIP</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookOpen(false)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 h-10">
                  Request Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

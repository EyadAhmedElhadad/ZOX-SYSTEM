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
  CheckCircle2,
  Coffee,
  Timer,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import CustomerFeedbackModal from './CustomerFeedbackModal';

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

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const activeSession = {
  station: 'Station 04',
  room: 'VIP Room',
  game: 'Cyberpunk 2077',
  remaining: '01:45:22',
  progress: 65,
};

export default function CustomerDashboardContent() {
  const { user } = useAuth();
  const [bookOpen, setBookOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [booking, setBooking] = useState({
    date: '2026-08-15',
    time: '18:00',
    game: 'FC 26',
    players: 2,
    roomType: 'Standard',
  });

  const feedbackSession = { game: 'FC 26', room: 'Room 2', date: '2026-08-05', time: '17:30' };

  const firstName = user?.name?.split(' ')[0] ?? 'Guest';
  const loyaltyPoints = 1240;
  const nextReward = 2000;
  const progress = Math.min(100, Math.round((loyaltyPoints / nextReward) * 100));

  const nextBooking = upcoming[0];
  const [, nextMonth, nextDay] = nextBooking.date.split('-');

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Reservation requested — we will confirm shortly');
    setBookOpen(false);
  };

  return (
    <div className="relative p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-accent/10 blur-[120px]" />

      <Toaster position="bottom-right" theme="system" />

      {/* Hero */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your sessions, rewards, and bookings
          </p>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground text-sm shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-150 hover:opacity-90 hover:shadow-[0_0_28px_rgba(124,58,237,0.6)] active:scale-95"
        >
          <Plus size={16} />
          Book a Session
        </button>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 flex items-center gap-3 glow-hover">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Gamepad2 size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Loyalty Points</p>
            <p className="text-lg font-bold text-foreground font-tabular">
              {loyaltyPoints.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 flex items-center gap-3 glow-hover">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <CalendarClock size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Upcoming Bookings</p>
            <p className="text-lg font-bold text-foreground font-tabular">{upcoming.length}</p>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 flex items-center gap-3 glow-hover">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member Tier</p>
            <p className="text-lg font-bold text-warning">Gold</p>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 flex items-center gap-3 glow-hover">
          <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center shrink-0">
            <History size={18} className="text-info" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Visits</p>
            <p className="text-lg font-bold text-foreground font-tabular">27</p>
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active session */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 relative overflow-hidden glow-hover">
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-accent border border-accent/40 bg-accent/10 pulse-emerald">
                  <CheckCircle2 size={12} />
                  Active Session
                </span>
                <h2 className="mt-3 text-lg font-bold text-foreground">
                  {activeSession.station} - {activeSession.room}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-1.5">
                  <Monitor size={14} className="text-accent" />
                  Playing: {activeSession.game}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Timer size={12} />
                  Time Remaining
                </p>
                <p className="mt-1 font-data-mono text-primary text-3xl font-bold session-timer-pulse">
                  {activeSession.remaining}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Session progress</span>
                <span className="font-tabular">{activeSession.progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#273647] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_12px_rgba(78,222,163,0.6)] transition-all duration-500"
                  style={{ width: `${activeSession.progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toast.success('Time extension requested — your station is secured')}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground border border-border transition-all duration-150 hover:border-primary hover:text-foreground"
              >
                <Clock size={14} />
                Extend Time
              </button>
              <button
                onClick={() =>
                  toast.success('Food order sent to the cafe — heading to your station')
                }
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground border border-border transition-all duration-150 hover:border-primary hover:text-foreground"
              >
                <Coffee size={14} />
                Order Food
              </button>
            </div>
          </div>
        </div>

        {/* Loyalty points */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-5 relative overflow-hidden vip-border glow-hover">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-warning/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-warning/10 border border-warning/25 flex items-center justify-center">
              <Trophy size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tier
              </p>
              <p className="text-sm font-bold text-foreground">Gold Tier</p>
            </div>
          </div>
          <div className="relative mt-4 flex items-end gap-1.5">
            <p className="font-bold text-3xl text-warning font-tabular">
              {loyaltyPoints.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground pb-1">pts</p>
          </div>
          <p className="relative mt-1 text-xs text-muted-foreground">
            {nextReward - loyaltyPoints} pts to next tier
          </p>
          <div className="relative mt-4">
            <div className="w-full h-2 bg-[#273647] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-warning shadow-[0_0_10px_rgba(233,196,0,0.6)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground font-tabular">
              <span>0</span>
              <span>{nextReward.toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Upcoming booking + cafe featured */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-5 glow-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Upcoming Booking</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your next reserved session</p>
              </div>
              <Link
                href="/reservations"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
              <div className="w-14 h-14 rounded-xl bg-muted border border-border flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {months[Number(nextMonth) - 1]}
                </span>
                <span className="font-data-mono text-lg font-bold text-primary leading-none mt-0.5">
                  {Number(nextDay)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {nextBooking.game} - {nextBooking.roomType}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {nextBooking.room} · {nextBooking.roomType}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} /> {nextBooking.players}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {nextBooking.duration}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`status-badge ${statusStyles[nextBooking.status]}`}>
                  {nextBooking.status}
                </span>
                <p className="mt-1.5 font-data-mono text-primary font-bold text-sm">
                  {nextBooking.time}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden glow-hover relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b2b12] via-[#1a2740] to-[#122031]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-warning/15 blur-3xl pointer-events-none" />
            <div className="relative p-5 h-full flex flex-col justify-end min-h-[170px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-warning">
                    Cafe Featured
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-foreground">Signature Iced Latte</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Freshly brewed · EGP 85</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Coffee size={18} className="text-accent" />
                </div>
              </div>
              <button
                onClick={() => toast.success('Order sent to the cafe — heading to your station')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground w-fit shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-150 hover:opacity-90 active:scale-95"
              >
                <Coffee size={14} />
                Order to Station
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visit history + right column */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden glow-hover">
          <div className="p-4 pb-3">
            <h2 className="text-base font-semibold text-foreground">Visit History</h2>
            <p className="text-xs text-muted-foreground">Your recent gaming sessions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-y border-[#273647] bg-[#0a1526]">
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
                    className="border-b border-[#273647]/60 last:border-0 hover:bg-muted/20 transition-colors"
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

        {/* Right column */}
        <div className="space-y-4">
          {!feedbackSubmitted && (
            <div className="glass-panel rounded-xl p-4 border-primary/30 glow-hover relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
              <div className="relative flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                  <Star size={18} className="text-warning fill-warning" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Your session just ended!</p>
                  <p className="text-xs text-muted-foreground">
                    {feedbackSession.game} · {feedbackSession.room} · {feedbackSession.date}
                  </p>
                </div>
              </div>
              <p className="relative text-xs text-muted-foreground mb-3">
                How was your experience? Take 30 seconds to rate it and leave a note — it helps us
                improve.
              </p>
              <button
                onClick={() => setFeedbackOpen(true)}
                className="relative w-full btn-primary flex items-center justify-center gap-2 h-10"
              >
                <Star size={14} />
                Rate your experience
              </button>
            </div>
          )}

          <div className="glass-panel rounded-xl p-4 glow-hover">
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

      {feedbackOpen && (
        <CustomerFeedbackModal
          session={feedbackSession}
          customer={user?.name}
          onClose={() => {
            setFeedbackOpen(false);
            setFeedbackSubmitted(true);
          }}
        />
      )}
    </div>
  );
}

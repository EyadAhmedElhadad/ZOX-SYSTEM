'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReservationsHeader from './ReservationsHeader';
import ReservationFilters from './ReservationFilters';
import ReservationsTable from './ReservationsTable';
import ReservationDrawer from './ReservationDrawer';
import QuickBookModal from './QuickBookModal';
import RateCustomerModal from './RateCustomerModal';
import { toast, Toaster } from 'sonner';
import { reservationsApi, useAsyncData, toastApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export type ReservationStatus =
  'Reserved' | 'Arrived' | 'Active' | 'Completed' | 'Cancelled' | 'No Show' | 'Waiting' | 'Late';

export interface Reservation {
  id: string;
  customer: string;
  phone: string;
  room: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  game: string;
  players: number;
  date: string;
  time: string;
  duration: string | null;
  status: ReservationStatus;
  sessionType: 'open' | 'fixed';
  notes?: string;
  createdBy: 'staff' | 'customer';
  customerStatus: 'New' | 'Regular' | 'Loyal' | 'VIP' | 'Low Reliability';
  category?: 'playstation' | 'billiards' | 'cafe';
}

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function MiniCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const monthLabel = base.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = (base.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const bookedDays = [3, 8, 12, 22];
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <span
            key={`wd-${d}`}
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) =>
          d === null ? (
            <span key={`cal-empty-${i}`} />
          ) : (
            <span
              key={`cal-day-${d}`}
              className={`relative h-8 flex items-center justify-center text-xs rounded-full transition-colors ${
                now.getDate() === d && now.getMonth() === month && now.getFullYear() === year
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground'
              }`}
            >
              {d}
              {bookedDays.includes(d) && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />
              )}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function CapacitySnapshot() {
  const bars = [
    {
      label: 'VIP Lounges',
      current: 3,
      total: 5,
      fill: 'bg-[#e9c400] shadow-[0_0_8px_rgba(233,196,0,0.35)]',
    },
    {
      label: 'Standard Stations',
      current: 18,
      total: 24,
      fill: 'bg-accent shadow-[0_0_8px_rgba(78,222,163,0.35)]',
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Capacity Snapshot</h3>
        <span className="text-xs font-data-mono text-muted-foreground">Today</span>
      </div>
      <div className="space-y-4">
        {bars.map((b) => (
          <div key={`cap-${b.label}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">{b.label}</span>
              <span className="text-xs font-data-mono font-semibold text-foreground">
                {b.current}/{b.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#0a0a12] overflow-hidden">
              <div
                className={`h-full rounded-full ${b.fill}`}
                style={{ width: `${Math.round((b.current / b.total) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-[#273647] flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Total Expected</span>
        <span className="text-sm font-bold font-data-mono text-accent">42 Guests</span>
      </div>
    </div>
  );
}

export default function ReservationsContent() {
  const { user, role } = useAuth();
  const isCustomer = role === 'customer';
  const customerName = user?.name ?? '';
  const { data, loading, reload } = useAsyncData(() => reservationsApi.list(), []);
  const reservations = (data ?? []).map((r): Reservation => ({ ...r, customerStatus: 'Regular' }));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('2026-08-08');
  const [rateTarget, setRateTarget] = useState<Reservation | null>(null);
  const [quickBookOpen, setQuickBookOpen] = useState(false);

  const filtered = reservations.filter((r) => {
    const matchesCustomer = !isCustomer || r.customer === customerName;
    const matchesSearch =
      !searchQuery ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = isCustomer || !dateFilter || r.date === dateFilter;
    return matchesCustomer && matchesSearch && matchesStatus && matchesDate;
  });

  const handleAddReservation = async (newRes: Reservation) => {
    try {
      await reservationsApi.create({
        customer_id: null,
        guest_name: newRes.customer,
        phone: newRes.phone,
        room_id: null,
        category: newRes.category ?? 'playstation',
        game: newRes.game,
        players: newRes.players,
        res_date: newRes.date,
        res_time: newRes.time,
        duration_minutes: newRes.duration ? Number(newRes.duration) : null,
        session_kind: newRes.sessionType,
        notes: newRes.notes ?? null,
        created_by_role: newRes.createdBy,
      });
      setDateFilter(newRes.date);
      setDrawerOpen(false);
      toast.success('Reservation saved');
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    try {
      await reservationsApi.update(id, { status });
      toast.success(`Reservation marked as ${status}`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <Toaster position="bottom-right" theme="system" />
      <ReservationsHeader
        onNewReservation={() => setDrawerOpen(true)}
        onQuickBook={() => setQuickBookOpen(true)}
        count={filtered.length}
        isCustomer={isCustomer}
      />
      {loading ? (
        <div className="glass-panel p-10 text-center text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <ReservationFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              reservations={reservations}
              isCustomer={isCustomer}
            />
            <ReservationsTable
              reservations={filtered}
              onStatusChange={handleStatusChange}
              onRateCustomer={isCustomer ? undefined : setRateTarget}
              isCustomer={isCustomer}
            />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <MiniCalendar />
            <CapacitySnapshot />
          </div>
        </div>
      )}
      {drawerOpen && (
        <ReservationDrawer onClose={() => setDrawerOpen(false)} onSave={handleAddReservation} />
      )}
      {quickBookOpen && (
        <QuickBookModal
          defaultCustomer={isCustomer ? customerName : ''}
          createdBy={isCustomer ? 'customer' : 'staff'}
          onClose={() => setQuickBookOpen(false)}
          onSave={handleAddReservation}
        />
      )}
      {rateTarget && (
        <RateCustomerModal
          customer={rateTarget.customer}
          room={rateTarget.room}
          game={rateTarget.game}
          onClose={() => setRateTarget(null)}
        />
      )}
    </div>
  );
}

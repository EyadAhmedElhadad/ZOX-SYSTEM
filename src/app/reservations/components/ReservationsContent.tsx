'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReservationsHeader from './ReservationsHeader';
import ReservationFilters from './ReservationFilters';
import ReservationsTable from './ReservationsTable';
import ReservationDrawer from './ReservationDrawer';
import QuickBookModal from './QuickBookModal';
import RateCustomerModal from './RateCustomerModal';
import { Toaster } from 'sonner';
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

export const mockReservations: Reservation[] = [
  {
    id: 'res-001',
    customer: 'Mohamed Khalil',
    phone: '01001234521',
    room: 'Room 1',
    roomType: 'Standard',
    game: 'FC 26',
    players: 2,
    date: '2026-08-08',
    time: '14:30',
    duration: null,
    status: 'Active',
    sessionType: 'open',
    createdBy: 'staff',
    customerStatus: 'Regular',
  },
  {
    id: 'res-002',
    customer: 'Ahmed Samir',
    phone: '01124568834',
    room: 'Room 2',
    roomType: 'Standard',
    game: 'GTA V',
    players: 4,
    date: '2026-08-08',
    time: '13:45',
    duration: '120',
    status: 'Active',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Loyal',
  },
  {
    id: 'res-003',
    customer: 'Omar Sherif',
    phone: '01005671234',
    room: 'Room 3',
    roomType: 'Premium',
    game: 'Call of Duty',
    players: 2,
    date: '2026-08-08',
    time: '16:00',
    duration: '60',
    status: 'Reserved',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
    notes: 'First visit — new customer',
  },
  {
    id: 'res-004',
    customer: 'Karim Mostafa',
    phone: '01119872267',
    room: 'Room 4',
    roomType: 'VIP',
    game: 'FC 26',
    players: 6,
    date: '2026-08-08',
    time: '14:00',
    duration: null,
    status: 'Active',
    sessionType: 'open',
    createdBy: 'staff',
    customerStatus: 'VIP',
    notes: 'VIP — extra drinks requested',
  },
  {
    id: 'res-005',
    customer: 'Tarek Samir',
    phone: '01009871234',
    room: 'Room 3',
    roomType: 'Premium',
    game: 'Call of Duty',
    players: 2,
    date: '2026-08-08',
    time: '16:00',
    duration: '60',
    status: 'Reserved',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'New',
  },
  {
    id: 'res-006',
    customer: 'Nour Ibrahim',
    phone: '01154321234',
    room: 'Room 5',
    roomType: 'Standard',
    game: 'FC 26',
    players: 4,
    date: '2026-08-08',
    time: '16:15',
    duration: '90',
    status: 'Reserved',
    sessionType: 'fixed',
    createdBy: 'staff',
    customerStatus: 'Regular',
  },
  {
    id: 'res-007',
    customer: 'Hassan Mostafa',
    phone: '01231456789',
    room: 'Room 6',
    roomType: 'Premium',
    game: 'PES 2024',
    players: 2,
    date: '2026-08-08',
    time: '12:00',
    duration: '60',
    status: 'Completed',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Loyal',
  },
  {
    id: 'res-008',
    customer: 'Ramy Adel',
    phone: '01009876543',
    room: 'Room 7',
    roomType: 'Standard',
    game: 'GTA V',
    players: 2,
    date: '2026-08-08',
    time: '11:30',
    duration: '60',
    status: 'No Show',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Low Reliability',
  },
  {
    id: 'res-009',
    customer: 'Salma Youssef',
    phone: '01122334455',
    room: 'Room 8',
    roomType: 'VIP',
    game: 'FC 26',
    players: 4,
    date: '2026-08-08',
    time: '17:00',
    duration: null,
    status: 'Waiting',
    sessionType: 'open',
    createdBy: 'staff',
    customerStatus: 'Regular',
  },
  {
    id: 'res-010',
    customer: 'Walid Hassan',
    phone: '01098765432',
    room: 'Room 8',
    roomType: 'VIP',
    game: 'GTA V',
    players: 6,
    date: '2026-08-08',
    time: '16:30',
    duration: '90',
    status: 'Reserved',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Loyal',
  },
  {
    id: 'res-011',
    customer: 'Dina Khaled',
    phone: '01234567890',
    room: 'Room 2',
    roomType: 'Standard',
    game: 'Call of Duty',
    players: 2,
    date: '2026-08-07',
    time: '18:00',
    duration: '60',
    status: 'Completed',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'New',
  },
  {
    id: 'res-012',
    customer: 'Amr Nasser',
    phone: '01001112233',
    room: 'Room 1',
    roomType: 'Standard',
    game: 'FC 26',
    players: 2,
    date: '2026-08-07',
    time: '20:00',
    duration: '90',
    status: 'Cancelled',
    sessionType: 'fixed',
    createdBy: 'staff',
    customerStatus: 'Regular',
    notes: 'Cancelled by customer — 2h before',
  },
  {
    id: 'res-013',
    customer: 'Hana Mostafa',
    phone: '01123344556',
    room: 'Waiting',
    roomType: 'Premium',
    game: 'FC 26',
    players: 4,
    date: '2026-08-08',
    time: '17:30',
    duration: '60',
    status: 'Waiting',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
    notes: 'Waiting for Room 6 to free up',
  },
  {
    id: 'res-014',
    customer: 'Yara Emad',
    phone: '01034455667',
    room: 'Waiting',
    roomType: 'VIP',
    game: 'Call of Duty',
    players: 6,
    date: '2026-08-08',
    time: '18:00',
    duration: '120',
    status: 'Waiting',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Loyal',
    notes: 'Group birthday party — wants VIP room',
  },
  {
    id: 'res-015',
    customer: 'Mostafa Tarek',
    phone: '01145566778',
    room: 'Waiting',
    roomType: 'Standard',
    game: 'GTA V',
    players: 2,
    date: '2026-08-08',
    time: '18:15',
    duration: '90',
    status: 'Waiting',
    sessionType: 'fixed',
    createdBy: 'staff',
    customerStatus: 'New',
  },
  {
    id: 'res-016',
    customer: 'Rana Khaled',
    phone: '01056677889',
    room: 'Waiting',
    roomType: 'Premium',
    game: 'PES 2024',
    players: 2,
    date: '2026-08-08',
    time: '18:30',
    duration: '60',
    status: 'Waiting',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
    notes: 'Waiting — 20 min so far',
  },
  {
    id: 'res-017',
    customer: 'Omar Fathy',
    phone: '01167788990',
    room: 'Waiting',
    roomType: 'Standard',
    game: 'FC 26',
    players: 2,
    date: '2026-08-08',
    time: '19:00',
    duration: '60',
    status: 'Waiting',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'New',
    notes: 'Walk-in — no room available',
  },
  {
    id: 'res-020',
    customer: 'Ahmed Khalil',
    phone: '01005667890',
    room: 'Room 1',
    roomType: 'Standard',
    game: 'FC 26',
    players: 2,
    date: '2026-08-08',
    time: '15:00',
    duration: null,
    status: 'Active',
    sessionType: 'open',
    createdBy: 'customer',
    customerStatus: 'Regular',
  },
  {
    id: 'res-021',
    customer: 'Ahmed Khalil',
    phone: '01005667890',
    room: 'Room 3',
    roomType: 'Standard',
    game: 'Call of Duty',
    players: 2,
    date: '2026-08-09',
    time: '18:00',
    duration: '60',
    status: 'Reserved',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
  },
  {
    id: 'res-022',
    customer: 'Ahmed Khalil',
    phone: '01005667890',
    room: 'Room 5',
    roomType: 'Premium',
    game: 'FC 26',
    players: 2,
    date: '2026-08-12',
    time: '17:00',
    duration: '120',
    status: 'Reserved',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
  },
  {
    id: 'res-023',
    customer: 'Ahmed Khalil',
    phone: '01005667890',
    room: 'Room 2',
    roomType: 'Standard',
    game: 'FC 26',
    players: 2,
    date: '2026-08-05',
    time: '18:30',
    duration: '90',
    status: 'Completed',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
  },
  {
    id: 'res-024',
    customer: 'Ahmed Khalil',
    phone: '01005667890',
    room: 'Room 8',
    roomType: 'VIP',
    game: 'GTA V',
    players: 4,
    date: '2026-08-02',
    time: '20:00',
    duration: '120',
    status: 'Completed',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
  },
  {
    id: 'res-025',
    customer: 'Ahmed Khalil',
    phone: '01005667890',
    room: 'Room 6',
    roomType: 'Premium',
    game: 'PES 2024',
    players: 2,
    date: '2026-07-29',
    time: '21:00',
    duration: '60',
    status: 'Completed',
    sessionType: 'fixed',
    createdBy: 'customer',
    customerStatus: 'Regular',
  },
];

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
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
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

  const handleAddReservation = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
    setDateFilter(newRes.date);
    setDrawerOpen(false);
  };

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
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

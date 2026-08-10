'use client';
import React, { useState } from 'react';
import ReservationsHeader from './ReservationsHeader';
import ReservationFilters from './ReservationFilters';
import ReservationsTable from './ReservationsTable';
import ReservationDrawer from './ReservationDrawer';
import { Toaster } from 'sonner';

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
];

export default function ReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('2026-08-08');

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = !dateFilter || r.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleAddReservation = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
    setDrawerOpen(false);
  };

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <Toaster position="bottom-right" theme="system" />
      <ReservationsHeader onNewReservation={() => setDrawerOpen(true)} count={filtered.length} />
      <ReservationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        reservations={reservations}
      />
      <ReservationsTable reservations={filtered} onStatusChange={handleStatusChange} />
      {drawerOpen && (
        <ReservationDrawer onClose={() => setDrawerOpen(false)} onSave={handleAddReservation} />
      )}
    </div>
  );
}

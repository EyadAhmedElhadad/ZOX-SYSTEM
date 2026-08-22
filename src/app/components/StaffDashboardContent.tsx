'use client';
import React, { useMemo, useState } from 'react';
import DashboardTopBar from './DashboardTopBar';
import QuickStatsRow from './QuickStatsRow';
import RoomStatusGrid, { type Room } from './RoomStatusGrid';
import ActiveSessionsList, { type ActiveSession } from './ActiveSessionsList';
import UpcomingReservationsPanel from './UpcomingReservationsPanel';
import WaitingListPanel from './WaitingListPanel';
import QuickActionsPanel from './QuickActionsPanel';
import QuickActionsMenu from '@/app/live-sessions/components/QuickActionsMenu';
import QuickActionModal, {
  type QuickActionTarget,
  type QuickActionResponse,
} from '@/app/live-sessions/components/QuickActionModal';
import { toast, Toaster } from 'sonner';
import { ZONES, type ZoneSession } from '@/data/zones';

const initialRooms: Room[] = [
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
    note: 'VIP - Extra drinks requested',
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

function roomTypeForZone(zone: ZoneSession): Room['type'] {
  if (zone.zoneType === 'playstation') return 'Standard';
  if (zone.zoneType === 'billiards') return 'Premium';
  return 'VIP';
}

function toActiveSession(zone: ZoneSession): ActiveSession {
  return {
    id: zone.id,
    room: zone.zoneName,
    roomType: roomTypeForZone(zone),
    customer: zone.customer,
    phone: '---',
    game: zone.products[0]?.name ?? 'Session',
    startTime: 'Now',
    startMinutesAgo: 0,
    players: zone.players,
    products: zone.products.reduce((sum, p) => sum + p.qty, 0),
    billTotal: Math.round(
      zone.products.reduce((sum, p) => sum + p.price * p.qty, 0) + zone.hourlyRate
    ),
    hourlyRate: zone.hourlyRate,
    sessionType: zone.sessionType,
    fixedDurationMinutes: zone.fixedDurationMinutes,
  };
}

function zoneToQuickTarget(zone: ZoneSession): QuickActionTarget {
  return {
    id: zone.id,
    label: zone.zoneName,
    customer: zone.customer,
    hourlyRate: zone.hourlyRate,
    sessionType: zone.sessionType,
    fixedDurationMinutes: zone.fixedDurationMinutes,
    extendedMinutes: zone.extendedMinutes,
    products: zone.products,
  };
}

export default function StaffDashboardContent() {
  const [zones, setZones] = useState<ZoneSession[]>(() => structuredClone(ZONES));
  const [rooms] = useState<Room[]>(initialRooms);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneSession | null>(null);
  const activeZones = useMemo(() => zones.filter((zone) => zone.status === 'active'), [zones]);
  const activeSessions = useMemo(() => activeZones.map(toActiveSession), [activeZones]);

  const handleQuickApply = (updated: QuickActionTarget, result: QuickActionResponse) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id !== updated.id
          ? zone
          : {
              ...zone,
              customer: updated.customer,
              products: (result.target?.products ?? zone.products) as ZoneSession['products'],
              hourlyRate: updated.hourlyRate,
              sessionType: updated.sessionType,
              fixedDurationMinutes:
                result.target?.fixedDurationMinutes ?? updated.fixedDurationMinutes,
              extendedMinutes: result.target?.extendedMinutes ?? updated.extendedMinutes,
            }
      )
    );
    toast.success(
      `Added ${result.productAdded?.name ?? 'item'} + extended ${result.timeExtended ?? 0}min to ${updated.label}`
    );
    setSelectedZone(null);
  };

  return (
    <div className="relative p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />
      <div className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-warning/5 blur-3xl" />
      <div className="relative z-10 space-y-6 stagger-in">
        <DashboardTopBar />
        <QuickStatsRow />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RoomStatusGrid rooms={rooms} />
            <ActiveSessionsList sessions={activeSessions} />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <QuickActionsPanel onQuickAction={() => setQuickMenuOpen(true)} />
            <UpcomingReservationsPanel />
            <WaitingListPanel />
          </div>
        </div>
      </div>

      {quickMenuOpen && (
        <QuickActionsMenu
          zones={activeZones}
          onClose={() => setQuickMenuOpen(false)}
          onSelect={(zone) => {
            setQuickMenuOpen(false);
            setSelectedZone(zone);
          }}
        />
      )}

      {selectedZone && (
        <QuickActionModal
          target={zoneToQuickTarget(selectedZone)}
          apiPath="/api/quick-action"
          onClose={() => setSelectedZone(null)}
          onApply={handleQuickApply}
        />
      )}
    </div>
  );
}

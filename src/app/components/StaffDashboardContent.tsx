import React from 'react';
import DashboardTopBar from './DashboardTopBar';
import QuickStatsRow from './QuickStatsRow';
import RoomStatusGrid from './RoomStatusGrid';
import ActiveSessionsList from './ActiveSessionsList';
import UpcomingReservationsPanel from './UpcomingReservationsPanel';
import WaitingListPanel from './WaitingListPanel';
import QuickActionsPanel from './QuickActionsPanel';

export default function StaffDashboardContent() {
  return (
    <div className="relative p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-warning/5 blur-3xl" />
      <div className="relative z-10 space-y-6 stagger-in">
        <DashboardTopBar />
        <QuickStatsRow />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RoomStatusGrid />
            <ActiveSessionsList />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <QuickActionsPanel />
            <UpcomingReservationsPanel />
            <WaitingListPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

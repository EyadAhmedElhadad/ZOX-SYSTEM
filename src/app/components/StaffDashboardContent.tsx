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
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <DashboardTopBar />
      <QuickStatsRow />
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2 2xl:col-span-3 space-y-6">
          <RoomStatusGrid />
          <ActiveSessionsList />
        </div>
        <div className="xl:col-span-1 2xl:col-span-1 space-y-4">
          <QuickActionsPanel />
          <UpcomingReservationsPanel />
          <WaitingListPanel />
        </div>
      </div>
    </div>
  );
}

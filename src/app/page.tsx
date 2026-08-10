import React from 'react';
import AppLayout from '@/components/AppLayout';
import StaffDashboardContent from './components/StaffDashboardContent';

export default function StaffDashboardPage() {
  return (
    <AppLayout currentPath="/" role="staff">
      <StaffDashboardContent />
    </AppLayout>
  );
}

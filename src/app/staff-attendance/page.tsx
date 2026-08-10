import React from 'react';
import AppLayout from '@/components/AppLayout';
import StaffAttendanceContent from './components/StaffAttendanceContent';

export default function StaffAttendancePage() {
  return (
    <AppLayout currentPath="/staff-attendance" role="owner">
      <StaffAttendanceContent />
    </AppLayout>
  );
}

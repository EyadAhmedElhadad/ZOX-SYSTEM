import React from 'react';
import AppLayout from '@/components/AppLayout';
import StaffContent from './components/StaffContent';

export default function StaffPage() {
  return (
    <AppLayout currentPath="/staff" role="owner">
      <StaffContent />
    </AppLayout>
  );
}

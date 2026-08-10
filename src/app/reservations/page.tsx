import React from 'react';
import AppLayout from '@/components/AppLayout';
import ReservationsContent from './components/ReservationsContent';

export default function ReservationsPage() {
  return (
    <AppLayout currentPath="/reservations" role="staff">
      <ReservationsContent />
    </AppLayout>
  );
}

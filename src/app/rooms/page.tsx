import React from 'react';
import AppLayout from '@/components/AppLayout';
import RoomsContent from './components/RoomsContent';

export default function RoomsPage() {
  return (
    <AppLayout currentPath="/rooms" role="owner">
      <RoomsContent />
    </AppLayout>
  );
}

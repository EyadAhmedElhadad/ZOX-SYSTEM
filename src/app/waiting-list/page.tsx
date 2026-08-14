import React from 'react';
import AppLayout from '@/components/AppLayout';
import WaitingListContent from './components/WaitingListContent';

export default function WaitingListPage() {
  return (
    <AppLayout currentPath="/waiting-list" role="staff">
      <WaitingListContent />
    </AppLayout>
  );
}

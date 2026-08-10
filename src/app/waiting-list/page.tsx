import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function WaitingListPage() {
  return (
    <AppLayout currentPath="/waiting-list" role="staff">
      <PlaceholderContent
        title="Waiting List"
        description="Track customers waiting for a room and manage priority."
      />
    </AppLayout>
  );
}

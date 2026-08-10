import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function MaintenancePage() {
  return (
    <AppLayout currentPath="/maintenance" role="owner">
      <PlaceholderContent
        title="Maintenance"
        description="Schedule and track maintenance requests."
      />
    </AppLayout>
  );
}

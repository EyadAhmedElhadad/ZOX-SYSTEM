import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function SalesPage() {
  return (
    <AppLayout currentPath="/sales" role="staff">
      <PlaceholderContent title="Sales" description="Process café and merchandise sales quickly." />
    </AppLayout>
  );
}

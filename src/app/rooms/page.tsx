import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function RoomsPage() {
  return (
    <AppLayout currentPath="/rooms" role="owner">
      <PlaceholderContent title="Rooms" description="Manage gaming rooms, rates, and room types." />
    </AppLayout>
  );
}

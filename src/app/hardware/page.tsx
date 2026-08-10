import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function HardwarePage() {
  return (
    <AppLayout currentPath="/hardware" role="staff">
      <PlaceholderContent
        title="Hardware"
        description="Report and track controllers, consoles, and equipment."
      />
    </AppLayout>
  );
}

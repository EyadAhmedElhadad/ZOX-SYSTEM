import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function LostFoundPage() {
  return (
    <AppLayout currentPath="/lost-found" role="staff">
      <PlaceholderContent
        title="Lost & Found"
        description="Log lost items and match them with customers."
      />
    </AppLayout>
  );
}

import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function ReportsPage() {
  return (
    <AppLayout currentPath="/reports" role="owner">
      <PlaceholderContent
        title="Reports"
        description="View business analytics and performance reports."
      />
    </AppLayout>
  );
}

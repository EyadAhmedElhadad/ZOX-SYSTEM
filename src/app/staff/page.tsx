import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function StaffPage() {
  return (
    <AppLayout currentPath="/staff" role="owner">
      <PlaceholderContent
        title="Staff"
        description="Manage staff accounts, roles, and permissions."
      />
    </AppLayout>
  );
}

import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function CustomersPage() {
  return (
    <AppLayout currentPath="/customers" role="staff">
      <PlaceholderContent
        title="Customers"
        description="Manage customer profiles, loyalty status, and visit history."
      />
    </AppLayout>
  );
}

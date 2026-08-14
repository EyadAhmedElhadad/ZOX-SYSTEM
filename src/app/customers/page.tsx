import React from 'react';
import AppLayout from '@/components/AppLayout';
import CustomersContent from './components/CustomersContent';

export default function CustomersPage() {
  return (
    <AppLayout currentPath="/customers" role="staff">
      <CustomersContent />
    </AppLayout>
  );
}

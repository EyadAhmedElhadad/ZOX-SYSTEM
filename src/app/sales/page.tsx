import React from 'react';
import AppLayout from '@/components/AppLayout';
import SalesContent from './components/SalesContent';

export default function SalesPage() {
  return (
    <AppLayout currentPath="/sales" role="staff">
      <SalesContent />
    </AppLayout>
  );
}

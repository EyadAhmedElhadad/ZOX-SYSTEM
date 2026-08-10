import React from 'react';
import AppLayout from '@/components/AppLayout';
import InventoryContent from './components/InventoryContent';

export default function InventoryPage() {
  return (
    <AppLayout currentPath="/inventory" role="staff">
      <InventoryContent />
    </AppLayout>
  );
}

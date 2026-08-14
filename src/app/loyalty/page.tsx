import React from 'react';
import AppLayout from '@/components/AppLayout';
import LoyaltyContent from './components/LoyaltyContent';

export default function LoyaltyPage() {
  return (
    <AppLayout currentPath="/loyalty" role="owner">
      <LoyaltyContent />
    </AppLayout>
  );
}

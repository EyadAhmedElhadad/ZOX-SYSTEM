import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function LoyaltyPage() {
  return (
    <AppLayout currentPath="/loyalty" role="owner">
      <PlaceholderContent
        title="Loyalty"
        description="Manage loyalty points, tiers, and rewards."
      />
    </AppLayout>
  );
}

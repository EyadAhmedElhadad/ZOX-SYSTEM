import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function SettingsPage() {
  return (
    <AppLayout currentPath="/settings" role="owner">
      <PlaceholderContent
        title="Settings"
        description="Configure your center, rates, and preferences."
      />
    </AppLayout>
  );
}

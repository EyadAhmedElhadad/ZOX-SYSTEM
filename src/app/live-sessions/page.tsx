import React from 'react';
import AppLayout from '@/components/AppLayout';
import LiveSessionsContent from './components/LiveSessionsContent';

export default function LiveSessionsPage() {
  return (
    <AppLayout currentPath="/live-sessions" role="staff">
      <LiveSessionsContent />
    </AppLayout>
  );
}

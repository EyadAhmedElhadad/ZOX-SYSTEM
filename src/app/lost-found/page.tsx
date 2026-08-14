import React from 'react';
import AppLayout from '@/components/AppLayout';
import LostFoundContent from './components/LostFoundContent';

export default function LostFoundPage() {
  return (
    <AppLayout currentPath="/lost-found" role="staff">
      <LostFoundContent />
    </AppLayout>
  );
}

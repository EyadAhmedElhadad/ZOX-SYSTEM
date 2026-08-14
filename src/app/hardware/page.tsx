import React from 'react';
import AppLayout from '@/components/AppLayout';
import HardwareContent from './components/HardwareContent';

export default function HardwarePage() {
  return (
    <AppLayout currentPath="/hardware" role="staff">
      <HardwareContent />
    </AppLayout>
  );
}

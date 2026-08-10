import React from 'react';
import AppLayout from '@/components/AppLayout';
import CustomerDashboardContent from './components/CustomerDashboardContent';

export default function CustomerDashboardPage() {
  return (
    <AppLayout currentPath="/customer-dashboard" role="customer">
      <CustomerDashboardContent />
    </AppLayout>
  );
}

import React from 'react';
import AppLayout from '@/components/AppLayout';
import ExpensesContent from './components/ExpensesContent';

export default function ExpensesPage() {
  return (
    <AppLayout currentPath="/expenses" role="owner">
      <ExpensesContent />
    </AppLayout>
  );
}

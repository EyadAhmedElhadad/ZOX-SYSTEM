import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function ExpensesPage() {
  return (
    <AppLayout currentPath="/expenses" role="owner">
      <PlaceholderContent
        title="Expenses"
        description="Track operating costs and financial outflows."
      />
    </AppLayout>
  );
}

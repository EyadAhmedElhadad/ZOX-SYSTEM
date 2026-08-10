import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function AuditLogsPage() {
  return (
    <AppLayout currentPath="/audit-logs" role="owner">
      <PlaceholderContent
        title="Audit Logs"
        description="Review a full history of system actions."
      />
    </AppLayout>
  );
}

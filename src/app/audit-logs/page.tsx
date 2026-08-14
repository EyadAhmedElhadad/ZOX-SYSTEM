import React from 'react';
import AppLayout from '@/components/AppLayout';
import AuditLogsContent from './components/AuditLogsContent';

export default function AuditLogsPage() {
  return (
    <AppLayout currentPath="/audit-logs" role="owner">
      <AuditLogsContent />
    </AppLayout>
  );
}

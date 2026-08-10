import React from 'react';
import AppLayout from '@/components/AppLayout';
import FeedbackContent from './components/FeedbackContent';

export default function FeedbackPage() {
  return (
    <AppLayout currentPath="/feedback" role="owner">
      <FeedbackContent />
    </AppLayout>
  );
}

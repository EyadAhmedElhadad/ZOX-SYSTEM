import React from 'react';
import AppLayout from '@/components/AppLayout';
import PlaceholderContent from '@/components/ui/PlaceholderContent';

export default function FeedbackPage() {
  return (
    <AppLayout currentPath="/feedback" role="owner">
      <PlaceholderContent title="Feedback" description="Review customer ratings and feedback." />
    </AppLayout>
  );
}

import React from 'react';
import Link from 'next/link';
import { Construction } from 'lucide-react';

interface PlaceholderContentProps {
  title: string;
  description?: string;
}

export default function PlaceholderContent({ title, description }: PlaceholderContentProps) {
  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      <div className="card-base flex flex-col items-center justify-center text-center gap-4 py-20">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Construction size={24} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {description ?? 'This section is under construction and will be available soon.'}
        </p>
        <Link href="/" className="btn-primary flex items-center gap-2 h-9 mt-2">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

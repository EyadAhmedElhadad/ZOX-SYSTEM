import React from 'react';
import Link from 'next/link';
import {
  CalendarPlus,
  PlayCircle,
  ShoppingBag,
  Gamepad2,
  PackageSearch,
  AlertCircle,
} from 'lucide-react';

const actions = [
  {
    id: 'qa-new-reservation',
    label: 'New Reservation',
    icon: <CalendarPlus size={20} />,
    href: '/reservations',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20 hover:bg-primary/20',
  },
  {
    id: 'qa-start-session',
    label: 'Start Session',
    icon: <PlayCircle size={20} />,
    href: '/live-sessions',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20 hover:bg-accent/20',
  },
  {
    id: 'qa-quick-sale',
    label: 'Quick Sale',
    icon: <ShoppingBag size={20} />,
    href: '/sales',
    color: 'text-info',
    bg: 'bg-info/10 border-info/20 hover:bg-info/20',
  },
  {
    id: 'qa-report-hardware',
    label: 'Report Hardware',
    icon: <Gamepad2 size={20} />,
    href: '/hardware',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20 hover:bg-warning/20',
  },
  {
    id: 'qa-lost-found',
    label: 'Lost & Found',
    icon: <PackageSearch size={20} />,
    href: '/lost-found',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border hover:bg-muted/80',
  },
  {
    id: 'qa-report-issue',
    label: 'Report Issue',
    icon: <AlertCircle size={20} />,
    href: '/maintenance',
    color: 'text-danger',
    bg: 'bg-danger/10 border-danger/20 hover:bg-danger/20',
  },
];

export default function QuickActionsPanel() {
  return (
    <div className="card-base p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions?.map((action) => (
          <Link
            key={action?.id}
            href={action?.href}
            className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150 active:scale-95 ${action?.bg}`}
          >
            <span className={action?.color}>{action?.icon}</span>
            <span className={`text-xs font-semibold ${action?.color} text-center leading-tight`}>
              {action?.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Monitor, DoorOpen, Clock, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const stats = [
  {
    id: 'stat-active-sessions',
    label: 'Active Sessions',
    value: '6',
    sub: 'rooms generating revenue',
    icon: <Monitor size={20} />,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    trend: null,
  },
  {
    id: 'stat-available-rooms',
    label: 'Available Rooms',
    value: '2',
    sub: 'ready to assign',
    icon: <DoorOpen size={20} />,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    trend: null,
  },
  {
    id: 'stat-waiting',
    label: 'Waiting Customers',
    value: '3',
    sub: 'in queue',
    icon: <Clock size={20} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    trend: null,
  },
  {
    id: 'stat-revenue',
    label: "Today's Revenue",
    value: '2,840',
    sub: 'EGP since shift start',
    icon: <TrendingUp size={20} />,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    trend: '+12% vs yesterday',
  },
  {
    id: 'stat-alerts',
    label: 'Alerts',
    value: '4',
    sub: '2 inventory · 2 hardware',
    icon: <AlertTriangle size={20} />,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    trend: null,
  },
  {
    id: 'stat-upcoming',
    label: 'Upcoming (1hr)',
    value: '5',
    sub: 'reservations arriving soon',
    icon: <Users size={20} />,
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
    trend: null,
  },
];

export default function QuickStatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats?.map((stat) => (
        <div
          key={stat?.id}
          className={`card-base p-4 border ${stat?.border} transition-all duration-200 hover:border-opacity-60`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat?.bg}`}>
              <span className={stat?.color}>{stat?.icon}</span>
            </div>
            {stat?.trend && <span className="text-xs text-accent font-medium">{stat?.trend}</span>}
          </div>
          <p className={`text-2xl font-bold font-tabular ${stat?.color}`}>{stat?.value}</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{stat?.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat?.sub}</p>
        </div>
      ))}
    </div>
  );
}

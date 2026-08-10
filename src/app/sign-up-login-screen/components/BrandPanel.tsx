import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Monitor, Users, Gamepad2, TrendingUp } from 'lucide-react';

const liveStats = [
  {
    id: 'bp-stat-1',
    label: 'Active Sessions',
    value: '6',
    icon: <Monitor size={14} />,
    color: 'text-accent',
  },
  {
    id: 'bp-stat-2',
    label: 'Waiting',
    value: '3',
    icon: <Users size={14} />,
    color: 'text-warning',
  },
  {
    id: 'bp-stat-3',
    label: 'Controllers',
    value: '40',
    icon: <Gamepad2 size={14} />,
    color: 'text-primary',
  },
  {
    id: 'bp-stat-4',
    label: "Today's EGP",
    value: '2,840',
    icon: <TrendingUp size={14} />,
    color: 'text-info',
  },
];

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-card border-r border-border flex-col justify-between p-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <AppLogo size={40} />
          <div>
            <span className="text-xl font-bold text-foreground tracking-tight">Zoox</span>
            <p className="text-xs text-muted-foreground">PlayStation Management</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-foreground leading-tight mb-4">
          Run your gaming center
          <br />
          <span className="text-primary">at full speed.</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
          Manage rooms, sessions, reservations, café sales, and customer loyalty — all from one
          operational dashboard built for speed.
        </p>
      </div>
      <div className="relative z-10 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Live Center Status
        </p>
        <div className="grid grid-cols-2 gap-3">
          {liveStats?.map((stat) => (
            <div key={stat?.id} className="bg-background/60 border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={stat?.color}>{stat?.icon}</span>
                <span className="text-xs text-muted-foreground">{stat?.label}</span>
              </div>
              <p className={`text-xl font-bold font-tabular ${stat?.color}`}>{stat?.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <p className="text-xs text-muted-foreground">Live data — updates every 30 seconds</p>
        </div>
      </div>
    </div>
  );
}

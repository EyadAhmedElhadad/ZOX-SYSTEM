'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, RefreshCw } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardTopBar() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now?.toLocaleTimeString('en-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now?.toLocaleDateString('en-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{currentDate}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Quick search customer..."
            className="input-field pl-9 w-56 text-sm h-9"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-tabular text-sm font-semibold text-foreground">{currentTime}</span>
        </div>
        <button className="relative p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>
        <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={18} />
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { Monitor, RefreshCw, Zap } from 'lucide-react';

interface LiveSessionsHeaderProps {
  sessionCount: number;
  onQuickAction: () => void;
}

export default function LiveSessionsHeader({
  sessionCount,
  onQuickAction,
}: LiveSessionsHeaderProps) {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('en-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">Live Sessions</h1>
          <span className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            {sessionCount} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Real-time session monitoring — end sessions, add products, take payment
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw size={11} />
            <span>Updated {lastUpdated}</span>
          </div>
        )}
        <button
          onClick={onQuickAction}
          className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/25 text-warning hover:bg-warning/20 px-3 py-2 text-xs font-bold transition-all duration-150 active:scale-95"
        >
          <Zap size={14} />
          Quick Actions
        </button>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <Monitor size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            {sessionCount} / 10 rooms occupied
          </span>
        </div>
      </div>
    </div>
  );
}

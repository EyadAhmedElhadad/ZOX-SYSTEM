'use client';
import React from 'react';
import { SlidersHorizontal, Zap } from 'lucide-react';

interface LiveSessionsHeaderProps {
  sessionCount: number;
  onQuickStart: () => void;
}

export default function LiveSessionsHeader({
  sessionCount,
  onQuickStart,
}: LiveSessionsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Live Sessions</h1>
          <span className="status-badge bg-accent/10 border border-accent/20 text-accent">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse pulse-dot" />
            {sessionCount} Active
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1.5">
          Monitoring active gaming stations and current revenue.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="glass-panel glow-hover flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground">
          <SlidersHorizontal size={15} />
          Filter
        </button>
        <button
          onClick={onQuickStart}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-primary active:scale-95 transition-all duration-150"
        >
          <Zap size={15} />
          Quick Start
        </button>
      </div>
    </div>
  );
}

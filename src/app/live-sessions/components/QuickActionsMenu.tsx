'use client';
import React from 'react';
import { X, Zap, Clock, ShoppingBag, Users } from 'lucide-react';
import type { ZoneSession } from '../../../data/zones';

interface QuickActionsMenuProps {
  zones: ZoneSession[];
  onClose: () => void;
  onSelect: (zone: ZoneSession) => void;
}

const zoneTypeLabels: Record<string, string> = {
  playstation: 'PlayStation',
  billiards: 'Billiards',
  cafe: 'Cafe',
};

export default function QuickActionsMenu({ zones, onClose, onSelect }: QuickActionsMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-warning/15 border border-warning/25 text-warning flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a location/zone to add a drink and extend time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Zones */}
        <div className="p-4 space-y-2 overflow-y-auto scrollbar-thin flex-1">
          {zones.length === 0 ? (
            <div className="h-full min-h-[220px] flex items-center justify-center text-center">
              <div className="max-w-xs">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mb-3">
                  <Users size={18} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  No active sessions right now
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a session first, then come back here to add product and extend time.
                </p>
              </div>
            </div>
          ) : (
            zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => onSelect(zone)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 active:scale-[0.98] text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center text-xl flex-shrink-0">
                  {zone.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{zone.zoneName}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">
                      {zoneTypeLabels[zone.zoneType]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <Users size={11} />
                      {zone.customer}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={11} />
                      {zone.products.reduce((s, p) => s + p.qty, 0)} items
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {zone.hourlyRate > 0
                        ? zone.sessionType === 'fixed'
                          ? `${zone.fixedDurationMinutes ?? 0}min`
                          : `+${zone.extendedMinutes ?? 0}min credit`
                        : '—'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary flex-shrink-0">Select →</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

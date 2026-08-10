import React from 'react';
import { Clock, Users, Gamepad2 } from 'lucide-react';

const waiting = [
  {
    id: 'wl-001',
    customer: 'Amr Khaled',
    phone: '0100-xxx-5512',
    game: 'FC 26',
    players: 2,
    preferredType: 'Standard',
    waitingMin: 18,
    priority: 'normal',
  },
  {
    id: 'wl-002',
    customer: 'Dina Youssef',
    phone: '0112-xxx-3341',
    game: 'GTA V',
    players: 4,
    preferredType: 'Premium',
    waitingMin: 34,
    priority: 'high',
  },
  {
    id: 'wl-003',
    customer: 'Bassem Saad',
    phone: '0115-xxx-9978',
    game: 'Call of Duty',
    players: 2,
    preferredType: 'Standard',
    waitingMin: 47,
    priority: 'normal',
  },
];

export default function WaitingListPanel() {
  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Waiting List</h2>
        <span className="text-xs bg-warning/10 text-warning font-bold px-2 py-0.5 rounded-full">
          {waiting?.length} waiting
        </span>
      </div>
      <div className="space-y-2">
        {waiting?.map((w, idx) => (
          <div
            key={w?.id}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20 hover:border-border/60 transition-colors"
          >
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-foreground truncate">{w?.customer}</p>
                {w?.priority === 'high' && (
                  <span className="text-xs bg-primary/10 text-primary font-bold px-1 rounded">
                    VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Gamepad2 size={9} /> {w?.game}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Users size={9} /> {w?.players}p
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{w?.preferredType}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-0.5 text-warning">
                <Clock size={10} />
                <span className="text-xs font-bold font-tabular">{w?.waitingMin}m</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-3 py-2 bg-muted border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors">
        Manage Waiting List
      </button>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { ArrowUpDown, Eye, PlayCircle, Ban, UserCheck, MoreHorizontal, Star } from 'lucide-react';
import type { Reservation, ReservationStatus } from './ReservationsContent';
import { toast } from 'sonner';

const statusStyles: Record<ReservationStatus, { bg: string; text: string; dot: string }> = {
  Reserved: { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  Arrived: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  Active: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  Completed: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  Cancelled: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
  'No Show': { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
  Waiting: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  Late: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
};

const customerStatusStyles: Record<string, string> = {
  New: 'text-muted-foreground bg-muted',
  Regular: 'text-info bg-info/10',
  Loyal: 'text-accent bg-accent/10',
  VIP: 'text-warning bg-warning/10',
  'Low Reliability': 'text-danger bg-danger/10',
};

interface ReservationsTableProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: ReservationStatus) => void;
  onRateCustomer?: (res: Reservation) => void;
  isCustomer?: boolean;
}

type SortKey = 'customer' | 'room' | 'game' | 'date' | 'time' | 'status';
type SortDir = 'asc' | 'desc';

export default function ReservationsTable({
  reservations,
  onStatusChange,
  onRateCustomer,
  isCustomer = false,
}: ReservationsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...reservations].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const SortHeader = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <button
      onClick={() => handleSort(sKey)}
      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
    >
      {label}
      <ArrowUpDown
        size={11}
        className={`transition-colors ${sortKey === sKey ? 'text-primary' : 'group-hover:text-foreground'}`}
      />
    </button>
  );

  const handleStatusUpdate = (id: string, status: ReservationStatus) => {
    onStatusChange(id, status);
    setOpenStatusMenu(null);
    toast.success(`Status updated to ${status}`);
  };

  if (reservations.length === 0) {
    return (
      <div className="card-base p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
          <Eye size={28} className="text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground mb-1">No reservations found</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isCustomer
            ? 'You have no reservations yet. Book a session from your dashboard to get started.'
            : 'No reservations match your current filters. Try adjusting the date or status filter, or create a new reservation.'}
        </p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {!isCustomer && (
                <th className="text-left px-4 py-3 w-8">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-primary" />
                </th>
              )}
              <th className="text-left px-4 py-3">
                <SortHeader label="Customer" sKey="customer" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                Phone
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Room" sKey="room" />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Game" sKey="game" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                Players
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Date" sKey="date" />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Time" sKey="time" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                Duration
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader label="Status" sKey="status" />
              </th>
              {!isCustomer && (
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((res) => {
              const sc = statusStyles[res.status];
              return (
                <tr
                  key={res.id}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
                >
                  {!isCustomer && (
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-primary" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{res.customer}</p>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${customerStatusStyles[res.customerStatus] || 'text-muted-foreground bg-muted'}`}
                      >
                        {res.customerStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground font-tabular">{res.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {res.category === 'billiards'
                          ? '🎱'
                          : res.category === 'cafe'
                            ? '☕'
                            : '🎮'}{' '}
                        {res.room}
                      </p>
                      <span
                        className={`text-xs ${res.roomType === 'VIP' ? 'text-warning' : res.roomType === 'Premium' ? 'text-info' : 'text-muted-foreground'}`}
                      >
                        {res.roomType}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{res.game}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-tabular text-foreground">{res.players}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-tabular text-foreground">{res.date.slice(5)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-tabular font-semibold text-foreground">{res.time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      {res.duration ? `${res.duration}min` : 'Open'}
                    </p>
                  </td>
                  <td className="px-4 py-3 relative">
                    {isCustomer ? (
                      <span className={`status-badge ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {res.status}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setOpenStatusMenu(openStatusMenu === res.id ? null : res.id)
                          }
                          className={`status-badge cursor-pointer hover:opacity-80 transition-opacity ${sc.bg} ${sc.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {res.status}
                        </button>
                        {openStatusMenu === res.id && (
                          <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[140px] fade-in">
                            {(
                              [
                                'Reserved',
                                'Arrived',
                                'Active',
                                'Completed',
                                'Cancelled',
                                'No Show',
                                'Waiting',
                                'Late',
                              ] as ReservationStatus[]
                            ).map((s) => (
                              <button
                                key={`status-opt-${s}`}
                                onClick={() => handleStatusUpdate(res.id, s)}
                                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors ${statusStyles[s].text}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  {!isCustomer && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {res.status === 'Reserved' || res.status === 'Arrived' ? (
                          <button
                            title="Start session"
                            onClick={() => handleStatusUpdate(res.id, 'Active')}
                            className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                          >
                            <PlayCircle size={13} />
                          </button>
                        ) : null}
                        {res.status === 'Reserved' ? (
                          <button
                            title="Mark arrived"
                            onClick={() => handleStatusUpdate(res.id, 'Arrived')}
                            className="p-1.5 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors"
                          >
                            <UserCheck size={13} />
                          </button>
                        ) : null}
                        {res.status !== 'Completed' && res.status !== 'Cancelled' ? (
                          <button
                            title="Cancel reservation"
                            onClick={() => handleStatusUpdate(res.id, 'Cancelled')}
                            className="p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                          >
                            <Ban size={13} />
                          </button>
                        ) : null}
                        {res.status === 'Completed' && onRateCustomer ? (
                          <button
                            title="Rate customer"
                            onClick={() => onRateCustomer(res)}
                            className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                          >
                            <Star size={13} />
                          </button>
                        ) : null}
                        <button
                          title="More options"
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="bg-input border border-border rounded-lg px-2 py-1 text-xs text-foreground"
          >
            {[10, 25, 50].map((n) => (
              <option key={`per-page-${n}`} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>of {sorted.length} reservations</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                safePage === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

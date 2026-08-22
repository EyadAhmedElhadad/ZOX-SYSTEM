'use client';
import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ListPlus,
  MapPin,
  Timer,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  waitingApi,
  roomsApi,
  useAsyncData,
  toastApiError,
  type UiWaitingEntry,
  type UiRoom,
} from '@/lib/api';

type WaitingEntry = UiWaitingEntry;

const statusStyles: Record<WaitingEntry['status'], string> = {
  Waiting: 'bg-warning/10 text-warning border border-warning/20',
  Notified: 'bg-info/10 text-info border border-info/20',
  Seated: 'bg-accent/10 text-accent border border-accent/20',
  Cancelled: 'bg-muted text-muted-foreground border border-border',
};

const roomOptions = ['Any', 'Standard', 'Premium', 'VIP'];

function parseJoined(value: string): Date {
  const direct = new Date(value);
  if (!isNaN(direct.getTime())) return direct;
  const dmy = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})/);
  if (dmy)
    return new Date(
      Number(dmy[3]),
      Number(dmy[2]) - 1,
      Number(dmy[1]),
      Number(dmy[4]),
      Number(dmy[5])
    );
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})[ ,]?(\d{1,2}):(\d{2})/);
  if (iso)
    return new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      Number(iso[4]),
      Number(iso[5])
    );
  return new Date();
}

function formatWait(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  return `${h}h ${minutes % 60}m`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function WaitingListContent() {
  const { data, loading, reload } = useAsyncData(() => waitingApi.list(), []);
  const { data: roomData, reload: reloadRooms } = useAsyncData(() => roomsApi.list(), []);
  const entries = (data ?? []) as WaitingEntry[];
  const rooms = (roomData ?? []) as UiRoom[];
  const [now, setNow] = useState<Date>(() => new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    partySize: 2,
    roomPreference: 'Any',
    game: '',
    phone: '',
  });

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const queue = [...entries].sort(
    (a, b) => parseJoined(a.joinedAt).getTime() - parseJoined(b.joinedAt).getTime()
  );
  const availableRooms = rooms.filter((room) => room.status === 'Available');

  const waitingNow = entries.filter((e) => e.status === 'Waiting').length;
  const notified = entries.filter((e) => e.status === 'Notified').length;
  const seatedToday = entries.filter((e) => {
    if (e.status !== 'Seated') return false;
    const joined = parseJoined(e.joinedAt);
    return (
      joined.getFullYear() === now.getFullYear() &&
      joined.getMonth() === now.getMonth() &&
      joined.getDate() === now.getDate()
    );
  }).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      await waitingApi.create({
        name: newEntry.name.trim(),
        party_size: Math.max(1, Number(newEntry.partySize) || 1),
        room_preference: newEntry.roomPreference,
        game: newEntry.game.trim() || undefined,
        phone: newEntry.phone.trim() || undefined,
      });
      setNewEntry({ name: '', partySize: 2, roomPreference: 'Any', game: '', phone: '' });
      setAddOpen(false);
      toast.success(`${newEntry.name.trim()} added to the queue`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleNotify = async (entry: WaitingEntry) => {
    try {
      await waitingApi.notify(entry.id);
      toast.success(`${entry.name} notified`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleSeat = async (entry: WaitingEntry) => {
    try {
      await waitingApi.seat(entry.id, null);
      toast.success(`${entry.name} seated`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleSeatToRoom = async (entry: WaitingEntry, room: UiRoom) => {
    try {
      await waitingApi.seat(entry.id, room.id);
      toast.success(`${entry.name} assigned to ${room.name}`);
      await Promise.all([reload(), reloadRooms()]);
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleRemove = async (entry: WaitingEntry) => {
    try {
      await waitingApi.cancel(entry.id);
      toast.info(`${entry.name} removed from the queue`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const active = waitingNow + notified;

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Waiting List</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active > 0
              ? `${active} group${active !== 1 ? 's' : ''} waiting for a room`
              : 'No one is waiting right now'}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center gap-2 h-9"
        >
          <ListPlus size={14} />
          Add to Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Users size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Waiting Now</p>
              <p className="text-lg font-bold text-foreground font-tabular">{waitingNow}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
              <Bell size={18} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notified</p>
              <p className="text-lg font-bold text-foreground font-tabular">{notified}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Timer size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Wait</p>
              <p className="text-lg font-bold text-foreground font-tabular">~20 min</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <CheckCheck size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seated Today</p>
              <p className="text-lg font-bold text-foreground font-tabular">{seatedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-muted-foreground">Loading…</div>
      ) : (
      <>
      {/* Queue */}
      {queue.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center text-center gap-3 py-16">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
            <Users size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Queue is empty</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Add a group to the waiting list and they will appear here in order.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((entry) => {
            const waited = now.getTime() - parseJoined(entry.joinedAt).getTime();
            const waitingMinutes = Math.max(0, Math.floor(waited / 60000));
            return (
              <div
                key={entry.id}
                className={`card-base p-4 flex flex-col lg:flex-row lg:items-center gap-3 ${
                  entry.status === 'Seated' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{initials(entry.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
                      <span className={`status-badge ${statusStyles[entry.status]}`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.partySize} {entry.partySize > 1 ? 'people' : 'person'} ·{' '}
                      {entry.roomPreference} room{entry.game ? ` · ${entry.game}` : ''}
                      {entry.phone ? ` · ${entry.phone}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-4 lg:ml-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-warning" />
                    <span className="text-sm font-bold text-foreground font-tabular">
                      {formatWait(waited)}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {waitingMinutes === 0 ? 'just now' : 'waiting'}
                    </span>
                  </div>
                <div className="flex items-center gap-1.5">
                  {entry.status !== 'Seated' && entry.status !== 'Cancelled' && (
                    <>
                      {entry.status === 'Waiting' && (
                          <button
                            onClick={() => handleNotify(entry)}
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-info/10 border border-info/25 text-info hover:bg-info/20 transition-all duration-150"
                            title="Notify customer"
                          >
                            <Bell size={12} />
                            Notify
                          </button>
                        )}
                        {availableRooms.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            <button
                              onClick={() => handleSeatToRoom(entry, availableRooms[0])}
                              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 transition-all duration-150"
                              title={`Seat in ${availableRooms[0].name}`}
                            >
                              <Check size={12} />
                              Seat now
                            </button>
                            {availableRooms.slice(1, 3).map((room) => (
                              <button
                                key={room.id}
                                onClick={() => handleSeatToRoom(entry, room)}
                                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-150"
                                title={`Seat in ${room.name}`}
                              >
                                <MapPin size={12} />
                                {room.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSeat(entry)}
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 transition-all duration-150"
                            title="Mark seated"
                          >
                            <Check size={12} />
                            Seat
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleRemove(entry)}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold bg-danger/10 border border-danger/25 text-danger hover:bg-danger/20 transition-all duration-150"
                      title="Remove from queue"
                    >
                      <X size={12} />
                      Bump
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
      {/* Add to Queue Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Add to Queue</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
                <input
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  placeholder="e.g. Adel Fathy"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Party size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newEntry.partySize}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, partySize: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Room preference
                  </label>
                  <select
                    value={newEntry.roomPreference}
                    onChange={(e) => setNewEntry({ ...newEntry, roomPreference: e.target.value })}
                    className="input-field"
                  >
                    {roomOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Game</label>
                  <input
                    value={newEntry.game}
                    onChange={(e) => setNewEntry({ ...newEntry, game: e.target.value })}
                    placeholder="e.g. FC 26"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Phone
                  </label>
                  <input
                    value={newEntry.phone}
                    onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                    placeholder="0100-xxx-0000"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="btn-secondary flex-1 h-10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10 flex items-center justify-center gap-2"
                >
                  <UserPlus size={14} />
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

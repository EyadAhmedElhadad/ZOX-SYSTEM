'use client';
import React, { useState } from 'react';
import { Building2, DoorOpen, CircleDot, Wrench, Gamepad2, Users, Plus, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { roomsApi, useAsyncData, toastApiError, type UiRoom } from '@/lib/api';

type Room = UiRoom & { customer?: string };

type RoomStatus = Room['status'];

const statusTabs: { id: RoomStatus | 'All'; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Available', label: 'Available' },
  { id: 'Occupied', label: 'Occupied' },
  { id: 'Reserved', label: 'Reserved' },
  { id: 'Maintenance', label: 'Maintenance' },
];

const statusStyles: Record<RoomStatus, string> = {
  Available: 'bg-accent/10 text-accent border border-accent/20',
  Occupied: 'bg-danger/10 text-danger border border-danger/20',
  Reserved: 'bg-warning/10 text-warning border border-warning/20',
  Maintenance: 'bg-muted text-muted-foreground border border-border',
};

const bgStyles: Record<RoomStatus, string> = {
  Available: 'room-available-bg',
  Occupied: 'room-occupied-bg',
  Reserved: 'room-reserved-bg',
  Maintenance: 'room-maintenance-bg',
};

const typeStyles: Record<Room['roomType'], string> = {
  Standard: 'bg-primary/10 text-primary border border-primary/20',
  Premium: 'bg-info/10 text-info border border-info/20',
  VIP: 'bg-vip/10 text-vip border border-vip/20',
};

const initialForm = {
  name: '',
  roomType: 'Standard' as Room['roomType'],
  capacity: 2,
  controllers: 2,
  hourlyRate: 80,
  psModel: 'PS5',
};

export default function RoomsContent() {
  const { data, loading, reload } = useAsyncData(() => roomsApi.list(), []);
  const rooms = (data ?? []) as Room[];
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'All'>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [newRoom, setNewRoom] = useState(initialForm);

  const filtered = rooms.filter((r) => statusFilter === 'All' || r.status === statusFilter);

  const total = rooms.length;
  const available = rooms.filter((r) => r.status === 'Available').length;
  const occupied = rooms.filter((r) => r.status === 'Occupied').length;
  const maintenance = rooms.filter((r) => r.status === 'Maintenance').length;

  const handleStatusChange = async (id: string, status: RoomStatus) => {
    try {
      await roomsApi.update(id, { status });
      toast.success(`Room marked as ${status}`);
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) {
      toast.error('Room name is required');
      return;
    }
    try {
      await roomsApi.create({
        name: newRoom.name.trim(),
        room_type: newRoom.roomType,
        status: 'Available',
        capacity: Math.max(1, Number(newRoom.capacity) || 1),
        controllers: Math.max(0, Number(newRoom.controllers) || 0),
        hourly_rate: Math.max(0, Number(newRoom.hourlyRate) || 0),
        ps_model: newRoom.psModel.trim() || 'PS5',
      });
      setNewRoom(initialForm);
      setAddOpen(false);
      toast.success('Room added');
      reload();
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rooms.length} rooms — manage status, capacity, and rates
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center gap-2 h-9 self-start"
        >
          <Plus size={14} />
          Add Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Rooms</p>
              <p className="text-lg font-bold text-foreground font-tabular">{total}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <DoorOpen size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-bold text-accent font-tabular">{available}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <CircleDot size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Occupied</p>
              <p className="text-lg font-bold text-danger font-tabular">{occupied}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Wrench size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Maintenance</p>
              <p className="text-lg font-bold text-warning font-tabular">{maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-muted-foreground">Loading…</div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {statusTabs.map((tab) => {
              const count =
                tab.id === 'All' ? rooms.length : rooms.filter((r) => r.status === tab.id).length;
              return (
                <button
                  key={`tab-${tab.id}`}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Room grid */}
          {filtered.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center text-center gap-3 py-16">
              <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                <Building2 size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No rooms here</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Try a different status filter to see more rooms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((room) => (
                <div
                  key={room.id}
                  className={`card-base card-hover p-4 flex flex-col gap-3 ${bgStyles[room.status]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{room.name}</h3>
                      <span className={`status-badge mt-1.5 ${typeStyles[room.roomType]}`}>
                        {room.roomType}
                      </span>
                    </div>
                    <select
                      value={room.status}
                      onChange={(e) => handleStatusChange(room.id, e.target.value as RoomStatus)}
                      className={`status-badge cursor-pointer outline-none appearance-none text-center pr-2 flex-shrink-0 ${statusStyles[room.status]}`}
                      title="Change status"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Gamepad2 size={14} />
                    <span>{room.psModel}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      <span className="font-tabular">{room.capacity} seats</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Gamepad2 size={14} />
                      <span className="font-tabular">{room.controllers} ctrl</span>
                    </span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-accent font-tabular">
                      {room.hourlyRate} EGP
                      <span className="text-xs font-medium text-muted-foreground">/hr</span>
                    </span>
                    {room.customer && (
                      <span className="text-xs text-muted-foreground truncate">
                        {room.customer}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Room Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Add Room</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Room name
                </label>
                <input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g. Room 11"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Type</label>
                  <select
                    value={newRoom.roomType}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        roomType: e.target.value as Room['roomType'],
                      })
                    }
                    className="input-field"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    PS Model
                  </label>
                  <input
                    value={newRoom.psModel}
                    onChange={(e) => setNewRoom({ ...newRoom, psModel: e.target.value })}
                    placeholder="PS5"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Controllers
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newRoom.controllers}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, controllers: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Rate (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newRoom.hourlyRate}
                    onChange={(e) => setNewRoom({ ...newRoom, hourlyRate: Number(e.target.value) })}
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
                  <Plus size={14} />
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

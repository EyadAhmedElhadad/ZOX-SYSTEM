'use client';
import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  CalendarClock,
  Plus,
  Search,
  X,
  Trash2,
  Mail,
  Phone,
  DollarSign,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { loadStaff, addStaff, updateStaff, deleteStaff } from '@/data/staff';
import type { StaffMember, StaffRole, StaffShift, StaffStatus } from '@/data/staff';

const roles: StaffRole[] = [
  'Receptionist',
  'Café Cashier',
  'Floor Supervisor',
  'Technician',
  'Manager',
];
const shifts: StaffShift[] = ['Morning', 'Midday', 'Evening', 'Night'];
const statuses: StaffStatus[] = ['Active', 'On Leave', 'Terminated'];

const roleBadgeStyles: Record<StaffRole, string> = {
  Receptionist: 'bg-primary/10 text-primary border border-primary/20',
  'Café Cashier': 'bg-info/10 text-info border border-info/20',
  'Floor Supervisor': 'bg-accent/10 text-accent border border-accent/20',
  Technician: 'bg-warning/10 text-warning border border-warning/20',
  Manager: 'bg-warning/10 text-warning border border-warning/20',
};

const statusStyles: Record<StaffStatus, string> = {
  Active: 'bg-accent/10 text-accent border border-accent/20',
  'On Leave': 'bg-warning/10 text-warning border border-warning/20',
  Terminated: 'bg-danger/10 text-danger border border-danger/20',
};

const initialForm = {
  name: '',
  role: 'Receptionist' as StaffRole,
  email: '',
  phone: '',
  shift: 'Morning' as StaffShift,
  hourlyRate: 0,
  hireDate: '',
};

export default function StaffContent() {
  const [staff, setStaff] = useState<StaffMember[]>(() => loadStaff());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'All'>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [newStaff, setNewStaff] = useState(initialForm);

  const active = staff.filter((s) => s.status === 'Active').length;
  const onLeave = staff.filter((s) => s.status === 'On Leave').length;
  const terminated = staff.filter((s) => s.status === 'Terminated').length;

  const filtered = staff.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.phone.trim()) {
      toast.error('Name, email, and phone are required');
      return;
    }
    const name = newStaff.name.trim();
    const next = addStaff({
      name,
      role: newStaff.role,
      email: newStaff.email.trim(),
      phone: newStaff.phone.trim(),
      shift: newStaff.shift,
      status: 'Active',
      hourlyRate: Number(newStaff.hourlyRate) || 0,
      hireDate: newStaff.hireDate || new Date().toISOString().slice(0, 10),
      emergencyContact: '—',
    });
    setStaff(next);
    setNewStaff(initialForm);
    setAddOpen(false);
    toast.success(`${name} added to staff`);
  };

  const handleStatusChange = (id: string, status: StaffStatus) => {
    const next = updateStaff(id, { status });
    setStaff(next);
    toast.success(`Status updated to ${status}`);
  };

  const handleDelete = (member: StaffMember) => {
    const next = deleteStaff(member.id);
    setStaff(next);
    toast.success(`${member.name} removed from staff`);
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      <Toaster position="bottom-right" theme="system" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {staff.length} team members — manage roles, shifts, and pay
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center gap-2 h-9 self-start"
        >
          <Plus size={14} />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Staff</p>
              <p className="text-lg font-bold text-foreground font-tabular">{staff.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <UserCheck size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold text-accent font-tabular">{active}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <CalendarClock size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On Leave</p>
              <p className="text-lg font-bold text-warning font-tabular">{onLeave}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <UserX size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terminated</p>
              <p className="text-lg font-bold text-danger font-tabular">{terminated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + role filter */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setRoleFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              roleFilter === 'All'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All Roles
          </button>
          {roles.map((r) => {
            const count = staff.filter((s) => s.role === r).length;
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 ${
                  roleFilter === r
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    roleFilter === r
                      ? 'bg-primary/20 text-primary'
                      : 'bg-background text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center text-center gap-3 py-16">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
            <Users size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No staff members found</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Try a different search or add a new staff member.
          </p>
        </div>
      ) : (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {member.name
                              .split(' ')
                              .filter(Boolean)
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-foreground truncate">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${roleBadgeStyles[member.role]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{member.shift}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail size={11} />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1 font-tabular">
                          <Phone size={11} />
                          {member.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 font-tabular font-semibold text-foreground">
                        <DollarSign size={12} className="text-muted-foreground" />
                        {member.hourlyRate.toLocaleString()}/hr
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-tabular text-xs">
                      {member.hireDate}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={member.status}
                        onChange={(e) =>
                          handleStatusChange(member.id, e.target.value as StaffStatus)
                        }
                        className={`status-badge cursor-pointer outline-none appearance-none text-center pr-2 ${statusStyles[member.status]}`}
                        title="Edit status"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(member)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete staff member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-md card-base p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Add Staff Member</h2>
              <button
                onClick={() => setAddOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Full name
                </label>
                <input
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Karim Adel"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, role: e.target.value as StaffRole })
                    }
                    className="input-field"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Shift
                  </label>
                  <select
                    value={newStaff.shift}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, shift: e.target.value as StaffShift })
                    }
                    className="input-field"
                  >
                    {shifts.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="name@zoox.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Phone
                  </label>
                  <input
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="e.g. 0100-xxx-xxxx"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Hourly rate (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStaff.hourlyRate}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, hourlyRate: Number(e.target.value) })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Hire date
                  </label>
                  <input
                    type="date"
                    value={newStaff.hireDate}
                    onChange={(e) => setNewStaff({ ...newStaff, hireDate: e.target.value })}
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
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

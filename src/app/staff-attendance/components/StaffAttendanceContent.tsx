'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  UserCheck,
  UserX,
  MapPin,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AttendanceStatus = 'On Time' | 'Late' | 'Absent' | 'Off Duty';

interface StaffShift {
  id: string;
  name: string;
  role: string;
  shiftLabel: string;
  shiftStart: string;
  shiftEnd: string;
  status: AttendanceStatus;
  location: string;
  checkIn: string | null;
  minutesLate: number;
}

const initialStaff: StaffShift[] = [
  {
    id: 'st-001',
    name: 'Karim Adel',
    role: 'Receptionist',
    shiftLabel: 'Morning',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    status: 'On Time',
    location: 'Front Desk',
    checkIn: '08:52',
    minutesLate: 0,
  },
  {
    id: 'st-002',
    name: 'Sara Mahmoud',
    role: 'Café Cashier',
    shiftLabel: 'Morning',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    status: 'On Time',
    location: 'Café Counter',
    checkIn: '08:58',
    minutesLate: 0,
  },
  {
    id: 'st-003',
    name: 'Tarek Nabil',
    role: 'Floor Supervisor',
    shiftLabel: 'Midday',
    shiftStart: '12:00',
    shiftEnd: '20:00',
    status: 'On Time',
    location: 'Gaming Floor',
    checkIn: '11:55',
    minutesLate: 0,
  },
  {
    id: 'st-004',
    name: 'Nour Hassan',
    role: 'Technician',
    shiftLabel: 'Midday',
    shiftStart: '12:00',
    shiftEnd: '20:00',
    status: 'Late',
    location: 'Tech Room',
    checkIn: '12:18',
    minutesLate: 18,
  },
  {
    id: 'st-005',
    name: 'Youssef Adel',
    role: 'Receptionist',
    shiftLabel: 'Evening',
    shiftStart: '16:00',
    shiftEnd: '00:00',
    status: 'Late',
    location: 'Front Desk',
    checkIn: '16:27',
    minutesLate: 27,
  },
  {
    id: 'st-006',
    name: 'Mona Ibrahim',
    role: 'Café Cashier',
    shiftLabel: 'Evening',
    shiftStart: '16:00',
    shiftEnd: '00:00',
    status: 'On Time',
    location: 'Café Counter',
    checkIn: '15:53',
    minutesLate: 0,
  },
  {
    id: 'st-007',
    name: 'Hassan Samir',
    role: 'Floor Supervisor',
    shiftLabel: 'Evening',
    shiftStart: '16:00',
    shiftEnd: '00:00',
    status: 'Absent',
    location: '—',
    checkIn: null,
    minutesLate: 0,
  },
  {
    id: 'st-008',
    name: 'Dina Khaled',
    role: 'Technician',
    shiftLabel: 'Night',
    shiftStart: '20:00',
    shiftEnd: '04:00',
    status: 'Off Duty',
    location: 'Tech Room',
    checkIn: null,
    minutesLate: 0,
  },
  {
    id: 'st-009',
    name: 'Ramy Fathy',
    role: 'Receptionist',
    shiftLabel: 'Night',
    shiftStart: '20:00',
    shiftEnd: '04:00',
    status: 'Off Duty',
    location: 'Front Desk',
    checkIn: null,
    minutesLate: 0,
  },
];

const statusStyles: Record<AttendanceStatus, string> = {
  'On Time': 'bg-accent/10 text-accent border border-accent/20',
  Late: 'bg-warning/10 text-warning border border-warning/20',
  Absent: 'bg-danger/10 text-danger border border-danger/20',
  'Off Duty': 'bg-muted text-muted-foreground border border-border',
};

const roleStyles: Record<string, string> = {
  Receptionist: 'text-primary',
  'Café Cashier': 'text-info',
  'Floor Supervisor': 'text-accent',
  Technician: 'text-warning',
};

export default function StaffAttendanceContent() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user && user.role !== 'owner' && user.role !== 'manager') {
      router.replace(user.role === 'customer' ? '/customer-dashboard' : '/');
    }
  }, [ready, user, router]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-EG', {
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

  if (!ready || !user) return null;
  if (user.role !== 'owner' && user.role !== 'manager') return null;

  const onTime = initialStaff.filter((s) => s.status === 'On Time').length;
  const late = initialStaff.filter((s) => s.status === 'Late').length;
  const absent = initialStaff.filter((s) => s.status === 'Absent').length;
  const present = initialStaff.filter((s) => s.status !== 'Off Duty').length;

  const ShiftRow = ({ staff }: { staff: StaffShift }) => {
    const isOpen = expanded === staff.id;
    return (
      <div className="border border-border rounded-xl bg-muted/20 overflow-hidden">
        <button
          onClick={() => setExpanded(isOpen ? null : staff.id)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {staff.name
                .split(' ')
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{staff.name}</p>
            <p
              className={`text-xs font-medium ${roleStyles[staff.role] || 'text-muted-foreground'}`}
            >
              {staff.role}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            <span className="font-tabular">
              {staff.shiftStart} – {staff.shiftEnd}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span>{staff.location}</span>
          </div>
          <span className={`status-badge ${statusStyles[staff.status]}`}>{staff.status}</span>
          {isOpen ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Shift</p>
              <p className="text-foreground font-medium font-tabular">
                {staff.shiftStart} – {staff.shiftEnd}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-in</p>
              <p className="text-foreground font-medium font-tabular">{staff.checkIn ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <p className="text-foreground font-medium">{staff.location}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p
                className={`font-medium ${staff.status === 'Late' ? 'text-warning' : staff.status === 'Absent' ? 'text-danger' : staff.status === 'On Time' ? 'text-accent' : 'text-muted-foreground'}`}
              >
                {staff.status === 'Late' ? `${staff.minutesLate} min late` : staff.status}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Clock size={15} className="text-primary" />
            <span className="font-tabular text-sm font-semibold text-foreground">
              {currentTime}
            </span>
          </div>
          <button
            onClick={() => setExpanded(null)}
            className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Reset view"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <UserCheck size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On Time</p>
              <p className="text-lg font-bold text-foreground font-tabular">{onTime}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <Clock size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Late</p>
              <p className="text-lg font-bold text-warning font-tabular">{late}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
              <UserX size={18} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="text-lg font-bold text-danger font-tabular">{absent}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CalendarDays size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Present Now</p>
              <p className="text-lg font-bold text-foreground font-tabular">{present}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" /> On Time
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-warning" /> Late
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger" /> Absent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" /> Off Duty
        </span>
      </div>

      {/* Staff list */}
      <div className="space-y-2">
        {initialStaff.map((staff) => (
          <ShiftRow key={staff.id} staff={staff} />
        ))}
      </div>
    </div>
  );
}

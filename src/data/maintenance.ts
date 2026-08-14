export interface MaintenanceTask {
  id: string;
  title: string;
  location: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Done' | 'Cancelled';
  assignedTo: string;
  reportedBy: string;
  reportedAt: string;
  description: string;
  completedAt?: string;
}

const STORAGE_KEY = 'zoox-maintenance';

export const seedMaintenance: MaintenanceTask[] = [
  {
    id: 'mt-001',
    title: 'Room 8 monitor backlight flicker',
    location: 'Room 8',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Nour Hassan',
    reportedBy: 'Karim Adel',
    reportedAt: '2026-08-12 09:30',
    description: 'LG UltraGear monitor flickers after 2 hours of use. Spare part ordered.',
  },
  {
    id: 'mt-002',
    title: 'Controller drift - CTR-01',
    location: 'Room 1',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Dina Khaled',
    reportedBy: 'Mohamed Khalil',
    reportedAt: '2026-08-13 14:10',
    description: 'Left analog stick drifting in-game. Needs calibration or replacement.',
  },
  {
    id: 'mt-003',
    title: 'Headset cushion replacement',
    location: 'Room 4',
    priority: 'Low',
    status: 'Open',
    assignedTo: 'Dina Khaled',
    reportedBy: 'Karim Mostafa',
    reportedAt: '2026-08-12 17:45',
    description: 'Pulse 3D ear cushions worn out, causing discomfort.',
  },
  {
    id: 'mt-004',
    title: 'Air conditioning - gaming floor',
    location: 'Gaming Floor',
    priority: 'Urgent',
    status: 'Done',
    assignedTo: 'Nour Hassan',
    reportedBy: 'Ahmed Hassan',
    reportedAt: '2026-08-10 11:00',
    description: 'AC unit not cooling. Technician fixed refrigerant leak.',
    completedAt: '2026-08-11 13:20',
  },
  {
    id: 'mt-005',
    title: 'Café espresso machine descale',
    location: 'Café Counter',
    priority: 'Medium',
    status: 'Done',
    assignedTo: 'Sara Mahmoud',
    reportedBy: 'Sara Mahmoud',
    reportedAt: '2026-08-09 08:00',
    description: 'Scheduled weekly descale.',
    completedAt: '2026-08-09 08:40',
  },
];

export function loadMaintenance(): MaintenanceTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MaintenanceTask[];
  } catch {
    /* ignore */
  }
  return seedMaintenance;
}

export function saveMaintenance(tasks: MaintenanceTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

export function addMaintenance(
  data: Omit<MaintenanceTask, 'id' | 'status' | 'reportedAt'>
): MaintenanceTask[] {
  const now = new Date();
  const next: MaintenanceTask[] = [
    {
      ...data,
      id: `mt-${Date.now()}`,
      status: 'Open',
      reportedAt: now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    ...loadMaintenance(),
  ];
  saveMaintenance(next);
  return next;
}

export function updateMaintenance(id: string, patch: Partial<MaintenanceTask>): MaintenanceTask[] {
  const next = loadMaintenance().map((t) => {
    if (t.id !== id) return t;
    const merged = { ...t, ...patch };
    if (patch.status === 'Done') {
      merged.completedAt = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return merged;
  });
  saveMaintenance(next);
  return next;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

const STORAGE_KEY = 'zoox-audit-logs';

export const seedAuditLogs: AuditLogEntry[] = [
  {
    id: 'al-001',
    timestamp: '2026-08-13 18:24',
    actor: 'Karim Adel',
    actorRole: 'Staff',
    action: 'Sale Completed',
    target: 'Sale #SL-7841',
    details: 'Completed café order of 85.50 EGP.',
    severity: 'Info',
  },
  {
    id: 'al-002',
    timestamp: '2026-08-13 18:15',
    actor: 'Omar Saleh',
    actorRole: 'Manager',
    action: 'Session Ended',
    target: 'Room 2',
    details: 'Ended session for Ahmed Samir & Group. Bill 480 EGP.',
    severity: 'Info',
  },
  {
    id: 'al-003',
    timestamp: '2026-08-13 17:58',
    actor: 'Karim Adel',
    actorRole: 'Staff',
    action: 'Inventory Adjusted',
    target: 'Red Bull 250ml',
    details: 'Stock reduced by 2 after café order.',
    severity: 'Warning',
  },
  {
    id: 'al-004',
    timestamp: '2026-08-13 17:30',
    actor: 'Ahmed Hassan',
    actorRole: 'Owner',
    action: 'Expense Recorded',
    target: 'Expense #EXP-332',
    details: 'Added electricity bill 4,200 EGP.',
    severity: 'Info',
  },
  {
    id: 'al-005',
    timestamp: '2026-08-13 16:45',
    actor: 'Ahmed Hassan',
    actorRole: 'Owner',
    action: 'Maintenance Created',
    target: 'Room 8',
    details: 'Logged monitor backlight issue (High priority).',
    severity: 'Warning',
  },
  {
    id: 'al-006',
    timestamp: '2026-08-13 16:02',
    actor: 'System',
    actorRole: 'System',
    action: 'Login Failed',
    target: 'staff@zoox-ps.com',
    details: '3 failed login attempts before success.',
    severity: 'Critical',
  },
  {
    id: 'al-007',
    timestamp: '2026-08-13 15:40',
    actor: 'Sara Mahmoud',
    actorRole: 'Staff',
    action: 'Lost Item Logged',
    target: 'Phone - Room 3',
    details: 'Found Samsung Galaxy A54, logged for claim.',
    severity: 'Info',
  },
  {
    id: 'al-008',
    timestamp: '2026-08-13 14:55',
    actor: 'Omar Saleh',
    actorRole: 'Manager',
    action: 'Reservation Created',
    target: 'Room 5',
    details: 'New reservation for Friday 20:00.',
    severity: 'Info',
  },
];

export function loadAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuditLogEntry[];
  } catch {
    /* ignore */
  }
  return seedAuditLogs;
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    /* ignore */
  }
}

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry[] {
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const next: AuditLogEntry[] = [
    { ...entry, id: `al-${Date.now()}`, timestamp: now },
    ...loadAuditLogs(),
  ];
  saveAuditLogs(next);
  return next;
}

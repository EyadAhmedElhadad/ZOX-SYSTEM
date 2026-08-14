export type StaffRole =
  'Receptionist' | 'Café Cashier' | 'Floor Supervisor' | 'Technician' | 'Manager';
export type StaffShift = 'Morning' | 'Midday' | 'Evening' | 'Night';
export type StaffStatus = 'Active' | 'On Leave' | 'Terminated';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  shift: StaffShift;
  status: StaffStatus;
  hourlyRate: number;
  hireDate: string;
  emergencyContact: string;
}

const STORAGE_KEY = 'zoox-staff';

export const seedStaff: StaffMember[] = [
  {
    id: 'st-001',
    name: 'Karim Adel',
    role: 'Receptionist',
    email: 'karim.adel@zoox.com',
    phone: '0100-111-2211',
    shift: 'Morning',
    status: 'Active',
    hourlyRate: 45,
    hireDate: '2024-09-01',
    emergencyContact: '0100-999-0001',
  },
  {
    id: 'st-002',
    name: 'Sara Mahmoud',
    role: 'Café Cashier',
    email: 'sara.mahmoud@zoox.com',
    phone: '0101-222-3322',
    shift: 'Morning',
    status: 'Active',
    hourlyRate: 40,
    hireDate: '2024-11-15',
    emergencyContact: '0100-999-0002',
  },
  {
    id: 'st-003',
    name: 'Tarek Nabil',
    role: 'Floor Supervisor',
    email: 'tarek.nabil@zoox.com',
    phone: '0102-333-4433',
    shift: 'Midday',
    status: 'Active',
    hourlyRate: 60,
    hireDate: '2023-05-20',
    emergencyContact: '0100-999-0003',
  },
  {
    id: 'st-004',
    name: 'Nour Hassan',
    role: 'Technician',
    email: 'nour.hassan@zoox.com',
    phone: '0103-444-5544',
    shift: 'Midday',
    status: 'On Leave',
    hourlyRate: 55,
    hireDate: '2024-02-10',
    emergencyContact: '0100-999-0004',
  },
  {
    id: 'st-005',
    name: 'Youssef Adel',
    role: 'Receptionist',
    email: 'youssef.adel@zoox.com',
    phone: '0104-555-6655',
    shift: 'Evening',
    status: 'Active',
    hourlyRate: 48,
    hireDate: '2025-01-05',
    emergencyContact: '0100-999-0005',
  },
  {
    id: 'st-006',
    name: 'Mona Ibrahim',
    role: 'Café Cashier',
    email: 'mona.ibrahim@zoox.com',
    phone: '0105-666-7766',
    shift: 'Evening',
    status: 'Active',
    hourlyRate: 42,
    hireDate: '2025-03-18',
    emergencyContact: '0100-999-0006',
  },
  {
    id: 'st-007',
    name: 'Hassan Samir',
    role: 'Floor Supervisor',
    email: 'hassan.samir@zoox.com',
    phone: '0106-777-8877',
    shift: 'Evening',
    status: 'On Leave',
    hourlyRate: 62,
    hireDate: '2023-08-25',
    emergencyContact: '0100-999-0007',
  },
  {
    id: 'st-008',
    name: 'Dina Khaled',
    role: 'Technician',
    email: 'dina.khaled@zoox.com',
    phone: '0107-888-9988',
    shift: 'Night',
    status: 'Terminated',
    hourlyRate: 55,
    hireDate: '2024-06-01',
    emergencyContact: '0100-999-0008',
  },
];

export function loadStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StaffMember[];
  } catch {
    /* ignore */
  }
  return seedStaff;
}

export function saveStaff(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  } catch {
    /* ignore */
  }
}

export function addStaff(data: Omit<StaffMember, 'id'>): StaffMember[] {
  const next: StaffMember[] = [
    {
      ...data,
      id: `st-${Date.now()}`,
    },
    ...loadStaff(),
  ];
  saveStaff(next);
  return next;
}

export function updateStaff(id: string, patch: Partial<StaffMember>): StaffMember[] {
  const next = loadStaff().map((member) => (member.id === id ? { ...member, ...patch } : member));
  saveStaff(next);
  return next;
}

export function deleteStaff(id: string): StaffMember[] {
  const next = loadStaff().filter((member) => member.id !== id);
  saveStaff(next);
  return next;
}

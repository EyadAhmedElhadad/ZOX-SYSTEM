export interface Settings {
  centerName: string;
  centerPhone: string;
  centerAddress: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  standardHourly: number;
  premiumHourly: number;
  vipHourly: number;
  sessionTimeoutMinutes: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  maintenanceMode: boolean;
}

const STORAGE_KEY = 'zoox-settings';

export const defaultSettings: Settings = {
  centerName: 'Zoox PlayStation Center',
  centerPhone: '+20 100 000 0000',
  centerAddress: '124 Gamal Abdel Nasser St, Alexandria, Egypt',
  currency: 'EGP',
  taxRate: 14,
  lowStockThreshold: 25,
  standardHourly: 80,
  premiumHourly: 100,
  vipHourly: 200,
  sessionTimeoutMinutes: 30,
  notificationsEnabled: true,
  soundEnabled: true,
  maintenanceMode: false,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* ignore */
  }
  return { ...defaultSettings };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

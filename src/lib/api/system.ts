'use client';

import type {
  AuditLogRow,
  ExpensesDailyView,
  OccupancyDailyView,
  RevenueDailyView,
  SettingsRow,
  TopCustomerView,
} from '@/lib/supabase/types';
import { enGBDateTime, fetchAll } from './base';

// ---------------------------------------------------------------------------
// Audit logs (read-only, written by triggers)
// ---------------------------------------------------------------------------
export interface UiAuditLog {
  id: string;
  timestamp: string; // en-GB display
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export const auditApi = {
  async list(limit = 100): Promise<UiAuditLog[]> {
    const rows = await fetchAll<AuditLogRow>('audit_logs', {
      order: 'created_at',
      ascending: false,
      limit,
    });
    return rows.map((row) => ({
      id: row.id,
      timestamp: enGBDateTime(row.created_at),
      actor: row.actor_name,
      actorRole: row.actor_role,
      action: row.action,
      target: row.target_label || row.target_table,
      details: row.details,
      severity: row.severity,
    }));
  },
};

// ---------------------------------------------------------------------------
// Settings (singleton)
// ---------------------------------------------------------------------------
export interface UiSettings extends Omit<SettingsRow, 'id' | 'updated_by'> {}

export const settingsApi = {
  async get(): Promise<UiSettings | null> {
    const supabaseModule = await import('@/lib/supabase/client');
    const client = supabaseModule.getSupabaseBrowserClient();
    const { data, error } = await client.from('settings').select('*').eq('id', 1).single();
    if (error) throw new Error(error.message);
    return (data as SettingsRow) ?? null;
  },
  async update(patch: Partial<UiSettings>): Promise<void> {
    const supabaseModule = await import('@/lib/supabase/client');
    const client = supabaseModule.getSupabaseBrowserClient();
    const { error } = await client.from('settings').update(patch as never).eq('id', 1);
    if (error) throw new Error(error.message);
  },
};

// ---------------------------------------------------------------------------
// Reports (aggregated views)
// ---------------------------------------------------------------------------
export interface ReportSeriesPoint {
  label: string;
  value: number;
}

export const reportsApi = {
  async revenueDaily(days = 30): Promise<RevenueDailyView[]> {
    const supabaseModule = await import('@/lib/supabase/client');
    const client = supabaseModule.getSupabaseBrowserClient();
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const { data, error } = await client
      .from('revenue_daily')
      .select('*')
      .gte('day', from)
      .order('day', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as RevenueDailyView[];
  },
  async expensesDaily(days = 30): Promise<ExpensesDailyView[]> {
    const supabaseModule = await import('@/lib/supabase/client');
    const client = supabaseModule.getSupabaseBrowserClient();
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const { data, error } = await client
      .from('expenses_daily')
      .select('*')
      .gte('day', from)
      .order('day', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ExpensesDailyView[];
  },
  async occupancyDaily(days = 30): Promise<OccupancyDailyView[]> {
    const supabaseModule = await import('@/lib/supabase/client');
    const client = supabaseModule.getSupabaseBrowserClient();
    const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const { data, error } = await client
      .from('occupancy_daily')
      .select('*')
      .gte('day', from)
      .order('day', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as OccupancyDailyView[];
  },
  async topCustomers(limit = 10): Promise<TopCustomerView[]> {
    const supabaseModule = await import('@/lib/supabase/client');
    const client = supabaseModule.getSupabaseBrowserClient();
    const { data, error } = await client
      .from('top_customers_view')
      .select('*')
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as TopCustomerView[];
  },
};

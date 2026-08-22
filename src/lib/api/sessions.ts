'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { z } from 'zod';
import type { LiveSessionRow, RoomRow, SessionProductRow, SaleRow } from '@/lib/supabase/types';
import {
  startSessionSchema,
  endSessionSchema,
  extendSessionSchema,
  addSessionProductSchema,
} from '@/lib/validation';

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;

/** Shape consumed by the existing Live Sessions UI components. */
export interface UiSessionProduct {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface UiLiveSession {
  id: string;
  roomId: string;
  room: string;
  roomType: 'Standard' | 'Premium' | 'VIP';
  customerId: string | null;
  customer: string;
  phone: string;
  game: string;
  controllers: string[];
  startTime: string; // HH:mm (local)
  startMinutesAgo: number;
  players: number;
  hourlyRate: number;
  sessionType: 'open' | 'fixed';
  fixedDurationMinutes?: number;
  extendedMinutes?: number;
  products: UiSessionProduct[];
  status: 'active' | 'paused';
  // Server-authoritative timing used for display math
  startedAt: string;
  pausedSeconds: number;
  pausedAtISO: string | null;
}

function hhmm(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function mapSession(
  row: LiveSessionRow,
  room: Pick<RoomRow, 'name' | 'room_type'> | null,
  customerName: string | null,
  products: SessionProductRow[],
  controllerSerials: string[] = []
): UiLiveSession {
  const nowSec = Math.floor(Date.now() / 1000);
  const startSec = Math.floor(new Date(row.started_at).getTime() / 1000);
  const refSec = row.paused_at ? Math.floor(new Date(row.paused_at).getTime() / 1000) : nowSec;
  const elapsedMin = Math.max(0, Math.floor((refSec - startSec - row.paused_seconds) / 60));

  return {
    id: row.id,
    roomId: row.room_id,
    room: room?.name ?? 'Unknown',
    roomType: room?.room_type ?? 'Standard',
    customerId: row.customer_id,
    customer: customerName || row.guest_name || 'Walk-in',
    phone: row.phone,
    game: row.game,
    controllers: controllerSerials,
    startTime: hhmm(row.started_at),
    startMinutesAgo: elapsedMin,
    players: row.players,
    hourlyRate: Number(row.hourly_rate),
    sessionType: row.session_kind,
    fixedDurationMinutes: row.fixed_duration_minutes ?? undefined,
    extendedMinutes: row.extended_minutes,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      qty: p.qty,
    })),
    status: row.status === 'paused' ? 'paused' : 'active',
    startedAt: row.started_at,
    pausedSeconds: row.paused_seconds,
    pausedAtISO: row.paused_at,
  };
}

export async function fetchLiveSessions(): Promise<UiLiveSession[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: sessions, error } = await supabase
    .from('live_sessions')
    .select('*, rooms(name, room_type), customers(name)')
    .in('status', ['active', 'paused'])
    .order('started_at', { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (sessions ?? []) as unknown as Array<
    LiveSessionRow & { rooms: Pick<RoomRow, 'name' | 'room_type'> | null } & {
      customers: { name: string } | null;
    }
  >;

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [{ data: products }, { data: links }] = await Promise.all([
    supabase.from('session_products').select('*').in('session_id', ids),
    supabase
      .from('session_controllers')
      .select('session_id, hardware(serial)')
      .in('session_id', ids),
  ]);

  const productsBySession = new Map<string, SessionProductRow[]>();
  for (const p of (products ?? []) as unknown as SessionProductRow[]) {
    const list = productsBySession.get(p.session_id) ?? [];
    list.push(p);
    productsBySession.set(p.session_id, list);
  }
  const serialsBySession = new Map<string, string[]>();
  for (const link of (links ?? []) as unknown as Array<{
    session_id: string;
    hardware: { serial: string } | { serial: string }[] | null;
  }>) {
    const h = link.hardware;
    const serial = Array.isArray(h) ? h[0]?.serial : h?.serial;
    if (!serial) continue;
    const list = serialsBySession.get(link.session_id) ?? [];
    list.push(serial);
    serialsBySession.set(link.session_id, list);
  }

  return rows.map((r) =>
    mapSession(
      r,
      r.rooms ?? null,
      r.customers?.name ?? null,
      productsBySession.get(r.id) ?? [],
      serialsBySession.get(r.id) ?? []
    )
  );
}

export interface RealtimeHandlers {
  onChange: () => void;
}

/**
 * Subscribes to Postgres changes for the floor: sessions, product lines and
 * room statuses. Every connected client (Owner dashboard / Staff view) gets
 * the same push — no polling.
 */
export function subscribeLiveFloor({ onChange }: RealtimeHandlers): () => void {
  const supabase = getSupabaseBrowserClient();
  const channel = supabase
    .channel('live-sessions-floor')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () =>
      onChange()
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'session_products' }, () =>
      onChange()
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => onChange())
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Write operations (validated, executed server-side via RPCs)
// ---------------------------------------------------------------------------

/**
 * Minimal typed RPC wrapper. supabase-js v2.112's conditional RPC generics
 * resolve poorly against hand-written schema types; Zod schemas above already
 * validate every argument before it reaches the database.
 */
async function callRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await (
    supabase.rpc as unknown as (
      fn: string,
      a: Record<string, unknown>
    ) => Promise<{ data: T | null; error: { message: string } | null }>
  )(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export async function startSession(input: StartSessionInput): Promise<string> {
  const parsed = startSessionSchema.parse(input);
  return callRpc<string>('start_session', { ...parsed });
}

export async function pauseSession(sessionId: string): Promise<void> {
  await callRpc<void>('pause_session', { p_session_id: sessionId });
}

export async function resumeSession(sessionId: string): Promise<void> {
  await callRpc<void>('resume_session', { p_session_id: sessionId });
}

export async function extendSession(sessionId: string, minutes: number): Promise<void> {
  const parsed = extendSessionSchema.parse({ p_session_id: sessionId, p_minutes: minutes });
  await callRpc<void>('extend_session', parsed);
}

export async function addSessionProduct(input: {
  sessionId: string;
  productId?: string | null;
  name: string;
  price: number;
  qty: number;
}): Promise<void> {
  const parsed = addSessionProductSchema.parse({
    p_session_id: input.sessionId,
    p_product_id: input.productId ?? null,
    p_name: input.name,
    p_price: input.price,
    p_qty: input.qty,
  });
  await callRpc<void>('add_session_product', parsed);
}

export interface CompletedSale {
  id: string;
  invoiceNumber: string;
  total: number;
  paymentMethod: string;
}

/** Authoritative checkout — billing computed by the end_session RPC. */
export async function endSession(input: EndSessionInput): Promise<CompletedSale> {
  const parsed = endSessionSchema.parse(input);
  const saleId = await callRpc<string>('end_session', parsed);

  const { data: sale, error: saleError } = await getSupabaseBrowserClient()
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .single();
  if (saleError) throw new Error(saleError.message);
  const s = sale as SaleRow;
  return {
    id: s.id,
    invoiceNumber: s.invoice_number,
    total: Number(s.total),
    paymentMethod: s.payment_method,
  };
}

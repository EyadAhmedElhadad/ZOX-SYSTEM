/**
 * Pure billing math shared by UI display and tests.
 * The AUTHORITATIVE calculation lives server-side (end_session RPC);
 * these functions mirror it exactly for live display only.
 */

export interface BillableSession {
  startedAt: string;
  pausedSeconds: number;
  pausedAt?: string | null;
  sessionType: 'open' | 'fixed';
  fixedDurationMinutes?: number | null;
  extendedMinutes?: number | null;
  hourlyRate: number;
  products: Array<{ price: number; qty: number }>;
}

/** Minutes of play time elapsed, excluding paused spans, frozen while paused. */
export function elapsedMinutes(
  startedAt: string,
  pausedSeconds: number,
  pausedAt: string | null | undefined,
  nowMs: number = Date.now()
): number {
  const refMs = pausedAt ? new Date(pausedAt).getTime() : nowMs;
  const totalSeconds = Math.floor((refMs - new Date(startedAt).getTime()) / 1000);
  return Math.max(0, Math.floor((totalSeconds - pausedSeconds) / 60));
}

/** Fixed sessions are capped at booked duration + extensions. */
export function billedMinutesFor(
  sessionType: 'open' | 'fixed',
  elapsedMin: number,
  fixedDurationMinutes?: number | null,
  extendedMinutes?: number | null
): number {
  if (sessionType === 'fixed' && fixedDurationMinutes != null) {
    return Math.min(elapsedMin, fixedDurationMinutes + (extendedMinutes ?? 0));
  }
  return elapsedMin;
}

/** round((minutes / 60) * rate) — mirrors SQL round((m::numeric/60)*rate). */
export function timeCostFor(billedMin: number, hourlyRate: number): number {
  return Math.round((billedMin / 60) * hourlyRate);
}

export function productsCostFor(products: Array<{ price: number; qty: number }>): number {
  return products.reduce((sum, p) => sum + p.price * p.qty, 0);
}

export interface BillBreakdown {
  elapsed: number;
  billedMinutes: number;
  sessionCost: number;
  productsCost: number;
  subtotal: number;
}

export function computeBill(session: BillableSession, nowMs: number = Date.now()): BillBreakdown {
  const elapsed = elapsedMinutes(session.startedAt, session.pausedSeconds, session.pausedAt, nowMs);
  const billedMinutes = billedMinutesFor(
    session.sessionType,
    elapsed,
    session.fixedDurationMinutes,
    session.extendedMinutes
  );
  const sessionCost = timeCostFor(billedMinutes, session.hourlyRate);
  const productsCost = productsCostFor(session.products);
  return {
    elapsed,
    billedMinutes,
    sessionCost,
    productsCost,
    subtotal: sessionCost + productsCost,
  };
}

/** Loyalty points earned per EGP spent (matches seed ratio ~0.6 pts/EGP). */
export function pointsForTotal(total: number): number {
  return Math.floor(total * 0.6);
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP';

export function tierForPoints(points: number): LoyaltyTier {
  if (points >= 5000) return 'VIP';
  if (points >= 2000) return 'Gold';
  if (points >= 800) return 'Silver';
  return 'Bronze';
}

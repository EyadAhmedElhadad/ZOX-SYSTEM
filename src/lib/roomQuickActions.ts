import { catalogProducts } from '../data/catalog';
import type { LiveSession, SessionProduct } from '../data/sessions';

export interface QuickActionOptions {
  productId?: string;
  quantity?: number;
  extendMinutes?: number;
}

export interface QuickActionResult {
  session: LiveSession;
  productAdded: SessionProduct;
  timeExtended: number;
  cost: number;
}

export const QUICK_ACTION_CONFIG = {
  productId: 'cat-001',
  quantity: 1,
  extendMinutes: 30,
  durationOptions: [15, 30, 60],
};

export const ALLOWED_DURATIONS = QUICK_ACTION_CONFIG.durationOptions;

export function getQuickActionProduct(productId: string = QUICK_ACTION_CONFIG.productId) {
  return catalogProducts.find((p) => p.id === productId) ?? catalogProducts[0];
}

export function getQuickActionCost(
  price: number,
  quantity: number,
  hourlyRate: number,
  extendMinutes: number
): number {
  return price * quantity + Math.round((extendMinutes / 60) * hourlyRate);
}

export function applyQuickAction(
  session: LiveSession,
  options: QuickActionOptions = {}
): QuickActionResult {
  const product = getQuickActionProduct(options.productId);
  const quantity = options.quantity ?? QUICK_ACTION_CONFIG.quantity;
  const extendMinutes = options.extendMinutes ?? QUICK_ACTION_CONFIG.extendMinutes;

  const productAdded: SessionProduct = {
    id: `${session.id}-${product.id}-${Date.now()}`,
    name: product.name,
    price: product.price,
    qty: quantity,
  };

  const existing = session.products.find((p) => p.name === product.name);
  const products = existing
    ? session.products.map((p) => (p.name === product.name ? { ...p, qty: p.qty + quantity } : p))
    : [...session.products, productAdded];

  const updated: LiveSession =
    session.sessionType === 'fixed'
      ? {
          ...session,
          fixedDurationMinutes: (session.fixedDurationMinutes ?? 0) + extendMinutes,
          products,
        }
      : {
          ...session,
          extendedMinutes: (session.extendedMinutes ?? 0) + extendMinutes,
          products,
        };

  const cost = getQuickActionCost(product.price, quantity, session.hourlyRate, extendMinutes);

  return { session: updated, productAdded, timeExtended: extendMinutes, cost };
}

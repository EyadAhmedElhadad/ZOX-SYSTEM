import type { ZoneSession } from '../data/zones';
import type { SessionProduct } from '../data/sessions';
import { QUICK_ACTION_CONFIG, getQuickActionProduct, getQuickActionCost } from './roomQuickActions';

export interface ZoneQuickActionOptions {
  productId?: string;
  quantity?: number;
  extendMinutes?: number;
}

export interface ZoneQuickActionResult {
  zone: ZoneSession;
  productAdded: SessionProduct;
  timeExtended: number;
  cost: number;
}

export function applyZoneQuickAction(
  zone: ZoneSession,
  options: ZoneQuickActionOptions = {}
): ZoneQuickActionResult {
  const product = getQuickActionProduct(options.productId);
  const quantity = options.quantity ?? QUICK_ACTION_CONFIG.quantity;
  const extendMinutes = options.extendMinutes ?? QUICK_ACTION_CONFIG.extendMinutes;

  const productAdded: SessionProduct = {
    id: `${zone.id}-${product.id}-${Date.now()}`,
    name: product.name,
    price: product.price,
    qty: quantity,
  };

  const existing = zone.products.find((p) => p.name === product.name);
  const products = existing
    ? zone.products.map((p) => (p.name === product.name ? { ...p, qty: p.qty + quantity } : p))
    : [...zone.products, productAdded];

  const updated: ZoneSession =
    zone.sessionType === 'fixed'
      ? {
          ...zone,
          fixedDurationMinutes: (zone.fixedDurationMinutes ?? 0) + extendMinutes,
          products,
        }
      : {
          ...zone,
          extendedMinutes: (zone.extendedMinutes ?? 0) + extendMinutes,
          products,
        };

  const cost = getQuickActionCost(product.price, quantity, zone.hourlyRate, extendMinutes);

  return { zone: updated, productAdded, timeExtended: extendMinutes, cost };
}

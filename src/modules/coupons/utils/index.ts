import ApiError from "../../../common/errors/ApiError";
import redis from "../../../infrastructure/redis/redisClient";
import { CouponRepository } from "../repository/coupon.repository";


export function normalizeCart(cart: { items: any[] }) {
  const map = new Map<string, { price: number; quantity: number }>();
  for (const item of cart.items) {
    map.set(item.productId, {
      price: item.price,
      quantity: item.quantity,
    });
  }
  return map;
}

export function computeTotal(itemsMap: Map<string, { price: number; quantity: number }>): number {
  let total = 0;
  for (const { price, quantity } of itemsMap.values()) {
    total += price * quantity;
  }
  return total;
}

const ACTIVE_COUPONS_KEY = 'coupons:active';
const repo = new CouponRepository();

export async function loadActiveCoupons() {
  const cached = await redis.get(ACTIVE_COUPONS_KEY);
  if (cached) return JSON.parse(cached);

  const result = await repo.findAllActive(); // includes start/end/isActive filtering
  await redis.set(ACTIVE_COUPONS_KEY, JSON.stringify(result), 'EX', 60);

  return result;
}

export function preconditionPasses(coupon: any, cartTotal: number, itemsMap: Map<string, any>) {

  // global active checks already evaluated in repo (start/end, isActive)

  if (coupon.type === 'cart-wise') {
    const { threshold } = coupon.details ?? {};
    return typeof threshold === 'number' && cartTotal >= threshold;
  }

  if (coupon.type === 'product-wise') {
    return itemsMap.has(coupon.details?.productId);
  }

  if (coupon.type === 'bxgy') {
    const buyProducts = coupon.details?.buyProducts ?? [];
    let totalBuy = 0;
    for (const b of buyProducts) {
      const v = itemsMap.get(b.productId);
      if (v) totalBuy += v.quantity;
    }
    const required = buyProducts.reduce((s: any, p: { quantity: any; }) => s + p.quantity, 0);
    return totalBuy >= required;
  }

  return false; // unknown type
}


export function applyStackingPolicy(applicable: any[]) {
  if (applicable.length <= 1) return applicable;

  // default: BEST discount wins
  const best = applicable.reduce((a, b) =>
    a.discountAmount > b.discountAmount ? a : b
  );
  return [best];
}


export function ensureActiveAndInWindow(coupon: any) {
  if (!coupon) throw new ApiError(404, 'Coupon not found');

  if (!coupon.isActive) {
    throw new ApiError(400, 'Coupon is disabled by vendor');
  }

  const now = new Date();
  if (coupon.startAt && new Date(coupon.startAt) > now) {
    throw new ApiError(400, 'Coupon not started yet');
  }

  if (coupon.endAt && new Date(coupon.endAt) <= now) {
    throw new ApiError(400, 'Coupon has expired');
  }
}

export async function promiseAllLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<any>[] = [];

  for (const task of tasks) {
    const p = task().then((res) => {
      results.push(res);
      executing.splice(executing.indexOf(p), 1);
    });

    executing.push(p);
    if (executing.length >= limit) await Promise.race(executing);
  }

  await Promise.all(executing);
  return results;
}


import { ICouponStrategy, CartDTO, CouponCalculationResult } from './base.strategy';
import { CouponModel } from '../models/coupon.model';

export class BxGyStrategy implements ICouponStrategy {
  async calculate(cart: CartDTO, coupon: CouponModel): Promise<CouponCalculationResult> {
    // Basic implementation:
    // - Count how many buyProducts quantity exists in cart
    // - Determine repetition and free items available
    // - Mark getProducts as free up to the allowed count
    const items = cart.items || [];
    const details = coupon.details || {};
    const buyProducts: { productId: string; quantity: number }[] = details.buyProducts || [];
    const getProducts: { productId: string; quantity: number }[] = details.getProducts || [];
    const repetitionLimit: number = details.repetitionLimit ?? Infinity;

    // Build map of productId -> quantity
    const qtyMap = new Map(items.map(i => [i.productId, i.quantity]));

    // total buy units that match across buyProducts
    let totalBuyUnits = 0;
    for (const b of buyProducts) {
      const have = qtyMap.get(b.productId) ?? 0;
      totalBuyUnits += Math.floor(have / (b.quantity || 1)) * (b.quantity || 1);
    }

    // how many times coupon can apply
    const possibleReps = Math.floor(totalBuyUnits / (buyProducts.reduce((s,p)=>s + (p.quantity||0),0) || 1));
    const reps = Math.min(possibleReps, repetitionLimit);

    if (reps <= 0) {
      return { couponId: coupon.id, discountAmount: 0 };
    }

    // free units allowed:
    let freeUnitsAllowed = reps * getProducts.reduce((s,g)=>s + (g.quantity||0),0);

    let totalDiscount = 0;
    const used: any[] = [];

    // pick free items from cart that match getProducts
    for (const g of getProducts) {
      if (freeUnitsAllowed <= 0) break;
      const have = qtyMap.get(g.productId) ?? 0;
      const take = Math.min(have, freeUnitsAllowed, g.quantity * reps);
      if (take > 0) {
        // find price for that product
        const item = items.find(it => it.productId === g.productId);
        if (item) {
          totalDiscount += take * item.price;
          used.push({ productId: g.productId, freeCount: take, unitPrice: item.price });
          freeUnitsAllowed -= take;
        }
      }
    }

    return { couponId: coupon.id, discountAmount: Number(totalDiscount.toFixed(2)), breakdown: used };
  }
}

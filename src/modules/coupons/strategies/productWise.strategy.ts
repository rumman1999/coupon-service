import { ICouponStrategy, CartDTO, CouponCalculationResult } from './base.strategy';
import { CouponModel } from '../models/coupon.model';

export class ProductWiseStrategy implements ICouponStrategy {
  async calculate(cart: CartDTO, coupon: CouponModel): Promise<CouponCalculationResult> {
    const items = cart.items || [];
    const { productId, discount } = coupon.details || {};
    if (!productId || typeof discount !== 'number') {
      return { couponId: coupon.id, discountAmount: 0 };
    }
    let totalDiscount = 0;
    const breakdown: any[] = [];
    for (const it of items) {
      if (it.productId === productId) {
        const d = (discount / 100) * it.price * it.quantity;
        totalDiscount += d;
        breakdown.push({ productId: it.productId, discount: Number(d.toFixed(2)) });
      }
    }
    return { couponId: coupon.id, discountAmount: Number(totalDiscount.toFixed(2)), breakdown };
  }
}

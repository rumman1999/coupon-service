import { ICouponStrategy, CartDTO, CouponCalculationResult } from './base.strategy';
import { CouponModel } from '../models/coupon.model';

export class CartWiseStrategy implements ICouponStrategy {
  async calculate(cart: CartDTO, coupon: CouponModel): Promise<CouponCalculationResult> {
    const items = cart.items || [];
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const { threshold, discount } = coupon.details || {};
    if (typeof threshold !== 'number' || typeof discount !== 'number') {
      return { couponId: coupon.id, discountAmount: 0 };
    }
    if (total < threshold) {
      return { couponId: coupon.id, discountAmount: 0 };
    }
    const amount = (discount / 100) * total;
    return { couponId: coupon.id, discountAmount: Number(amount.toFixed(2)), breakdown: { total } };
  }
}

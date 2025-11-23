import redis from '../../../infrastructure/redis/redisClient';
import { CouponRepository } from '../repository/coupon.repository';
import { getStrategy } from '../strategies/strategyFactory';
import { CouponModel } from '../models/coupon.model';
import { CartDTO } from '../strategies/base.strategy';

const COUPON_CACHE_KEY = (id: string) => `coupon:${id}`;
const ACTIVE_COUPONS_KEY = 'coupons:active';

export class CouponService {
  private repo = new CouponRepository();

  async createCoupon(data: Partial<CouponModel>) {
    const c = await this.repo.create(data);
    await redis.del(ACTIVE_COUPONS_KEY); // invalidate list cache
    await redis.set(COUPON_CACHE_KEY(c.id), JSON.stringify(c));
    return c;
  }

  async getCoupon(id: string) {
    const cached = await redis.get(COUPON_CACHE_KEY(id));
    if (cached) return JSON.parse(cached) as CouponModel;
    const c = await this.repo.findById(id);
    if (c) await redis.set(COUPON_CACHE_KEY(c.id), JSON.stringify(c));
    return c;
  }

  async listActiveCoupons() {
    const cached = await redis.get(ACTIVE_COUPONS_KEY);
    if (cached) return JSON.parse(cached) as CouponModel[];
    const rs = await this.repo.findAllActive();
    await redis.set(ACTIVE_COUPONS_KEY, JSON.stringify(rs), 'EX', 60);
    return rs;
  }

  async applicableCoupons(cart: CartDTO) {
    const coupons = await this.listActiveCoupons();
    // Evaluate concurrently with basic concurrency control if desired
    const results = await Promise.all(coupons.map(async (c) => {
      const strategy = getStrategy(c.type);
      return strategy.calculate(cart, c);
    }));
    // return only those with discount > 0
    return results.filter(r => r.discountAmount > 0);
  }

  async applyCouponToCart(couponId: string, cart: CartDTO) {
    const coupon = await this.getCoupon(couponId);
    if (!coupon) throw new Error('Coupon not found');
    const strategy = getStrategy(coupon.type);
    const result = await strategy.calculate(cart, coupon);
    // Optionally, persist usage / emit event. For now, return result.
    return result;
  }
}

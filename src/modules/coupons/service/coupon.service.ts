import redis from "../../../infrastructure/redis/redisClient";
import { CouponRepository } from "../repository/coupon.repository";
import { getStrategy } from "../strategies/strategyFactory";
import { CouponModel } from "../models/coupon.model";
import { CartDTO } from "../strategies/base.strategy";
import ApiError from "../../../common/errors/ApiError";

const COUPON_CACHE_KEY = (id: string) => `coupon:${id}`;
const ACTIVE_COUPONS_KEY = "coupons:active";

export class CouponService {
  private repo = new CouponRepository();

  async createCoupon(data: Partial<CouponModel>) {
    const c = await this.repo.create(data);
    await redis.del(ACTIVE_COUPONS_KEY);
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
    await redis.set(ACTIVE_COUPONS_KEY, JSON.stringify(rs), "EX", 60);
    return rs;
  }

  async deleteCoupons(id: string) {
    const deleteCoupons = await this.repo.delete(id);
    if (!deleteCoupons) {
      return {
        success: false,
        message: "Did not found the Coupon with the id",
        id: id,
      };
    }
    const result = {
      success: true,
      message: "Deleted successfully",
      deleteCoupons,
    };
    return result;
  }

  // async applicableCoupons(cart: CartDTO) {
  //   const coupons = await this.listActiveCoupons();
  //   // Evaluate concurrently with basic concurrency control if desired
  //   const results = await Promise.all(
  //     coupons.map(async (c) => {
  //       const strategy = getStrategy(c.type);
  //       return strategy.calculate(cart, c);
  //     })
  //   );
  //   // return only those with discount > 0
  //   return results.filter((r) => r.discountAmount > 0);
  // }

  // normalize cart into map + compute total
  private normalizeCart(cart: any) {
    const map = new Map<string, { quantity: number; price: number }>();
    for (const it of cart.items || []) {
      map.set(it.productId, { quantity: it.quantity, price: it.price });
    }
    return map;
  }

  private computeTotal(
    itemsMap: Map<string, { quantity: number; price: number }>
  ) {
    let total = 0;
    for (const [, v] of itemsMap.entries()) {
      total += v.price * v.quantity;
    }
    return total;
  }

  // Quick eligibility checks before heavy strategy run
  private preconditionPasses(
    coupon: any,
    cartTotal: number,
    itemsMap: Map<string, any>
  ): boolean {
    if (!coupon.isActive) return false;

    const now = new Date();
    if (coupon.startAt && new Date(coupon.startAt) > now) return false;
    if (coupon.endAt && new Date(coupon.endAt) <= now) return false;

    /**
     * Cheap rules based on type:
     * - cart-wise: skip if total < threshold
     * - product-wise: skip if productId not in cart
     * - bxgy: skip if missing any of required buy products
     */
    if (coupon.type === "cart-wise") {
      if (cartTotal < (coupon.details.threshold || 0)) return false;
    }

    if (coupon.type === "product-wise") {
      if (!itemsMap.has(coupon.details.productId)) return false;
    }

    if (coupon.type === "bxgy") {
      const buy = coupon.details.buyProducts ?? [];
      let totalBuyItems = 0;
      for (const b of buy) {
        const it = itemsMap.get(b.productId);
        if (it) totalBuyItems += Math.floor(it.quantity / b.quantity);
      }
      if (totalBuyItems <= 0) return false;
    }

    return true;
  }

  // Picks best coupon or returns full list (for now return full list)
  private applyStackingPolicy(applicable: any[]) {
    if (!applicable.length) return [];

    // Exclusive policy check
    const exclusive = applicable.find((c) => c.policy === "exclusive");
    if (exclusive) return [exclusive];

    // Best only policy
    if (applicable.some((c) => c.policy === "bestOnly")) {
      const best = applicable.reduce((max, c) =>
        c.discountAmount > max.discountAmount ? c : max
      );
      return [best];
    }

    // Default: return all combinable coupons
    return applicable;
  }

  // Strategy wrapper
  private async evaluateWithStrategy(coupon: any, cart: any) {
    const strategy = getStrategy(coupon.type);
    return strategy.calculate(cart, coupon);
  }

  // ---------------------- MAIN FUNCTION 1 ----------------------
  async applicableCoupons(cart: any) {
    const itemsMap = this.normalizeCart(cart);
    const cartTotal = this.computeTotal(itemsMap);

    const coupons = await this.repo.findAllActive();

    const quickFiltered = coupons.filter((c) =>
      this.preconditionPasses(c, cartTotal, itemsMap)
    );

    const results = await Promise.all(
      quickFiltered.map((c) => this.evaluateWithStrategy(c, cart))
    );

    const applicable = results.filter((r) => r.discountAmount > 0);

    return this.applyStackingPolicy(applicable);
  }

  // Ensure valid & in-window coupon
  private ensureActiveAndInWindow(coupon: any) {
    if (!coupon) throw new ApiError(404, "Coupon not found");
    if (!coupon.isActive) throw new ApiError(400, "Coupon is inactive");

    const now = new Date();
    if (coupon.startAt && new Date(coupon.startAt) > now)
      throw new ApiError(400, "Coupon not yet started");
    if (coupon.endAt && new Date(coupon.endAt) <= now)
      throw new ApiError(400, "Coupon expired");
  }

  // ---------------------- MAIN FUNCTION 2 ----------------------
  async applyCoupon(
    couponId: string,
    cart: any,
    userId?: string,
    requestId?: string
  ) {
    const coupon = await this.repo.findById(couponId);
    if (!coupon) {
      return null;
    }
    this.ensureActiveAndInWindow(coupon);

    const strategy = getStrategy(coupon.type);
    const result = await strategy.calculate(cart, coupon);

    // temporarily no redis locks or async queue
    if (coupon.details?.hasLimitedUses) {
      // naive approach (no concurrency safety yet)
      const remaining = await this.repo.getRemainingUses(coupon.id);
      const needed = 1; // or based on rule
      if (remaining < needed)
        throw new ApiError(400, "Coupon usage limit reached");

      await this.repo.decrementUses(coupon.id, needed);
      await this.repo.recordUsage({
        couponId: couponId,
        userId: userId || null,
        requestId: requestId || null,
        discount: result.discountAmount,
        cartSnapshot: cart,
      });
    } else {
      // async usage logging bypassed
      console.log(`Coupon ${couponId} applied — logging deferred`);
    }

    return result;
  }

  async applyCouponToCart(couponId: string, cart: CartDTO) {
    const coupon = await this.getCoupon(couponId);
    if (!coupon) throw new Error("Coupon not found");
    const strategy = getStrategy(coupon.type);
    const result = await strategy.calculate(cart, coupon);
    // Optionally, persist usage / emit event. For now, return result.
    return result;
  }
}

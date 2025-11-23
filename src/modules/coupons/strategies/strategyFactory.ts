import { CartWiseStrategy } from './cartWise.strategy';
import { ProductWiseStrategy } from './productWise.strategy';
import { BxGyStrategy } from './bxgy.strategy';
import { ICouponStrategy } from './base.strategy';

const registry = new Map<string, ICouponStrategy>();

export function registerDefaultStrategies() {
  registry.set('cart-wise', new CartWiseStrategy());
  registry.set('product-wise', new ProductWiseStrategy());
  registry.set('bxgy', new BxGyStrategy());
}

export function getStrategy(type: string): ICouponStrategy {
  const s = registry.get(type);
  if (!s) throw new Error(`No strategy registered for ${type}`);
  return s;
}

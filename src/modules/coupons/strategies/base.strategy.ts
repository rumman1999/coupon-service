import { CouponModel } from '../models/coupon.model';

export type CartItem = { productId: string; quantity: number; price: number };
export type CartDTO = { items: CartItem[] };

export type CouponCalculationResult = {
  couponId: string;
  discountAmount: number;
  breakdown?: any;
  updatedCart?: CartDTO;
};

export interface ICouponStrategy {
  calculate(cart: CartDTO, coupon: CouponModel): Promise<CouponCalculationResult>;
}

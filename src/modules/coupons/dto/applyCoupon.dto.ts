import { z } from 'zod';

export const CartItem = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative()
});

export const ApplyCouponSchema = z.object({
  cart: z.object({
    items: z.array(CartItem)
  })
});

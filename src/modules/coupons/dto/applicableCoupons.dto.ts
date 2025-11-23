import { z } from 'zod';
export const ApplicableCouponsSchema = z.object({
  cart: z.object({
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative()
    }))
  })
});

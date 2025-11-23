import { z } from 'zod';

export const CartWiseDetails = z.object({
  threshold: z.number().nonnegative(),
  discount: z.number().nonnegative()
});

export const ProductWiseDetails = z.object({
  productId: z.string(),
  discount: z.number().nonnegative()
});

export const BxGyDetails = z.object({
  buyProducts: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })),
  getProducts: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })),
  repetitionLimit: z.number().int().nonnegative().optional()
});

export const CreateCouponSchema = z.object({
  type: z.enum(['cart-wise', 'product-wise', 'bxgy']),
  title: z.string().optional(),
  details: z.any(), // validated further by service/strategy
  expiresAt: z.string().optional()
});

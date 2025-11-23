import { z } from "zod";

export const CreateCouponSchema = z.object({
  type: z.enum(["cart-wise", "product-wise", "bxgy"], {
    required_error: "Coupon type is required",
  }),
  title: z.string({
    required_error: "Title is required",
  }).min(3, "Title must be at least 3 characters"),
  details: z.object({
    threshold: z.number().optional(),
    discount: z.number().optional(),
    productId: z.string().optional(),
    buyProducts: z.array(
      z.object({
        productId: z.string({ required_error: "Buy productId is required" }),
        quantity: z.number({ required_error: "Buy quantity is required" }).min(1),
      })
    ).optional(),
    getProducts: z.array(
      z.object({
        productId: z.string({ required_error: "Get productId is required" }),
        quantity: z.number({ required_error: "Get quantity is required" }).min(1),
      })
    ).optional(),
    repetitionLimit: z.number().optional()
  })
})
.superRefine((data, ctx) => {

  if (data.type === "cart-wise") {
    if (!data.details.threshold) {
      ctx.addIssue({
        code: "custom",
        message: "Cart-wise coupon requires threshold"
      });
    }

    if (!data.details.discount) {
      ctx.addIssue({
        code: "custom",
        message: "Cart-wise coupon requires discount"
      });
    }
  }

  if (data.type === "product-wise") {
    if (!data.details.productId) {
      ctx.addIssue({
        code: "custom",
        message: "Product-wise coupon requires productId"
      });
    }

    if (!data.details.discount) {
      ctx.addIssue({
        code: "custom",
        message: "Product-wise coupon requires discount"
      });
    }
  }

  if (data.type === "bxgy") {
    if (!data.details.buyProducts?.length) {
      ctx.addIssue({
        code: "custom",
        message: "BxGy requires buyProducts"
      });
    }
    if (!data.details.getProducts?.length) {
      ctx.addIssue({
        code: "custom",
        message: "BxGy requires getProducts"
      });
    }
  }
});

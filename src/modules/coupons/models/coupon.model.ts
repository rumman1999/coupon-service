// Typed model for internal use, maps to Prisma shape
export type CouponModel = {
  id: string;
  type: string;
  title?: string;
  details: any; // type per coupon
  isActive: boolean;
  expiresAt?: string | null;
};

export type CouponModel = {
  id: string;
  type: string;
  title?: string | null;
  details: Record<string, any>;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  preview: boolean;
  metadata?: Record<string, any> | null;
  version: number;

  createdAt: string;
  updatedAt: string;
};

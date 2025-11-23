import { ICouponRepository } from "./coupon.repository.interface";
import { prisma } from "../../../infrastructure/db/prismaClient";
import { CouponModel } from "../models/coupon.model";

export class CouponRepository implements ICouponRepository {
  async create(data: Partial<CouponModel>): Promise<CouponModel> {
    const r = await prisma.coupon.create({ data: { ...data } });
    return r as unknown as CouponModel;
  }
  async findById(id: string): Promise<CouponModel | null> {
    const r = await prisma.coupon.findUnique({ where: { id } });
    return r as unknown as CouponModel | null;
  }
  async findAllActive(): Promise<CouponModel[]> {
    const now = new Date();
    const r = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
    return r as unknown as CouponModel[];
  }
  async update(id: string, data: Partial<CouponModel>): Promise<CouponModel> {
    const r = await prisma.coupon.update({ where: { id }, data });
    return r as unknown as CouponModel;
  }
  async delete(id: string): Promise<CouponModel | null> {
    const r = await prisma.coupon.findUnique({ where: { id } });
    if (!r) return null;

    await prisma.coupon.delete({ where: { id } });
    return r;
  }

  async getRemainingUses(couponId: string): Promise<number> {
    const result = await prisma.couponUsageCounter.findUnique({
      where: { couponId },
    });
    return result?.remainingUses ?? Infinity; // default unlimited
  }

  async decrementUses(couponId: string, amount: number) {
    return prisma.couponUsageCounter.update({
      where: { couponId },
      data: { remainingUses: { decrement: amount } },
    });
  }

  async recordUsage(payload: {
    couponId: string;
    userId?: string | null;
    requestId?: string | null;
    discount: number;
    cartSnapshot: any;
  }) {
    return prisma.couponUsage.create({
      data: {
        couponId: payload.couponId,
        userId: payload.userId,
        requestId: payload.requestId,
        discount: payload.discount,
        cart: payload.cartSnapshot,
      },
    });
  }
}

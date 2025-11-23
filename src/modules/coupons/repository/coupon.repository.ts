import { ICouponRepository } from './coupon.repository.interface';
import { prisma } from '../../../infrastructure/db/prismaClient';
import { CouponModel } from '../models/coupon.model';

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
      where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }
    });
    return r as unknown as CouponModel[];
  }
  async update(id: string, data: Partial<CouponModel>): Promise<CouponModel> {
    const r = await prisma.coupon.update({ where: { id }, data });
    return r as unknown as CouponModel;
  }
  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({ where: { id } });
  }
}

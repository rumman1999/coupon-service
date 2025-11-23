import { CouponModel } from '../models/coupon.model';

export interface ICouponRepository {
  create(data: Partial<CouponModel>): Promise<CouponModel>;
  findById(id: string): Promise<CouponModel | null>;
  findAllActive(): Promise<CouponModel[]>;
  update(id: string, data: Partial<CouponModel>): Promise<CouponModel>;
  delete(id: string): Promise<CouponModel|null>;
}

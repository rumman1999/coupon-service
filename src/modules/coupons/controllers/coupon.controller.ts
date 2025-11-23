import { Request, Response, NextFunction } from "express";
import { CouponService } from "../service/coupon.service";
import { CreateCouponSchema } from "../dto/createCoupon.dto";
import { validateBody } from "../../../common/middlewares/validationMiddleware";
import { getStrategy } from "../strategies/strategyFactory";
import { applyStackingPolicy, computeTotal, loadActiveCoupons, normalizeCart, preconditionPasses, promiseAllLimit } from "../utils";

// Note: in routes we use validation middleware; controller expects parsed body

const service = new CouponService();

export class CouponController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      // optionally further validate details against strategy-specific schema
      const c = await service.createCoupon(body);
      res.status(201).json(c);
    } catch (err) {
      next(err);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const cs = await service.listActiveCoupons();
      res.json(cs);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const c = await service.getCoupon(id);
      if (!c)
        return res.status(404).json({ message: "Coupon Not found", id: id });
      res.json(c);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await service.deleteCoupons(id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async applicable(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = req.body.cart;
      const results = await service.applicableCoupons(cart);
      res.json({ applicableCoupons: results });
    } catch (err) {
      next(err);
    }
  }

  

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const couponId = req.params.id;
      const cart = req.body.cart;
      const result = await service.applyCouponToCart(couponId, cart);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  }
}

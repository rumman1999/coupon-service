import { Router } from 'express';
import { CouponController } from './controllers/coupon.controller';
import { CreateCouponSchema } from './dto/createCoupon.dto';
import { ApplyCouponSchema } from './dto/applyCoupon.dto';
import { ApplicableCouponsSchema } from './dto/applicableCoupons.dto';
import { validateBody } from '../../common/middlewares/validationMiddleware';
import { registerDefaultStrategies } from './strategies/strategyFactory';

registerDefaultStrategies();

const router = Router();
const controller = new CouponController();

router.post('/', validateBody(CreateCouponSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.get(req, res, next));
router.post('/applicable', validateBody(ApplicableCouponsSchema), (req, res, next) => controller.applicable(req, res, next));
router.post('/apply/:id', validateBody(ApplyCouponSchema), (req, res, next) => controller.apply(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));


export default router;

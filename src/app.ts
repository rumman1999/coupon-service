import express from 'express';
import bodyParser from 'body-parser';
import { config } from './config/env';
import couponRoutes from './modules/coupons/routes';
import { errorMiddleware } from './common/middlewares/errorMiddleware';

export function createApp() {
  const app = express();
  app.use(bodyParser.json());

  // health
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/v1/coupons', couponRoutes);

  // global error handler
  app.use(errorMiddleware);

  return app;
}

import express from "express";
import bodyParser from "body-parser";
import { config } from "./config/env";
import couponRoutes from "./modules/coupons/routes";
import { errorMiddleware } from "./common/middlewares/errorMiddleware";
import { ApiError } from "./common/errors/ApiError";

export function createApp() {
  const app = express();
  app.use(bodyParser.json());

  // health
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/v1/coupons", couponRoutes);

  app.all("*", (req, _res, next) => {
    return next(new ApiError(404, `Route ${req.originalUrl} not found`));
  });

  // global error handler
  app.use(errorMiddleware);

  return app;
}

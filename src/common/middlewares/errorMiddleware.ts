import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError";

export const errorMiddleware = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.details || [],
    statusCode: err.statusCode || 500,
  });
};

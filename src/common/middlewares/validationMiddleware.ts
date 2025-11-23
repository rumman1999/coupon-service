import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError";

export const validateBody =
  (schema: ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (err: any) {
      if (err.errors) {
        const formatted = err.errors.map((e: any) => e.message);
        return next(ApiError.BadRequest("Validation Failed", formatted));
      }
      return next(ApiError.Internal("Unexpected validation error"));
    }
  };

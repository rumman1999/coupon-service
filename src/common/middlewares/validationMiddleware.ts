import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../errors/ApiError';

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (e) {
      if (e instanceof ZodError) {
        throw new ApiError(400, 'Invalid request', e.errors);
      }
      next(e);
    }
  };
}

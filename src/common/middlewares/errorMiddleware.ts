import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: { message: 'Internal Server Error' } });
}

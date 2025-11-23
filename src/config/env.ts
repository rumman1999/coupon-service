import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/couponsdb',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  cacheTtl: Number(process.env.CACHE_TTL ?? 120)
};

import { createApp } from './app';
import { config } from './config/env';
import { prisma } from './infrastructure/db/prismaClient';
import redis from './infrastructure/redis/redisClient';

const app = createApp();

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${config.port}`);
});

// graceful shutdown
const shutdown = async () => {
  // eslint-disable-next-line no-console
  console.log('Shutting down...');
  await prisma.$disconnect();
  await redis.quit();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

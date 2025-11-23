import Redis from 'ioredis';
import { config } from '../../config/env';

const redis = new Redis(config.redisUrl);

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis error', err);
});

export default redis;

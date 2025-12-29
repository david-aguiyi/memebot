import Redis from 'ioredis';
import logger from './logger';
import env from './env';

const redis = new Redis(env.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error', error);
});

redis.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});

export default redis;


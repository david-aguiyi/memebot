import Redis from 'ioredis';
import logger from './logger';
import env from './env';

const redis = new Redis(env.REDIS_URL, {
  retryStrategy: times => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
  // Graceful shutdown: ensure Redis is closed in tests and on process exit
  async function shutdownRedis() {
    try {
      if (redis) {
        // Prefer quit for a clean shutdown; fallback to disconnect
        if (typeof (redis as any).quit === 'function') {
          await (redis as any).quit();
        } else {
          (redis as any).disconnect();
        }
      }
    } catch (e) {
      // swallow errors during shutdown
    }
  }

  if (process.env.NODE_ENV === 'test') {
    // Ensure tests don't hang on Redis connections
    process.on('beforeExit', () => {
      shutdownRedis();
    });
    process.on('exit', () => {
      shutdownRedis();
    });
  } else {
    process.on('SIGINT', async () => {
      await shutdownRedis();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await shutdownRedis();
      process.exit(0);
    });
  process.on('exit', () => {
    shutdownRedis();
  });
} else {
  process.on('SIGINT', async () => {
    await shutdownRedis();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await shutdownRedis();
    process.exit(0);
  });
}
>>>>>>> Stashed changes

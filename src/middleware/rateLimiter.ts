import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import logger from '../config/logger';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
}

export const rateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => `${req.ip}:${req.path}`,
    skipSuccessfulRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${keyGenerator(req)}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old entries
      await redis.zremrangebyscore(key, 0, windowStart);

      // Count current requests in window
      const count = await redis.zcard(key);

      if (count >= maxRequests) {
        logger.warn('Rate limit exceeded', { key, count, maxRequests });
        return res.status(429).json({
          success: false,
          error: {
            message: 'Too many requests, please try again later',
            statusCode: 429,
            retryAfter: Math.ceil(windowMs / 1000),
          },
        });
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));

      // Store remaining requests in response header
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      // Track successful requests if needed
      if (skipSuccessfulRequests) {
        const originalSend = res.send;
        res.send = function (body) {
          if (res.statusCode < 400) {
            // Remove this request from count on success
            redis.zrem(key, `${now}-*`);
          }
          return originalSend.call(this, body);
        };
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', error);
      // On error, allow request (fail open)
      next();
    }
  };
};



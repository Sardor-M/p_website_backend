import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly rateLimit: RateLimiterMemory;

  constructor() {
    this.rateLimit = new RateLimiterMemory({
      points: 10, // num of points
      duration: 50, // per seconds
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // we use the ip as a key
      const key = req.ip || '0.0.0.0';

      await this.rateLimit.consume(key);
      next();
    } catch (rateLimiterRes) {
      const timeLeft = Math.ceil(rateLimiterRes.msBeforeNext / 1000) || 1;
      res.setHeader('Retry-After', timeLeft.toString());
      res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        retryAfter: timeLeft,
      });
    }
  }
}

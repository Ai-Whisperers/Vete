import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per minute
});

export const rateLimit = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await rateLimiter.consume(req.ip);
  } catch (error) {
    if (error.msBeforeNext) {
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: error.msBeforeNext / 1000,
      });
      return;
    }
    throw error;
  }
};

export const withRateLimiting = (handler: (req: NextApiRequest, res: NextApiResponse) => void) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await rateLimit(req, res);
    if (res.headersSent) return;
    return handler(req, res);
  };
};
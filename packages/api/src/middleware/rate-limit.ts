/**
 * Simple in-memory rate limiter
 * For production, use Redis-backed rate limiting (e.g., upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export function rateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowMs;
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt,
    });
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      reset: new Date(resetAt),
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      reset: new Date(entry.resetAt),
    };
  }

  entry.count++;
  return {
    allowed: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - entry.count,
    reset: new Date(entry.resetAt),
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toISOString(),
  };
}

export const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
  public: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
} as const;

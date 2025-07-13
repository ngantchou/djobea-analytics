import type { NextRequest } from "next/server"
import { RateLimitError } from "./error-handler"
import { logger } from "./logger"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }

  private getKey(request: NextRequest, keyGenerator?: (req: NextRequest) => string): string {
    if (keyGenerator) {
      return keyGenerator(request)
    }

    // Default: use IP address
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
    return `ip:${ip}`
  }

  async checkLimit(request: NextRequest, config: RateLimitConfig): Promise<void> {
    const key = this.getKey(request, config.keyGenerator)
    const now = Date.now()
    const windowStart = now - config.windowMs

    let entry = this.store.get(key)

    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      }
      this.store.set(key, entry)
      return
    }

    if (entry.count >= config.maxRequests) {
      logger.logSecurityEvent("Rate limit exceeded", {
        key,
        count: entry.count,
        limit: config.maxRequests,
        windowMs: config.windowMs,
      })

      throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds`)
    }

    entry.count++
  }

  getRemainingRequests(request: NextRequest, config: RateLimitConfig): number {
    const key = this.getKey(request, config.keyGenerator)
    const entry = this.store.get(key)

    if (!entry || entry.resetTime <= Date.now()) {
      return config.maxRequests
    }

    return Math.max(0, config.maxRequests - entry.count)
  }

  getResetTime(request: NextRequest, config: RateLimitConfig): number {
    const key = this.getKey(request, config.keyGenerator)
    const entry = this.store.get(key)

    if (!entry || entry.resetTime <= Date.now()) {
      return Date.now() + config.windowMs
    }

    return entry.resetTime
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

export const rateLimiter = new RateLimiter()

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },

  // Search endpoints
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },

  // Export endpoints
  export: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  },
}

// Middleware helper
export function withRateLimit(config: RateLimitConfig) {
  return (handler: (request: NextRequest) => Promise<Response>) => async (request: NextRequest) => {
    try {
      await rateLimiter.checkLimit(request, config)

      const response = await handler(request)

      // Add rate limit headers
      const remaining = rateLimiter.getRemainingRequests(request, config)
      const resetTime = rateLimiter.getResetTime(request, config)

      response.headers.set("X-RateLimit-Limit", config.maxRequests.toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      response.headers.set("X-RateLimit-Reset", Math.ceil(resetTime / 1000).toString())

      return response
    } catch (error) {
      if (error instanceof RateLimitError) {
        const resetTime = rateLimiter.getResetTime(request, config)

        return new Response(
          JSON.stringify({
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            message: error.message,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
              "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
            },
          },
        )
      }
      throw error
    }
  }
}

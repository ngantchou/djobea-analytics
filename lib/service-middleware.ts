"use client"

import { logger } from "@/lib/logger"
import { AuthService } from "@/lib/auth"
import type { ApiResponse, ApiRequestOptions, ApiError } from "@/lib/api-client"

// Service Configuration
export const SERVICE_CONFIG = {
  // Environment-based base URLs
  baseUrls: {
    development: "",
    staging: "",
    production: "https://api.yourapp.com"
  },
  
  // Get current environment
  get currentBaseUrl() {
    const env = process.env.NODE_ENV || 'development'
    // Override with custom URL if provided
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }
    return this.baseUrls[env as keyof typeof this.baseUrls] || this.baseUrls.development
  },

  // Default settings
  defaults: {
    timeout: 30000,
    retries: 2,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }
}

// Service Request Options
export interface ServiceRequestOptions extends Omit<ApiRequestOptions, 'method'> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  useCache?: boolean
  cacheKey?: string
  cacheTTL?: number
}

// Service Error with enhanced context
export interface ServiceError extends ApiError {
  service?: string
  operation?: string
  context?: any
}

// Middleware function type
export type ServiceMiddleware = (
  options: ServiceRequestOptions,
  next: (options: ServiceRequestOptions) => Promise<ApiResponse>
) => Promise<ApiResponse>

// Base Service Class with Middleware Support
export abstract class BaseService {
  protected serviceName: string
  protected baseUrl: string
  private middlewares: ServiceMiddleware[] = []
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  constructor(serviceName: string) {
    this.serviceName = serviceName
    this.baseUrl = SERVICE_CONFIG.currentBaseUrl
    
    // Add default middlewares
    this.use(loggingMiddleware)
    this.use(authMiddleware)
    this.use(errorHandlingMiddleware)
    this.use(retryMiddleware)
    this.use(cacheMiddleware)
  }

  // Add middleware
  use(middleware: ServiceMiddleware): this {
    this.middlewares.push(middleware)
    return this
  }

  // Build full URL
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = endpoint.startsWith('http') 
      ? new URL(endpoint)
      : new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  // Execute request through middleware chain
  protected async request<T>(options: ServiceRequestOptions): Promise<ApiResponse<T>> {
    const executeChain = async (
      middlewareIndex: number,
      currentOptions: ServiceRequestOptions
    ): Promise<ApiResponse<T>> => {
      if (middlewareIndex >= this.middlewares.length) {
        // Execute the actual request
        return this.executeRequest<T>(currentOptions)
      }

      const middleware = this.middlewares[middlewareIndex]
      return middleware(currentOptions, (nextOptions) =>
        executeChain(middlewareIndex + 1, nextOptions)
      )
    }

    return executeChain(0, options)
  }

  // Execute the actual HTTP request
  private async executeRequest<T>(options: ServiceRequestOptions): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      endpoint,
      headers = {},
      body,
      params,
      timeout = SERVICE_CONFIG.defaults.timeout,
      cache = "default",
      signal
    } = options

    const url = this.buildUrl(endpoint, params)

    const config: RequestInit = {
      method,
      headers: {
        ...SERVICE_CONFIG.defaults.headers,
        ...headers,
      },
      cache,
      signal
    }

    if (body && method !== "GET") {
      if (body instanceof FormData) {
        delete (config.headers as any)['Content-Type']
      } else {
        config.body = JSON.stringify(body)
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: signal ? this.combineSignals([controller.signal, signal]) : controller.signal,
      })

      clearTimeout(timeoutId)

      let data
      const contentType = response.headers.get("content-type")

      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else if (contentType?.includes("text/")) {
        data = await response.text()
      } else {
        data = await response.blob()
      }

      if (!response.ok) {
        throw this.createServiceError(response, data)
      }

      return this.normalizeResponse<T>(data)
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        break
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
    
    return controller.signal
  }

  private createServiceError(response: Response, data?: any): ServiceError {
    const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`) as ServiceError
    error.status = response.status
    error.code = data?.code || response.status.toString()
    error.details = data?.details
    error.timestamp = new Date().toISOString()
    error.service = this.serviceName
    return error
  }

  private normalizeResponse<T>(data: any): ApiResponse<T> {
    if (data && typeof data === "object" && data.hasOwnProperty("success")) {
      return data
    }

    return {
      success: true,
      data: data,
    }
  }

  // Cache management
  protected setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  protected getCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  protected clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

// Default Middlewares

// Logging Middleware
export const loggingMiddleware: ServiceMiddleware = async (options, next) => {
  const startTime = Date.now()
  const { endpoint, method = "GET" } = options

  logger.info(`[${method}] ${endpoint} - Request started`)

  try {
    const result = await next(options)
    const duration = Date.now() - startTime
    
    logger.info(`[${method}] ${endpoint} - Success (${duration}ms)`)
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error(`[${method}] ${endpoint} - Error (${duration}ms)`, {
      error: error instanceof Error ? error.message : String(error),
      duration
    })
    
    throw error
  }
}

// Authentication Middleware
export const authMiddleware: ServiceMiddleware = async (options, next) => {
  const { requireAuth = true } = options

  if (requireAuth) {
    const token = AuthService.getStoredToken()
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      }
    } else {
      const error = new Error("Authentication required but no token available") as ServiceError
      error.code = "AUTH_TOKEN_MISSING"
      error.status = 401
      throw error
    }
  }

  try {
    return await next(options)
  } catch (error: any) {
    // Handle 401 errors with token refresh
    if (error.status === 401 && requireAuth) {
      try {
        const refreshed = await AuthService.refreshToken()
        if (refreshed) {
          const newToken = AuthService.getStoredToken()
          if (newToken) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            }
            return await next(options)
          }
        } else {
          AuthService.logout()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }
      } catch (refreshError) {
        logger.error("Failed to refresh token", refreshError)
      }
    }
    
    throw error
  }
}

// Error Handling Middleware
export const errorHandlingMiddleware: ServiceMiddleware = async (options, next) => {
  try {
    return await next(options)
  } catch (error: any) {
    // Enhance error with service context
    if (error && typeof error === 'object') {
      error.service = error.service || 'unknown'
      error.operation = `${options.method || 'GET'} ${options.endpoint}`
      error.timestamp = error.timestamp || new Date().toISOString()
    }

    // Log error details
    logger.error("Service request failed", {
      service: error.service,
      operation: error.operation,
      status: error.status,
      message: error.message,
      details: error.details
    })

    throw error
  }
}

// Retry Middleware
export const retryMiddleware: ServiceMiddleware = async (options, next) => {
  const maxRetries = options.retries || SERVICE_CONFIG.defaults.retries
  let attempt = 0

  const shouldRetry = (error: any): boolean => {
    if (attempt >= maxRetries) return false
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true
    }
    
    // Server errors and specific status codes
    if (error.status) {
      return error.status >= 500 || error.status === 408 || error.status === 429
    }
    
    return false
  }

  const delay = (ms: number): Promise<void> => 
    new Promise((resolve) => setTimeout(resolve, ms))

  while (attempt <= maxRetries) {
    try {
      return await next(options)
    } catch (error) {
      attempt++
      
      if (shouldRetry(error)) {
        const delayMs = Math.pow(2, attempt - 1) * 1000
        logger.warn(`Retrying request (attempt ${attempt}/${maxRetries + 1}) after ${delayMs}ms`, {
          endpoint: options.endpoint,
          error: error instanceof Error ? error.message : String(error)
        })
        await delay(delayMs)
        continue
      }
      
      throw error
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error("Max retries exceeded")
}

// Cache Middleware
export const cacheMiddleware: ServiceMiddleware = async (options, next) => {
  const { method = "GET", useCache = false, cacheKey, cacheTTL = 300000 } = options

  // Only cache GET requests
  if (method !== "GET" || !useCache) {
    return next(options)
  }

  const key = cacheKey || `${method}:${options.endpoint}:${JSON.stringify(options.params || {})}`
  
  // Check cache first
  const service = (next as any).__service as BaseService
  if (service) {
    const cached = service['getCache'](key)
    if (cached) {
      logger.info(`Cache hit for ${key}`)
      return cached
    }
  }

  // Execute request and cache result
  const result = await next(options)
  
  if (service && result.success) {
    service['setCache'](key, result, cacheTTL)
    logger.info(`Cached result for ${key}`)
  }

  return result
}

// Service Factory for creating type-safe services
export function createService<T extends BaseService>(ServiceClass: new (...args: any[]) => T): T {
  return new ServiceClass()
}

// Utility function to create custom middleware
export function createMiddleware(
  name: string,
  handler: (options: ServiceRequestOptions, next: (options: ServiceRequestOptions) => Promise<ApiResponse>) => Promise<ApiResponse>
): ServiceMiddleware {
  return async (options, next) => {
    logger.debug(`Executing middleware: ${name}`)
    return handler(options, next)
  }
}

export default BaseService
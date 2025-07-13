"use client"

import { logger } from "./logger"

export interface AppError extends Error {
  code?: string
  status?: number
  details?: any
  timestamp?: string
  userId?: string
}

export class ApiError extends Error implements AppError {
  code: string
  status: number
  details?: any
  timestamp: string
  userId?: string

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code || `API_ERROR_${status}`
    this.details = details
    this.timestamp = new Date().toISOString()

    try {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("current_user")
        this.userId = user ? JSON.parse(user).id : undefined
      }
    } catch {
      this.userId = undefined
    }
  }
}

export class ValidationError extends Error implements AppError {
  code: string
  details: any
  timestamp: string

  constructor(message: string, details?: any) {
    super(message)
    this.name = "ValidationError"
    this.code = "VALIDATION_ERROR"
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export class NetworkError extends Error implements AppError {
  code: string
  timestamp: string

  constructor(message = "Network connection failed") {
    super(message)
    this.name = "NetworkError"
    this.code = "NETWORK_ERROR"
    this.timestamp = new Date().toISOString()
  }
}

export class TimeoutError extends Error implements AppError {
  code: string
  timestamp: string

  constructor(message = "Request timeout") {
    super(message)
    this.name = "TimeoutError"
    this.code = "TIMEOUT_ERROR"
    this.timestamp = new Date().toISOString()
  }
}

export function handleError(error: unknown): AppError {
  logger.error("Error occurred", { error })

  if (error instanceof Error && "code" in error) {
    return error as AppError
  }

  if (error instanceof Error) {
    // Convert fetch errors to appropriate types
    if (error.message.includes("fetch")) {
      return new NetworkError(error.message)
    }

    if (error.message.includes("timeout")) {
      return new TimeoutError(error.message)
    }

    // Generic error
    const appError = error as AppError
    appError.code = "UNKNOWN_ERROR"
    appError.timestamp = new Date().toISOString()
    return appError
  }

  // Unknown error type
  const unknownError = new Error("An unknown error occurred") as AppError
  unknownError.code = "UNKNOWN_ERROR"
  unknownError.timestamp = new Date().toISOString()
  unknownError.details = error
  return unknownError
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return "Une erreur inattendue s'est produite"
}

export function getErrorCode(error: unknown): string {
  if (error instanceof Error && "code" in error) {
    return (error as AppError).code || "UNKNOWN_ERROR"
  }

  return "UNKNOWN_ERROR"
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500 || error.status === 408 || error.status === 429
  }

  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true
  }

  return false
}

// Error reporting utility
export function reportError(error: AppError, context?: any) {
  logger.error("Error reported", {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
      timestamp: error.timestamp,
      userId: error.userId,
    },
    context,
  })

  // In production, send to error tracking service
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    // Example: Sentry.captureException(error, { extra: context })
  }
}

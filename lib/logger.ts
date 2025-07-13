interface LogLevel {
  ERROR: 0
  WARN: 1
  INFO: 2
  DEBUG: 3
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

class Logger {
  private level: number

  constructor() {
    this.level = process.env.NODE_ENV === "development" ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
  }

  private log(level: keyof LogLevel, message: string, data?: any) {
    if (LOG_LEVELS[level] <= this.level) {
      const timestamp = new Date().toISOString()
      const logData = data ? { message, data, timestamp } : { message, timestamp }

      switch (level) {
        case "ERROR":
          console.error(`[${timestamp}] ERROR:`, message, data)
          break
        case "WARN":
          console.warn(`[${timestamp}] WARN:`, message, data)
          break
        case "INFO":
          console.info(`[${timestamp}] INFO:`, message, data)
          break
        case "DEBUG":
          console.debug(`[${timestamp}] DEBUG:`, message, data)
          break
      }
    }
  }

  error(message: string, data?: any) {
    this.log("ERROR", message, data)
  }

  warn(message: string, data?: any) {
    this.log("WARN", message, data)
  }

  info(message: string, data?: any) {
    this.log("INFO", message, data)
  }

  debug(message: string, data?: any) {
    this.log("DEBUG", message, data)
  }

  logUserAction(action: string, data?: any) {
    this.info(`User action: ${action}`, data)
  }

  // Add the missing logApiRequest method
  logApiRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    metadata?: any
  ) {
    const level = status >= 400 ? "ERROR" : status >= 300 ? "WARN" : "INFO"
    
    this.log(level, `API Request completed`, {
      method,
      url,
      status,
      duration: `${duration}ms`,
      ...metadata
    })
  }

  // Additional helper methods for API logging
  logApiError(method: string, url: string, error: any, metadata?: any) {
    this.error(`API Error: ${method} ${url}`, {
      error: error.message || error,
      stack: error.stack,
      ...metadata
    })
  }

  logApiSuccess(method: string, url: string, duration: number, metadata?: any) {
    this.info(`API Success: ${method} ${url}`, {
      duration: `${duration}ms`,
      ...metadata
    })
  }
}

export const logger = new Logger()
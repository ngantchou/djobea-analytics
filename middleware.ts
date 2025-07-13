import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export function middleware(request: NextRequest) {
  const startTime = Date.now()

  // Log incoming request
  logger.info("Incoming request", {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
    ip: request.ip || request.headers.get("x-forwarded-for"),
  })

  // Security headers
  const response = NextResponse.next()

  // CORS headers
  response.headers.set("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGINS || "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set("X-Request-ID", requestId)

  // Log response
  const duration = Date.now() - startTime
  logger.logApiRequest(request.method, request.url, response.status, duration, { requestId })

  return response
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
}

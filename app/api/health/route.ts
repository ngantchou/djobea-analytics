import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { logger } from "@/lib/logger"

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, any> = {}

  try {
    // Database health check
    try {
      const dbHealthy = await db.healthCheck()
      checks.database = {
        status: dbHealthy ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
      }
    } catch (error) {
      checks.database = {
        status: "unhealthy",
        error: "Connection failed",
        responseTime: Date.now() - startTime,
      }
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage()
    checks.memory = {
      status: memoryUsage.heapUsed < 500 * 1024 * 1024 ? "healthy" : "warning", // 500MB threshold
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    }

    // Environment checks
    checks.environment = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      uptime: Math.round(process.uptime()),
    }

    // Overall health status
    const allHealthy = Object.values(checks).every((check) => check.status === "healthy" || check.status === "warning")

    const overallStatus = allHealthy ? "healthy" : "unhealthy"
    const responseTime = Date.now() - startTime

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      checks,
    }

    logger.info("Health check performed", {
      status: overallStatus,
      responseTime,
      checks: Object.keys(checks),
    })

    return NextResponse.json(healthData, {
      status: overallStatus === "healthy" ? 200 : 503,
    })
  } catch (error) {
    logger.error("Health check failed", error as Error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: "Health check failed",
      },
      { status: 503 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "7d"

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate mock data based on period
  const baseData = {
    successRate: 89.2,
    responseTime: 14.5,
    totalRequests: 247,
    satisfaction: 4.8,
  }

  // Add some variation based on period
  const variation = Math.random() * 5 - 2.5 // -2.5 to +2.5

  const data = {
    successRate: Math.max(0, Math.min(100, baseData.successRate + variation)),
    responseTime: Math.max(1, baseData.responseTime + (Math.random() * 4 - 2)),
    totalRequests: Math.max(0, Math.floor(baseData.totalRequests + (Math.random() * 20 - 10))),
    satisfaction: Math.max(1, Math.min(5, baseData.satisfaction + (Math.random() * 0.4 - 0.2))),
    trends: {
      successRate: Math.random() * 6 - 1, // -1 to +5
      responseTime: Math.random() * 4 - 2, // -2 to +2
      totalRequests: Math.random() * 30 - 5, // -5 to +25
      satisfaction: Math.random() * 0.6 - 0.1, // -0.1 to +0.5
    },
  }

  return NextResponse.json(data)
}

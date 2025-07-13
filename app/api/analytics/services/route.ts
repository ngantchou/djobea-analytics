import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "7d"

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Generate data with some variation based on period
  const baseData = [45, 35, 15, 5]
  const variation = period === "24h" ? 0.1 : period === "1y" ? 0.3 : 0.2

  const data = baseData.map((value) => Math.max(1, Math.floor(value + (Math.random() - 0.5) * value * variation)))

  return NextResponse.json({
    labels: ["Plomberie", "Électricité", "Électroménager", "Maintenance"],
    data,
  })
}

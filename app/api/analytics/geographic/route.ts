import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "7d"

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Generate data with some variation based on period
  const baseData = [58, 32, 28, 15]
  const variation = period === "24h" ? 0.2 : period === "1y" ? 0.4 : 0.3

  const data = baseData.map((value) => Math.max(1, Math.floor(value + (Math.random() - 0.5) * value * variation)))

  return NextResponse.json({
    labels: ["Bonamoussadi Centre", "Bonamoussadi Nord", "Bonamoussadi Sud", "Bonamoussadi Est"],
    data,
  })
}

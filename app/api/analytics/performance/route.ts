import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "7d"

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const generateTimeLabels = (period: string) => {
    const now = new Date()
    const labels = []

    switch (period) {
      case "24h":
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 60 * 60 * 1000)
          labels.push(date.getHours() + ":00")
        }
        break
      case "7d":
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          labels.push(date.toLocaleDateString("fr-FR", { weekday: "short" }))
        }
        break
      case "30d":
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          labels.push(date.getDate() + "/" + (date.getMonth() + 1))
        }
        break
      case "90d":
        for (let i = 89; i >= 0; i -= 3) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          labels.push(date.getDate() + "/" + (date.getMonth() + 1))
        }
        break
      case "1y":
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          labels.push(date.toLocaleDateString("fr-FR", { month: "short" }))
        }
        break
    }

    return labels
  }

  const generateRandomData = (length: number, min: number, max: number) => {
    return Array.from({ length }, (_, i) => {
      const base = min + (max - min) * 0.7 // Base around 70% of range
      const trend = Math.sin(i * 0.3) * (max - min) * 0.1 // Small trend
      const noise = (Math.random() - 0.5) * (max - min) * 0.2 // Random variation
      return Math.max(min, Math.min(max, base + trend + noise))
    })
  }

  const labels = generateTimeLabels(period)

  const data = {
    labels,
    successRate: generateRandomData(labels.length, 80, 95),
    aiEfficiency: generateRandomData(labels.length, 88, 98),
    satisfaction: generateRandomData(labels.length, 4.2, 5.0),
  }

  return NextResponse.json(data)
}

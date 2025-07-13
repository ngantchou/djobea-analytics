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
      const base = min + (max - min) * 0.7
      const trend = Math.sin(i * 0.3) * (max - min) * 0.1
      const noise = (Math.random() - 0.5) * (max - min) * 0.2
      return Math.max(min, Math.min(max, base + trend + noise))
    })
  }

  const labels = generateTimeLabels(period)

  const data = {
    stats: {
      successRate: 89.2 + (Math.random() - 0.5) * 5,
      responseTime: 14.5 + (Math.random() - 0.5) * 4,
      totalRequests: 247 + Math.floor((Math.random() - 0.5) * 20),
      satisfaction: 4.8 + (Math.random() - 0.5) * 0.4,
      trends: {
        successRate: Math.random() * 6 - 1,
        responseTime: Math.random() * 4 - 2,
        totalRequests: Math.random() * 30 - 5,
        satisfaction: Math.random() * 0.6 - 0.1,
      },
    },
    charts: {
      performance: {
        labels,
        successRate: generateRandomData(labels.length, 80, 95),
        aiEfficiency: generateRandomData(labels.length, 88, 98),
        satisfaction: generateRandomData(labels.length, 4.2, 5.0),
      },
      services: {
        labels: ["Plomberie", "Électricité", "Électroménager", "Maintenance"],
        data: [45, 35, 15, 5].map((v) => v + Math.floor(Math.random() * 10) - 5),
      },
      geographic: {
        labels: ["Bonamoussadi Centre", "Bonamoussadi Nord", "Bonamoussadi Sud", "Bonamoussadi Est"],
        data: [58, 32, 28, 15].map((v) => v + Math.floor(Math.random() * 8) - 4),
      },
    },
    insights: [
      {
        type: "positive",
        icon: "trending-up",
        title: "Performance Excellente",
        description:
          "Le taux de réussite a augmenté de 2.3% cette semaine. Les prestataires de Bonamoussadi Centre sont particulièrement performants.",
        confidence: 95,
      },
      {
        type: "warning",
        icon: "alert-triangle",
        title: "Zone à Optimiser",
        description:
          "Les demandes de plomberie à Bonamoussadi Sud ont un temps de réponse 23% plus élevé que la moyenne.",
        confidence: 87,
      },
      {
        type: "info",
        icon: "brain",
        title: "IA Optimisée",
        description: "L'algorithme de matching a été optimisé : +8% de correspondances réussies cette semaine.",
        confidence: 92,
      },
    ],
    leaderboard: [
      {
        id: "1",
        name: "Jean-Baptiste Électricité",
        avatar: "JB",
        missions: 45 + Math.floor(Math.random() * 5),
        rating: 4.9,
        responseTime: 12 + Math.floor(Math.random() * 3),
        score: 98.2 + (Math.random() - 0.5) * 2,
      },
      {
        id: "2",
        name: "Marie Réparation",
        avatar: "MR",
        missions: 23 + Math.floor(Math.random() * 5),
        rating: 4.8,
        responseTime: 8 + Math.floor(Math.random() * 3),
        score: 96.7 + (Math.random() - 0.5) * 2,
      },
      {
        id: "3",
        name: "Paul Plomberie",
        avatar: "PP",
        missions: 32 + Math.floor(Math.random() * 5),
        rating: 4.6,
        responseTime: 18 + Math.floor(Math.random() * 5),
        score: 94.1 + (Math.random() - 0.5) * 2,
      },
      {
        id: "4",
        name: "Alain Maintenance",
        avatar: "AM",
        missions: 18 + Math.floor(Math.random() * 3),
        rating: 4.5,
        responseTime: 25 + Math.floor(Math.random() * 5),
        score: 91.8 + (Math.random() - 0.5) * 2,
      },
      {
        id: "5",
        name: "Francis Kono",
        avatar: "FK",
        missions: 12 + Math.floor(Math.random() * 3),
        rating: 3.2 + Math.random() * 0.5,
        responseTime: 45 + Math.floor(Math.random() * 10),
        score: 67.3 + (Math.random() - 0.5) * 5,
      },
    ],
  }

  return NextResponse.json(data)
}

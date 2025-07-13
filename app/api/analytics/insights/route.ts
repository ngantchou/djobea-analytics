import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const insights = [
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
    {
      type: "positive",
      icon: "trending-up",
      title: "Croissance Soutenue",
      description: "Augmentation de 15% des nouvelles demandes par rapport à la semaine dernière.",
      confidence: 89,
    },
  ]

  // Randomly select 3 insights
  const selectedInsights = insights.sort(() => Math.random() - 0.5).slice(0, 3)

  return NextResponse.json(selectedInsights)
}

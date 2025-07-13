import { type NextRequest, NextResponse } from "next/server"

// Simulation d'algorithmes de machine learning
function generatePredictions(type: string, days = 7) {
  const data = []
  const now = new Date()

  for (let i = -days; i <= days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)

    let baseValue = 100
    let seasonalFactor = 1
    let trendFactor = 1
    let randomNoise = (Math.random() - 0.5) * 0.1

    // Facteurs saisonniers (weekend, lundi boost, etc.)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      seasonalFactor = 0.7 // Weekend plus calme
    } else if (dayOfWeek === 1) {
      seasonalFactor = 1.3 // Lundi boost
    }

    // Patterns spécifiques par type
    switch (type) {
      case "demand":
        baseValue = 85
        trendFactor = 1 + Math.sin(i * 0.2) * 0.15
        break
      case "revenue":
        baseValue = 4500
        trendFactor = 1 + Math.sin(i * 0.15) * 0.12
        break
      case "satisfaction":
        baseValue = 4.3
        trendFactor = 1 + Math.sin(i * 0.1) * 0.05
        randomNoise *= 0.5 // Moins de bruit pour satisfaction
        break
      case "performance":
        baseValue = 88
        trendFactor = 1 + Math.sin(i * 0.25) * 0.08
        break
    }

    const actualValue = i <= 0 ? baseValue * seasonalFactor * trendFactor * (1 + randomNoise) : null
    const predictedValue = i > 0 ? baseValue * seasonalFactor * trendFactor * (1 + randomNoise * 0.5) : null
    const confidence = i > 0 ? Math.max(65, 95 - Math.abs(i) * 2) : null

    data.push({
      date: date.toISOString().split("T")[0],
      actual: actualValue ? Math.round(actualValue * 100) / 100 : null,
      predicted: predictedValue ? Math.round(predictedValue * 100) / 100 : null,
      confidence: confidence ? Math.round(confidence * 10) / 10 : null,
    })
  }

  return data
}

function generateInsights() {
  const insights = [
    {
      id: "insight_1",
      type: "opportunity" as const,
      title: "Pic de demande prévu demain",
      description:
        "Une augmentation de 35% des demandes est prévue demain entre 14h et 18h selon l'analyse des patterns historiques",
      impact: "high" as const,
      confidence: 89.2,
      action: "Mobiliser 3 prestataires supplémentaires",
      category: "Demande",
      timestamp: new Date().toISOString(),
    },
    {
      id: "insight_2",
      type: "risk" as const,
      title: "Baisse satisfaction zone Nord",
      description:
        "Risque de chute de 15% de la satisfaction dans la zone Nord cette semaine basé sur les tendances récentes",
      impact: "medium" as const,
      confidence: 76.8,
      action: "Contacter les prestataires de la zone",
      category: "Satisfaction",
      timestamp: new Date().toISOString(),
    },
    {
      id: "insight_3",
      type: "optimization" as const,
      title: "Optimisation itinéraires possible",
      description:
        "Réduction de 20% du temps de trajet possible avec réorganisation des tournées selon l'algorithme d'optimisation",
      impact: "high" as const,
      confidence: 92.4,
      action: "Implémenter nouveau routage",
      category: "Logistique",
      timestamp: new Date().toISOString(),
    },
    {
      id: "insight_4",
      type: "trend" as const,
      title: "Nouvelle tendance services premium",
      description: "Croissance de 45% des demandes de services premium ce mois, opportunité de développement",
      impact: "medium" as const,
      confidence: 83.7,
      action: "Recruter prestataires spécialisés",
      category: "Business",
      timestamp: new Date().toISOString(),
    },
    {
      id: "insight_5",
      type: "opportunity" as const,
      title: "Nouveau segment clientèle identifié",
      description: "Segment de clients entreprises émergent avec potentiel de +25% de revenus",
      impact: "high" as const,
      confidence: 87.1,
      action: "Développer offre B2B",
      category: "Business",
      timestamp: new Date().toISOString(),
    },
    {
      id: "insight_6",
      type: "risk" as const,
      title: "Concurrence accrue zone Sud",
      description: "Nouveau concurrent détecté avec tarifs -15%, risque de perte de parts de marché",
      impact: "medium" as const,
      confidence: 81.3,
      action: "Ajuster stratégie tarifaire",
      category: "Concurrence",
      timestamp: new Date().toISOString(),
    },
  ]

  return insights
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "demand"
    const days = Number.parseInt(searchParams.get("days") || "7")

    // Simulation d'un délai de traitement IA
    await new Promise((resolve) => setTimeout(resolve, 500))

    const predictions = generatePredictions(type, days)
    const insights = generateInsights()

    // Métriques des modèles
    const modelMetrics = {
      demand: { accuracy: 87.3, confidence: 92.1, predictions: 1247 },
      revenue: { accuracy: 84.7, confidence: 89.4, predictions: 892 },
      satisfaction: { accuracy: 79.2, confidence: 85.6, predictions: 634 },
      performance: { accuracy: 91.8, confidence: 94.2, predictions: 1456 },
    }

    return NextResponse.json({
      success: true,
      predictions,
      insights,
      metrics: modelMetrics,
      timestamp: new Date().toISOString(),
      model: {
        type,
        version: "1.2.3",
        lastTrained: "2024-01-15T10:30:00Z",
        accuracy: modelMetrics[type as keyof typeof modelMetrics]?.accuracy || 85,
      },
    })
  } catch (error) {
    console.error("Erreur API prédictions IA:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la génération des prédictions",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, modelId, parameters } = body

    // Simulation d'actions sur les modèles
    switch (action) {
      case "retrain":
        // Simulation réentraînement
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return NextResponse.json({
          success: true,
          message: `Modèle ${modelId} réentraîné avec succès`,
          newAccuracy: Math.min(95, Math.random() * 10 + 85),
        })

      case "predict":
        const predictions = generatePredictions(parameters?.type || "demand", parameters?.days || 7)
        return NextResponse.json({
          success: true,
          predictions,
        })

      default:
        return NextResponse.json({ success: false, error: "Action non reconnue" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erreur POST prédictions IA:", error)
    return NextResponse.json({ success: false, error: "Erreur lors du traitement de la requête" }, { status: 500 })
  }
}

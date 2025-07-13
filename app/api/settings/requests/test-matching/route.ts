import { NextResponse } from "next/server"

interface MatchingAlgorithmSettings {
  distanceWeight: number
  ratingWeight: number
  responseTimeWeight: number
  specializationWeight: number
  newProviderBoost: number
}

interface MockProvider {
  id: number
  name: string
  distance: number
  rating: number
  responseTime: number
  specialization: number
  isNew: boolean
}

// Mock providers data for testing
const mockProviders: MockProvider[] = [
  { id: 1, name: "Jean Dupont", distance: 1.2, rating: 4.8, responseTime: 5, specialization: 0.9, isNew: false },
  { id: 2, name: "Marie Martin", distance: 2.1, rating: 4.6, responseTime: 8, specialization: 0.8, isNew: true },
  { id: 3, name: "Paul Bernard", distance: 1.8, rating: 4.9, responseTime: 3, specialization: 0.95, isNew: false },
  { id: 4, name: "Sophie Dubois", distance: 3.5, rating: 4.4, responseTime: 12, specialization: 0.7, isNew: false },
  { id: 5, name: "Pierre Moreau", distance: 0.8, rating: 4.7, responseTime: 6, specialization: 0.85, isNew: true },
  { id: 6, name: "Claire Rousseau", distance: 2.8, rating: 4.5, responseTime: 9, specialization: 0.75, isNew: false },
  { id: 7, name: "Michel Leroy", distance: 1.5, rating: 4.9, responseTime: 4, specialization: 0.9, isNew: false },
  { id: 8, name: "Anne Petit", distance: 4.2, rating: 4.3, responseTime: 15, specialization: 0.6, isNew: true },
  { id: 9, name: "François Simon", distance: 2.3, rating: 4.8, responseTime: 7, specialization: 0.88, isNew: false },
  { id: 10, name: "Isabelle Roux", distance: 1.9, rating: 4.6, responseTime: 10, specialization: 0.82, isNew: false },
  { id: 11, name: "Alain Blanc", distance: 3.1, rating: 4.4, responseTime: 11, specialization: 0.78, isNew: true },
  { id: 12, name: "Nathalie Girard", distance: 1.3, rating: 4.7, responseTime: 5, specialization: 0.87, isNew: false },
  { id: 13, name: "Thierry Faure", distance: 2.6, rating: 4.5, responseTime: 8, specialization: 0.73, isNew: false },
  { id: 14, name: "Sylvie Mercier", distance: 1.7, rating: 4.8, responseTime: 6, specialization: 0.91, isNew: true },
  { id: 15, name: "Olivier Garnier", distance: 3.8, rating: 4.2, responseTime: 14, specialization: 0.65, isNew: false },
  { id: 16, name: "Valérie Lemoine", distance: 2.4, rating: 4.6, responseTime: 9, specialization: 0.79, isNew: false },
  { id: 17, name: "Christophe Roy", distance: 1.1, rating: 4.9, responseTime: 3, specialization: 0.93, isNew: false },
  { id: 18, name: "Sandrine Bonnet", distance: 2.9, rating: 4.4, responseTime: 12, specialization: 0.71, isNew: true },
  { id: 19, name: "Didier Clement", distance: 1.6, rating: 4.7, responseTime: 7, specialization: 0.84, isNew: false },
  {
    id: 20,
    name: "Monique Gauthier",
    distance: 3.3,
    rating: 4.3,
    responseTime: 13,
    specialization: 0.68,
    isNew: false,
  },
  { id: 21, name: "Gérard Muller", distance: 2.2, rating: 4.8, responseTime: 5, specialization: 0.89, isNew: true },
  {
    id: 22,
    name: "Brigitte Lefebvre",
    distance: 1.4,
    rating: 4.6,
    responseTime: 8,
    specialization: 0.81,
    isNew: false,
  },
  { id: 23, name: "Yves Moreau", distance: 3.6, rating: 4.1, responseTime: 16, specialization: 0.62, isNew: false },
  { id: 24, name: "Chantal Dufour", distance: 2.7, rating: 4.5, responseTime: 10, specialization: 0.76, isNew: true },
  { id: 25, name: "Serge Bertrand", distance: 1.8, rating: 4.7, responseTime: 6, specialization: 0.86, isNew: false },
]

function calculateProviderScore(provider: MockProvider, settings: MatchingAlgorithmSettings): number {
  // Normalize values to 0-1 scale
  const maxDistance = 5.0 // km
  const maxResponseTime = 20 // minutes

  // Distance score (closer is better)
  const distanceScore = Math.max(0, (maxDistance - provider.distance) / maxDistance)

  // Rating score (0-5 scale normalized to 0-1)
  const ratingScore = provider.rating / 5.0

  // Response time score (faster is better)
  const responseTimeScore = Math.max(0, (maxResponseTime - provider.responseTime) / maxResponseTime)

  // Specialization score (already 0-1)
  const specializationScore = provider.specialization

  // Calculate weighted score
  let totalScore =
    distanceScore * settings.distanceWeight +
    ratingScore * settings.ratingWeight +
    responseTimeScore * settings.responseTimeWeight +
    specializationScore * settings.specializationWeight

  // Apply new provider boost
  if (provider.isNew) {
    totalScore += settings.newProviderBoost
  }

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, totalScore))
}

export async function POST(request: Request) {
  try {
    const algorithmSettings: MatchingAlgorithmSettings = await request.json()

    // Validate algorithm settings
    if (!algorithmSettings || typeof algorithmSettings !== "object") {
      return NextResponse.json({ success: false, message: "Paramètres d'algorithme invalides" }, { status: 400 })
    }

    const requiredFields = [
      "distanceWeight",
      "ratingWeight",
      "responseTimeWeight",
      "specializationWeight",
      "newProviderBoost",
    ]
    for (const field of requiredFields) {
      if (typeof algorithmSettings[field as keyof MatchingAlgorithmSettings] !== "number") {
        return NextResponse.json({ success: false, message: `Champ manquant ou invalide: ${field}` }, { status: 400 })
      }
    }

    // Validate weights sum to 100
    const totalWeight =
      algorithmSettings.distanceWeight +
      algorithmSettings.ratingWeight +
      algorithmSettings.responseTimeWeight +
      algorithmSettings.specializationWeight

    if (Math.abs(totalWeight - 100) > 0.1) {
      return NextResponse.json(
        { success: false, message: "La somme des poids doit être égale à 100%" },
        { status: 400 },
      )
    }

    // Simulate algorithm testing with realistic delay
    const startTime = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))
    const executionTime = Date.now() - startTime

    // Calculate scores for all providers
    const providersWithScores = mockProviders.map((provider) => ({
      ...provider,
      score: Math.round(calculateProviderScore(provider, algorithmSettings) * 100) / 100,
      distance: `${provider.distance}km`,
    }))

    // Sort by score (descending)
    providersWithScores.sort((a, b) => b.score - a.score)

    // Calculate statistics
    const scores = providersWithScores.map((p) => p.score)
    const averageScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
    const topProviders = providersWithScores.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      score: Math.round(p.score),
      distance: p.distance,
      rating: p.rating,
      isNew: p.isNew,
    }))

    // Performance metrics
    const performanceMetrics = {
      algorithmsEfficiency: Math.round(85 + Math.random() * 10), // 85-95%
      memoryUsage: Math.round(12 + Math.random() * 8), // 12-20 MB
      cacheHitRate: Math.round(75 + Math.random() * 20), // 75-95%
    }

    // Distribution analysis
    const scoreRanges = {
      excellent: providersWithScores.filter((p) => p.score >= 80).length,
      good: providersWithScores.filter((p) => p.score >= 60 && p.score < 80).length,
      average: providersWithScores.filter((p) => p.score >= 40 && p.score < 60).length,
      poor: providersWithScores.filter((p) => p.score < 40).length,
    }

    const testResults = {
      success: true,
      providersCount: mockProviders.length,
      executionTime,
      averageScore,
      topProviders,
      performanceMetrics,
      scoreDistribution: scoreRanges,
      algorithmSettings,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(algorithmSettings, averageScore, scoreRanges),
    }

    return NextResponse.json(testResults)
  } catch (error) {
    console.error("Algorithm test failed:", error)
    return NextResponse.json({ success: false, message: "Erreur lors du test de l'algorithme" }, { status: 500 })
  }
}

function generateRecommendations(
  settings: MatchingAlgorithmSettings,
  averageScore: number,
  distribution: any,
): string[] {
  const recommendations: string[] = []

  if (averageScore < 60) {
    recommendations.push("Score moyen faible - considérez ajuster les poids de l'algorithme")
  }

  if (settings.distanceWeight > 60) {
    recommendations.push("Poids distance très élevé - pourrait limiter les options de prestataires")
  }

  if (settings.ratingWeight < 20) {
    recommendations.push("Poids rating faible - la qualité pourrait être négligée")
  }

  if (settings.newProviderBoost > 30) {
    recommendations.push("Boost nouveaux prestataires très élevé - pourrait favoriser l'inexpérience")
  }

  if (distribution.excellent < 5) {
    recommendations.push("Peu de prestataires excellent - considérez revoir les critères")
  }

  if (distribution.poor > distribution.excellent) {
    recommendations.push("Plus de prestataires faibles qu'excellents - algorithme à optimiser")
  }

  return recommendations
}

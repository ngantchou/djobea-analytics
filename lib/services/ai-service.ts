import { ApiClient } from "@/lib/api-client"

export interface AIPrediction {
  id: string
  type: "demand_forecast" | "provider_recommendation" | "pricing_optimization" | "risk_assessment"
  title: string
  description: string
  confidence: number
  data: any
  insights: string[]
  recommendations: string[]
  createdAt: string
  expiresAt?: string
}

export interface AIInsight {
  id: string
  category: "performance" | "optimization" | "trend" | "anomaly"
  title: string
  description: string
  impact: "low" | "medium" | "high" | "critical"
  actionable: boolean
  actions?: string[]
  data: any
  createdAt: string
}

export interface AIRecommendation {
  id: string
  type: "provider_match" | "pricing_strategy" | "resource_allocation" | "process_improvement"
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  expectedImpact: string
  implementation: string[]
  metrics: Record<string, number>
  createdAt: string
}

export interface TextAnalysisResult {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  keywords: string[]
  categories: string[]
  language: string
  summary?: string
}

export interface ModelPerformance {
  modelId: string
  name: string
  type: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastTrained: string
  status: "active" | "training" | "inactive"
}

export class AIService {
  static async getPredictions(type?: string, limit = 10): Promise<AIPrediction[]> {
    try {
      const params = new URLSearchParams()
      if (type) params.append("type", type)
      params.append("limit", limit.toString())

      const response = await ApiClient.get<AIPrediction[]>(`/api/ai/predictions?${params}`)
      return response
    } catch (error) {
      console.error("Get AI predictions error:", error)
      throw new Error("Erreur lors de la récupération des prédictions IA")
    }
  }

  static async generatePrediction(type: string, data: any): Promise<AIPrediction> {
    try {
      const response = await ApiClient.post<AIPrediction>("/api/ai/predictions/generate", {
        type,
        data,
      })
      return response
    } catch (error) {
      console.error("Generate AI prediction error:", error)
      throw new Error("Erreur lors de la génération de la prédiction IA")
    }
  }

  static async getInsights(category?: string, limit = 20): Promise<AIInsight[]> {
    try {
      const params = new URLSearchParams()
      if (category) params.append("category", category)
      params.append("limit", limit.toString())

      const response = await ApiClient.get<AIInsight[]>(`/api/ai/insights?${params}`)
      return response
    } catch (error) {
      console.error("Get AI insights error:", error)
      throw new Error("Erreur lors de la récupération des insights IA")
    }
  }

  static async getRecommendations(type?: string, limit = 15): Promise<AIRecommendation[]> {
    try {
      const params = new URLSearchParams()
      if (type) params.append("type", type)
      params.append("limit", limit.toString())

      const response = await ApiClient.get<AIRecommendation[]>(`/api/ai/recommendations?${params}`)
      return response
    } catch (error) {
      console.error("Get AI recommendations error:", error)
      throw new Error("Erreur lors de la récupération des recommandations IA")
    }
  }

  static async analyzeText(
    text: string,
    options?: {
      includeSentiment?: boolean
      includeKeywords?: boolean
      includeSummary?: boolean
    },
  ): Promise<TextAnalysisResult> {
    try {
      const response = await ApiClient.post<TextAnalysisResult>("/api/ai/analyze-text", {
        text,
        options: {
          includeSentiment: true,
          includeKeywords: true,
          includeSummary: false,
          ...options,
        },
      })
      return response
    } catch (error) {
      console.error("Analyze text error:", error)
      throw new Error("Erreur lors de l'analyse du texte")
    }
  }

  static async optimizePricing(requestData: any): Promise<{
    suggestedPrice: number
    confidence: number
    factors: string[]
    priceRange: { min: number; max: number }
  }> {
    try {
      const response = await ApiClient.post<{
        suggestedPrice: number
        confidence: number
        factors: string[]
        priceRange: { min: number; max: number }
      }>("/api/ai/optimize-pricing", requestData)
      return response
    } catch (error) {
      console.error("Optimize pricing error:", error)
      throw new Error("Erreur lors de l'optimisation des prix")
    }
  }

  static async matchProviders(
    requestId: string,
    criteria?: any,
  ): Promise<{
    providers: any[]
    scores: Record<string, number>
    reasoning: Record<string, string[]>
  }> {
    try {
      const response = await ApiClient.post<{
        providers: any[]
        scores: Record<string, number>
        reasoning: Record<string, string[]>
      }>("/api/ai/match-providers", {
        requestId,
        criteria,
      })
      return response
    } catch (error) {
      console.error("Match providers error:", error)
      throw new Error("Erreur lors de la correspondance des prestataires")
    }
  }

  static async forecastDemand(
    period: "week" | "month" | "quarter",
    filters?: any,
  ): Promise<{
    forecast: Array<{ period: string; predicted: number; confidence: number }>
    trends: string[]
    factors: string[]
  }> {
    try {
      const response = await ApiClient.post<{
        forecast: Array<{ period: string; predicted: number; confidence: number }>
        trends: string[]
        factors: string[]
      }>("/api/ai/forecast-demand", {
        period,
        filters,
      })
      return response
    } catch (error) {
      console.error("Forecast demand error:", error)
      throw new Error("Erreur lors de la prévision de la demande")
    }
  }

  static async assessRisk(
    entityType: "request" | "provider" | "transaction",
    entityId: string,
  ): Promise<{
    riskScore: number
    riskLevel: "low" | "medium" | "high" | "critical"
    factors: string[]
    recommendations: string[]
  }> {
    try {
      const response = await ApiClient.post<{
        riskScore: number
        riskLevel: "low" | "medium" | "high" | "critical"
        factors: string[]
        recommendations: string[]
      }>("/api/ai/assess-risk", {
        entityType,
        entityId,
      })
      return response
    } catch (error) {
      console.error("Assess risk error:", error)
      throw new Error("Erreur lors de l'évaluation des risques")
    }
  }

  static async getModelPerformance(): Promise<ModelPerformance[]> {
    try {
      const response = await ApiClient.get<ModelPerformance[]>("/api/ai/models/performance")
      return response
    } catch (error) {
      console.error("Get model performance error:", error)
      throw new Error("Erreur lors de la récupération des performances des modèles")
    }
  }

  static async retrainModel(modelId: string, data?: any): Promise<{ jobId: string; status: string }> {
    try {
      const response = await ApiClient.post<{ jobId: string; status: string }>(
        `/api/ai/models/${modelId}/retrain`,
        data,
      )
      return response
    } catch (error) {
      console.error("Retrain model error:", error)
      throw new Error("Erreur lors du réentraînement du modèle")
    }
  }

  static async getTrainingStatus(jobId: string): Promise<{
    status: "pending" | "running" | "completed" | "failed"
    progress: number
    logs?: string[]
    error?: string
  }> {
    try {
      const response = await ApiClient.get<{
        status: "pending" | "running" | "completed" | "failed"
        progress: number
        logs?: string[]
        error?: string
      }>(`/api/ai/training/${jobId}/status`)
      return response
    } catch (error) {
      console.error("Get training status error:", error)
      throw new Error("Erreur lors de la vérification du statut d'entraînement")
    }
  }

  static async generateReport(
    type: string,
    data: any,
  ): Promise<{
    reportId: string
    content: string
    insights: string[]
    charts?: any[]
  }> {
    try {
      const response = await ApiClient.post<{
        reportId: string
        content: string
        insights: string[]
        charts?: any[]
      }>("/api/ai/generate-report", {
        type,
        data,
      })
      return response
    } catch (error) {
      console.error("Generate AI report error:", error)
      throw new Error("Erreur lors de la génération du rapport IA")
    }
  }

  static async chatWithAI(
    message: string,
    context?: any,
  ): Promise<{
    response: string
    suggestions?: string[]
    actions?: Array<{ label: string; action: string }>
  }> {
    try {
      const response = await ApiClient.post<{
        response: string
        suggestions?: string[]
        actions?: Array<{ label: string; action: string }>
      }>("/api/ai/chat", {
        message,
        context,
      })
      return response
    } catch (error) {
      console.error("Chat with AI error:", error)
      throw new Error("Erreur lors de la conversation avec l'IA")
    }
  }
}

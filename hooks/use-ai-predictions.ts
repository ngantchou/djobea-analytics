"use client"

import { useState, useEffect } from "react"

interface PredictionData {
  date: string
  actual: number | null
  predicted: number | null
  confidence: number | null
}

interface Insight {
  id: string
  type: "opportunity" | "risk" | "optimization" | "trend"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  action: string
  category: string
}

interface UseAIPredictionsReturn {
  predictions: PredictionData[]
  insights: Insight[]
  isLoading: boolean
  error: string | null
  refreshPredictions: () => Promise<void>
}

export function useAIPredictions(): UseAIPredictionsReturn {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPredictions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/predictions")
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des prédictions")
      }

      const data = await response.json()
      setPredictions(data.predictions || [])
      setInsights(data.insights || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPredictions = async () => {
    await fetchPredictions()
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  return {
    predictions,
    insights,
    isLoading,
    error,
    refreshPredictions,
  }
}

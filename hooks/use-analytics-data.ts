"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export function useAnalyticsData(period = "7d") {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch analytics data using authenticated API client
      const analyticsResult = await apiClient.getAnalyticsData(period)

      if (analyticsResult.success) {
        setData(analyticsResult.data)
      } else {
        throw new Error(analyticsResult.error || "Failed to fetch analytics data")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des analyses"
      setError(message)
      logger.error("Failed to fetch analytics data", { error: err, period })

      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [period, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

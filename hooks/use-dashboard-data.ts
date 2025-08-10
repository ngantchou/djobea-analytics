"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export function useDashboardData(period = "7d") {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await apiClient.getDashboardData(period)

      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard data")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement du tableau de bord"
      setError(message)
      logger.error("Failed to fetch dashboard data", { error: err, period })

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

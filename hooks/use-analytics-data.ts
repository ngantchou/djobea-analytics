"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useCallback } from "react"

interface AnalyticsStats {
  successRate: number
  responseTime: number
  totalRequests: number
  satisfaction: number
  trends: {
    successRate: number
    responseTime: number
    totalRequests: number
    satisfaction: number
  }
}

interface AnalyticsCharts {
  performance: {
    labels: string[]
    successRate: number[]
    aiEfficiency: number[]
    satisfaction: number[]
  }
  services: {
    labels: string[]
    data: number[]
  }
  geographic: {
    labels: string[]
    data: number[]
  }
}

interface AnalyticsInsight {
  type: "positive" | "warning" | "info"
  icon: string
  title: string
  description: string
  confidence: number
}

interface AnalyticsProvider {
  id: string
  name: string
  avatar: string
  missions: number
  rating: number
  responseTime: number
  score: number
}

interface AnalyticsData {
  stats: AnalyticsStats
  charts: AnalyticsCharts
  insights: AnalyticsInsight[]
  leaderboard: AnalyticsProvider[]
}

async function fetchAnalyticsData(period: string, filters?: any): Promise<AnalyticsData> {
  const params = new URLSearchParams({ period })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value))
      }
    })
  }

  const response = await fetch(`/api/analytics?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics data: ${response.statusText}`)
  }

  return response.json()
}

export function useAnalyticsData(period = "7d", filters?: any) {
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const query = useQuery({
    queryKey: ["analytics", period, filters, lastRefresh],
    queryFn: () => fetchAnalyticsData(period, filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const refetch = useCallback(() => {
    setLastRefresh(Date.now())
    return query.refetch()
  }, [query])

  return {
    ...query,
    refetch,
  }
}

// Hook pour les statistiques en temps réel
export function useRealTimeAnalytics(period = "7d") {
  const [isRealTime, setIsRealTime] = useState(false)

  const query = useAnalyticsData(period)

  const enableRealTime = useCallback(() => {
    setIsRealTime(true)
  }, [])

  const disableRealTime = useCallback(() => {
    setIsRealTime(false)
  }, [])

  return {
    ...query,
    isRealTime,
    enableRealTime,
    disableRealTime,
  }
}

// Hook pour les actions d'export
export function useAnalyticsExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportData = useCallback(async (format: string, period: string, options: any = {}) => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          period,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${period}-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error("Export error:", error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    exportData,
    isExporting,
  }
}

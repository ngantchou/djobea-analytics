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

export function useAnalyticsExport() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportData = useCallback(async (format: string = "csv", period: string = "7d", options?: any) => {
    try {
      setIsExporting(true)
      
      // Prepare export parameters
      const exportParams = {
        format,
        period,
        ...options
      }

      // Call export API
      const response = await apiClient.request("/api/export/analytics", {
        method: "POST",
        body: exportParams,
        cache: "no-cache",
        requireAuth: false
      })

      if (response.success) {
        // Handle successful export
        if (response.data?.downloadUrl) {
          // If we get a download URL, trigger download
          const link = document.createElement('a')
          link.href = response.data.downloadUrl
          link.download = response.data.filename || `analytics-export-${Date.now()}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else if (response.data?.content) {
          // If we get direct content, create blob and download
          const blob = new Blob([response.data.content], { 
            type: format === 'csv' ? 'text/csv' : 'application/json' 
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `analytics-export-${Date.now()}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }

        logger.info("Analytics export successful", { format, period })
      } else {
        throw new Error(response.error || "Export failed")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'export"
      logger.error("Analytics export failed", { error: err, format, period })
      
      toast({
        title: "Erreur d'export",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }, [toast])

  return {
    exportData,
    isExporting,
  }
}

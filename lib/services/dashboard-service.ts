"use client"

import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export interface DashboardStats {
  totalProviders: number
  activeProviders: number
  providersChange: number
  totalRequests: number
  pendingRequests: number
  requestsChange: number
  totalRevenue: number
  monthlyRevenue: number
  revenueChange: number
  completionRate: number
  rateChange: number
}

export interface ActivityItem {
  id: string
  type: "request" | "provider" | "payment" | "completion"
  title: string
  description: string
  user: string
  timestamp: string
  status: "success" | "pending" | "warning" | "error"
  metadata?: Record<string, any>
}

export interface ChartData {
  requests: Array<{ name: string; value: number; completed: number }>
  revenue: Array<{ name: string; value: number }>
  services: Array<{ name: string; value: number; color: string }>
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: ActivityItem[]
  charts: ChartData
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: string
  enabled: boolean
  count?: number
}

class DashboardService {
  async getDashboardData(period = "7d"): Promise<DashboardData> {
    try {
      logger.info("Fetching dashboard data", { period })

      const response = await apiClient.getDashboardData(period)

      if (response.success && response.data) {
        logger.info("Dashboard data fetched successfully")
        return response.data
      }

      throw new Error(response.error || "Failed to fetch dashboard data")
    } catch (error) {
      logger.error("Failed to fetch dashboard data", { error, period })
      throw error
    }
  }

  async getStats(period = "7d"): Promise<DashboardStats> {
    try {
      logger.info("Fetching dashboard stats", { period })

      const response = await fetch(`/api/dashboard/stats?period=${period}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch stats")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch stats")
    } catch (error) {
      logger.error("Failed to fetch dashboard stats", { error, period })
      throw error
    }
  }

  async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
    try {
      logger.info("Fetching recent activity", { limit })

      const response = await fetch(`/api/dashboard/activity?limit=${limit}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch activity")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch activity")
    } catch (error) {
      logger.error("Failed to fetch recent activity", { error, limit })
      throw error
    }
  }

  async getChartData(period = "7d"): Promise<ChartData> {
    try {
      logger.info("Fetching chart data", { period })

      const response = await fetch(`/api/dashboard/charts?period=${period}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch chart data")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch chart data")
    } catch (error) {
      logger.error("Failed to fetch chart data", { error, period })
      throw error
    }
  }

  async getQuickActions(): Promise<QuickAction[]> {
    try {
      logger.info("Fetching quick actions")

      const response = await fetch("/api/dashboard/quick-actions")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch quick actions")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch quick actions")
    } catch (error) {
      logger.error("Failed to fetch quick actions", { error })
      throw error
    }
  }

  async executeQuickAction(actionId: string, params?: Record<string, any>): Promise<void> {
    try {
      logger.info("Executing quick action", { actionId, params })

      const response = await fetch("/api/dashboard/quick-actions/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionId,
          params,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to execute action")
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to execute action")
      }

      logger.info("Quick action executed successfully", { actionId })
    } catch (error) {
      logger.error("Failed to execute quick action", { error, actionId })
      throw error
    }
  }

  async refreshDashboard(): Promise<void> {
    try {
      logger.info("Refreshing dashboard")

      const response = await fetch("/api/dashboard/refresh", {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to refresh dashboard")
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to refresh dashboard")
      }

      logger.info("Dashboard refreshed successfully")
    } catch (error) {
      logger.error("Failed to refresh dashboard", { error })
      throw error
    }
  }

  async exportDashboard(format: "pdf" | "excel" | "csv", options?: Record<string, any>): Promise<Blob> {
    try {
      logger.info("Exporting dashboard", { format, options })

      const response = await fetch("/api/dashboard/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          options,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || "Failed to export dashboard")
      }

      const blob = await response.blob()
      logger.info("Dashboard exported successfully", { format })
      return blob
    } catch (error) {
      logger.error("Failed to export dashboard", { error, format })
      throw error
    }
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    services: Array<{
      name: string
      status: "up" | "down" | "degraded"
      responseTime?: number
      lastCheck: string
    }>
    metrics: {
      cpu: number
      memory: number
      disk: number
      network: number
    }
  }> {
    try {
      logger.info("Fetching system health")

      const response = await fetch("/api/dashboard/health")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch system health")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch system health")
    } catch (error) {
      logger.error("Failed to fetch system health", { error })
      throw error
    }
  }
}

export const dashboardService = new DashboardService()
export default dashboardService

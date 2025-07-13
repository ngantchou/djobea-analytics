import { ApiClient } from "@/lib/api-client"

export interface KPIData {
  totalRequests: number
  activeProviders: number
  completedRequests: number
  revenue: number
  averageResponseTime: number
  customerSatisfaction: number
  growthRate: number
  conversionRate: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

export interface AnalyticsInsight {
  id: string
  title: string
  description: string
  type: "positive" | "negative" | "neutral" | "warning"
  value: string
  change: number
  recommendation?: string
  createdAt: string
}

export interface GeographicData {
  region: string
  requests: number
  providers: number
  revenue: number
  coordinates: [number, number]
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  score: number
  rank: number
  change: number
  category: string
  metadata?: Record<string, any>
}

export interface AnalyticsFilters {
  dateRange: {
    start: string
    end: string
  }
  regions?: string[]
  categories?: string[]
  providers?: string[]
  status?: string[]
}

export interface ExportOptions {
  format: "csv" | "xlsx" | "pdf"
  data: string[]
  filters?: AnalyticsFilters
  includeCharts?: boolean
}

export class AnalyticsService {
  static async getKPIs(filters?: AnalyticsFilters): Promise<KPIData> {
    try {
      const response = await ApiClient.post<KPIData>("/api/analytics/kpis", { filters })
      return response
    } catch (error) {
      console.error("Get KPIs error:", error)
      throw new Error("Erreur lors de la récupération des KPIs")
    }
  }

  static async getPerformanceData(filters?: AnalyticsFilters): Promise<ChartData> {
    try {
      const response = await ApiClient.post<ChartData>("/api/analytics/performance", { filters })
      return response
    } catch (error) {
      console.error("Get performance data error:", error)
      throw new Error("Erreur lors de la récupération des données de performance")
    }
  }

  static async getServicesData(filters?: AnalyticsFilters): Promise<ChartData> {
    try {
      const response = await ApiClient.post<ChartData>("/api/analytics/services", { filters })
      return response
    } catch (error) {
      console.error("Get services data error:", error)
      throw new Error("Erreur lors de la récupération des données de services")
    }
  }

  static async getGeographicData(filters?: AnalyticsFilters): Promise<GeographicData[]> {
    try {
      const response = await ApiClient.post<GeographicData[]>("/api/analytics/geographic", { filters })
      return response
    } catch (error) {
      console.error("Get geographic data error:", error)
      throw new Error("Erreur lors de la récupération des données géographiques")
    }
  }

  static async getInsights(filters?: AnalyticsFilters): Promise<AnalyticsInsight[]> {
    try {
      const response = await ApiClient.post<AnalyticsInsight[]>("/api/analytics/insights", { filters })
      return response
    } catch (error) {
      console.error("Get insights error:", error)
      throw new Error("Erreur lors de la récupération des insights")
    }
  }

  static async getLeaderboard(category: string, filters?: AnalyticsFilters): Promise<LeaderboardEntry[]> {
    try {
      const response = await ApiClient.post<LeaderboardEntry[]>("/api/analytics/leaderboard", {
        category,
        filters,
      })
      return response
    } catch (error) {
      console.error("Get leaderboard error:", error)
      throw new Error("Erreur lors de la récupération du classement")
    }
  }

  static async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const response = await ApiClient.post("/api/analytics/export", options, {
        responseType: "blob",
      })
      return response
    } catch (error) {
      console.error("Export data error:", error)
      throw new Error("Erreur lors de l'export des données")
    }
  }

  static async shareReport(reportId: string, emails: string[]): Promise<void> {
    try {
      await ApiClient.post("/api/analytics/share", {
        reportId,
        emails,
      })
    } catch (error) {
      console.error("Share report error:", error)
      throw new Error("Erreur lors du partage du rapport")
    }
  }

  static async generateReport(filters: AnalyticsFilters, options: any): Promise<string> {
    try {
      const response = await ApiClient.post<{ reportId: string }>("/api/analytics/reports/generate", {
        filters,
        options,
      })
      return response.reportId
    } catch (error) {
      console.error("Generate report error:", error)
      throw new Error("Erreur lors de la génération du rapport")
    }
  }

  static async getReportStatus(reportId: string): Promise<{ status: string; progress: number; url?: string }> {
    try {
      const response = await ApiClient.get<{ status: string; progress: number; url?: string }>(
        `/api/analytics/reports/${reportId}/status`,
      )
      return response
    } catch (error) {
      console.error("Get report status error:", error)
      throw new Error("Erreur lors de la vérification du statut du rapport")
    }
  }

  static async refreshData(): Promise<void> {
    try {
      await ApiClient.post("/api/analytics/refresh")
    } catch (error) {
      console.error("Refresh data error:", error)
      throw new Error("Erreur lors de l'actualisation des données")
    }
  }

  static async getCustomMetrics(metricIds: string[], filters?: AnalyticsFilters): Promise<Record<string, any>> {
    try {
      const response = await ApiClient.post<Record<string, any>>("/api/analytics/custom-metrics", {
        metricIds,
        filters,
      })
      return response
    } catch (error) {
      console.error("Get custom metrics error:", error)
      throw new Error("Erreur lors de la récupération des métriques personnalisées")
    }
  }

  static async saveCustomDashboard(name: string, config: any): Promise<string> {
    try {
      const response = await ApiClient.post<{ dashboardId: string }>("/api/analytics/dashboards", {
        name,
        config,
      })
      return response.dashboardId
    } catch (error) {
      console.error("Save custom dashboard error:", error)
      throw new Error("Erreur lors de la sauvegarde du tableau de bord")
    }
  }

  static async getCustomDashboards(): Promise<any[]> {
    try {
      const response = await ApiClient.get<any[]>("/api/analytics/dashboards")
      return response
    } catch (error) {
      console.error("Get custom dashboards error:", error)
      throw new Error("Erreur lors de la récupération des tableaux de bord")
    }
  }
}

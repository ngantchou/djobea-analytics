import { ApiClient } from "@/lib/api-client"

export interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    timezone: string
    language: string
    currency: string
    dateFormat: string
    timeFormat: string
  }
  features: {
    enableAI: boolean
    enableGeolocation: boolean
    enableRealtime: boolean
    enableWhatsApp: boolean
    enableNotifications: boolean
    enableAnalytics: boolean
  }
  security: {
    passwordMinLength: number
    requireTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    enableCaptcha: boolean
    allowedDomains: string[]
  }
  integrations: {
    googleMaps: {
      enabled: boolean
      apiKey?: string
    }
    whatsapp: {
      enabled: boolean
      businessId?: string
      accessToken?: string
    }
    email: {
      provider: "smtp" | "sendgrid" | "mailgun"
      config: Record<string, any>
    }
    sms: {
      provider: "twilio" | "nexmo"
      config: Record<string, any>
    }
  }
  maintenance: {
    enabled: boolean
    message: string
    allowedIPs: string[]
    scheduledStart?: string
    scheduledEnd?: string
  }
}

export interface FeatureFlag {
  id: string
  name: string
  key: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  conditions?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface BackupInfo {
  id: string
  type: "manual" | "scheduled"
  status: "pending" | "running" | "completed" | "failed"
  size: number
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  error?: string
}

export class SettingsService {
  static async getSettings(): Promise<SystemSettings> {
    try {
      const response = await ApiClient.get<SystemSettings>("/api/settings")
      return response
    } catch (error) {
      console.error("Get settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres")
    }
  }

  static async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await ApiClient.put<SystemSettings>("/api/settings", settings)
      return response
    } catch (error) {
      console.error("Update settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres")
    }
  }

  static async testIntegration(
    type: "email" | "sms" | "whatsapp" | "maps",
    config?: any,
  ): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      const response = await ApiClient.post<{
        success: boolean
        message: string
        details?: any
      }>(`/api/settings/test/${type}`, config)
      return response
    } catch (error) {
      console.error("Test integration error:", error)
      throw new Error("Erreur lors du test de l'intégration")
    }
  }

  static async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const response = await ApiClient.get<FeatureFlag[]>("/api/settings/feature-flags")
      return response
    } catch (error) {
      console.error("Get feature flags error:", error)
      throw new Error("Erreur lors de la récupération des feature flags")
    }
  }

  static async updateFeatureFlag(id: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    try {
      const response = await ApiClient.put<FeatureFlag>(`/api/settings/feature-flags/${id}`, data)
      return response
    } catch (error) {
      console.error("Update feature flag error:", error)
      throw new Error("Erreur lors de la mise à jour du feature flag")
    }
  }

  static async toggleFeatureFlag(id: string): Promise<FeatureFlag> {
    try {
      const response = await ApiClient.post<FeatureFlag>(`/api/settings/feature-flags/${id}/toggle`)
      return response
    } catch (error) {
      console.error("Toggle feature flag error:", error)
      throw new Error("Erreur lors du basculement du feature flag")
    }
  }

  static async enableMaintenanceMode(message: string, allowedIPs: string[] = []): Promise<void> {
    try {
      await ApiClient.post("/api/settings/maintenance/enable", {
        message,
        allowedIPs,
      })
    } catch (error) {
      console.error("Enable maintenance mode error:", error)
      throw new Error("Erreur lors de l'activation du mode maintenance")
    }
  }

  static async disableMaintenanceMode(): Promise<void> {
    try {
      await ApiClient.post("/api/settings/maintenance/disable")
    } catch (error) {
      console.error("Disable maintenance mode error:", error)
      throw new Error("Erreur lors de la désactivation du mode maintenance")
    }
  }

  static async scheduleMaintenanceMode(
    message: string,
    startTime: string,
    endTime: string,
    allowedIPs: string[] = [],
  ): Promise<void> {
    try {
      await ApiClient.post("/api/settings/maintenance/schedule", {
        message,
        startTime,
        endTime,
        allowedIPs,
      })
    } catch (error) {
      console.error("Schedule maintenance mode error:", error)
      throw new Error("Erreur lors de la programmation du mode maintenance")
    }
  }

  static async createBackup(type: "full" | "database" | "files" = "full"): Promise<BackupInfo> {
    try {
      const response = await ApiClient.post<BackupInfo>("/api/settings/backup/create", { type })
      return response
    } catch (error) {
      console.error("Create backup error:", error)
      throw new Error("Erreur lors de la création de la sauvegarde")
    }
  }

  static async getBackups(): Promise<BackupInfo[]> {
    try {
      const response = await ApiClient.get<BackupInfo[]>("/api/settings/backup/list")
      return response
    } catch (error) {
      console.error("Get backups error:", error)
      throw new Error("Erreur lors de la récupération des sauvegardes")
    }
  }

  static async restoreBackup(backupId: string): Promise<{ jobId: string; status: string }> {
    try {
      const response = await ApiClient.post<{ jobId: string; status: string }>(
        `/api/settings/backup/${backupId}/restore`,
      )
      return response
    } catch (error) {
      console.error("Restore backup error:", error)
      throw new Error("Erreur lors de la restauration de la sauvegarde")
    }
  }

  static async deleteBackup(backupId: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/settings/backup/${backupId}`)
    } catch (error) {
      console.error("Delete backup error:", error)
      throw new Error("Erreur lors de la suppression de la sauvegarde")
    }
  }

  static async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    checks: Array<{
      name: string
      status: "pass" | "fail" | "warn"
      message: string
      details?: any
    }>
    uptime: number
    version: string
  }> {
    try {
      const response = await ApiClient.get<{
        status: "healthy" | "warning" | "critical"
        checks: Array<{
          name: string
          status: "pass" | "fail" | "warn"
          message: string
          details?: any
        }>
        uptime: number
        version: string
      }>("/api/settings/health")
      return response
    } catch (error) {
      console.error("Get system health error:", error)
      throw new Error("Erreur lors de la vérification de l'état du système")
    }
  }

  static async clearCache(type: "all" | "api" | "static" | "database" = "all"): Promise<void> {
    try {
      await ApiClient.post("/api/settings/cache/clear", { type })
    } catch (error) {
      console.error("Clear cache error:", error)
      throw new Error("Erreur lors de la suppression du cache")
    }
  }

  static async exportSettings(): Promise<Blob> {
    try {
      const response = await ApiClient.get("/api/settings/export", {
        responseType: "blob",
      })
      return response
    } catch (error) {
      console.error("Export settings error:", error)
      throw new Error("Erreur lors de l'export des paramètres")
    }
  }

  static async importSettings(file: File): Promise<void> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      await ApiClient.post("/api/settings/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    } catch (error) {
      console.error("Import settings error:", error)
      throw new Error("Erreur lors de l'import des paramètres")
    }
  }

  static async resetToDefaults(section?: keyof SystemSettings): Promise<SystemSettings> {
    try {
      const response = await ApiClient.post<SystemSettings>("/api/settings/reset", { section })
      return response
    } catch (error) {
      console.error("Reset settings error:", error)
      throw new Error("Erreur lors de la réinitialisation des paramètres")
    }
  }

  static async getLogs(type: "error" | "access" | "system" | "audit", limit = 100): Promise<any[]> {
    try {
      const response = await ApiClient.get<any[]>(`/api/settings/logs/${type}?limit=${limit}`)
      return response
    } catch (error) {
      console.error("Get logs error:", error)
      throw new Error("Erreur lors de la récupération des logs")
    }
  }

  static async clearLogs(type: "error" | "access" | "system" | "audit"): Promise<void> {
    try {
      await ApiClient.delete(`/api/settings/logs/${type}`)
    } catch (error) {
      console.error("Clear logs error:", error)
      throw new Error("Erreur lors de la suppression des logs")
    }
  }

  // General Settings methods (new)
  static async getGeneralSettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/general")
      return response.data || response
    } catch (error) {
      console.error("Get general settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres généraux")
    }
  }

  static async updateGeneralSettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/general", settings)
      return response.data || response
    } catch (error) {
      console.error("Update general settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres généraux")
    }
  }

  // AI-specific settings methods
  static async getAISettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/ai")
      return response.data || response
    } catch (error) {
      console.error("Get AI settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres IA")
    }
  }

  static async updateAISettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/ai", settings)
      return response.data || response
    } catch (error) {
      console.error("Update AI settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres IA")
    }
  }

  // WhatsApp-specific settings methods
  static async getWhatsAppSettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/whatsapp")
      return response.data || response
    } catch (error) {
      console.error("Get WhatsApp settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres WhatsApp")
    }
  }

  static async updateWhatsAppSettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/whatsapp", settings)
      return response.data || response
    } catch (error) {
      console.error("Update WhatsApp settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres WhatsApp")
    }
  }

  // Business-specific settings methods
  static async getBusinessSettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/business")
      return response.data || response
    } catch (error) {
      console.error("Get Business settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres business")
    }
  }

  static async updateBusinessSettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/business", settings)
      return response.data || response
    } catch (error) {
      console.error("Update Business settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres business")
    }
  }

  // Security-specific settings methods
  static async getSecuritySettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/security")
      return response.data || response
    } catch (error) {
      console.error("Get Security settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres sécurité")
    }
  }

  static async updateSecuritySettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/security", settings)
      return response.data || response
    } catch (error) {
      console.error("Update Security settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres sécurité")
    }
  }

  // Notifications-specific settings methods
  static async getNotificationsSettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/notifications")
      return response.data || response
    } catch (error) {
      console.error("Get Notifications settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres notifications")
    }
  }

  static async updateNotificationsSettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/notifications", settings)
      return response.data || response
    } catch (error) {
      console.error("Update Notifications settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres notifications")
    }
  }

  // Performance-specific settings methods
  static async getPerformanceSettings(): Promise<any> {
    try {
      const response = await ApiClient.get<any>("/api/settings/performance")
      return response.data || response
    } catch (error) {
      console.error("Get Performance settings error:", error)
      throw new Error("Erreur lors de la récupération des paramètres performance")
    }
  }

  static async updatePerformanceSettings(settings: any): Promise<any> {
    try {
      const response = await ApiClient.post<any>("/api/settings/performance", settings)
      return response.data || response
    } catch (error) {
      console.error("Update Performance settings error:", error)
      throw new Error("Erreur lors de la mise à jour des paramètres performance")
    }
  }
}

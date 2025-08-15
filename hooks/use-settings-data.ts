"use client"

import { useState, useEffect, useCallback } from "react"
import { SettingsService } from "@/lib/services/settings-service"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export interface GeneralSettings {
  appName: string
  slogan: string
  targetCity: string
  timezone: string
  defaultLanguage: string
  currency: string
  coverageRadius: number
  services: Array<{
    id: string
    name: string
    description: string
    active: boolean
    commission: number
  }>
  zones: Array<{
    id: string
    name: string
    description: string
    status: string
    requestCount: number
  }>
  economicModel: {
    defaultCommission: number
    minMissionAmount: number
    maxMissionAmount: number
    paymentDelay: number
    serviceCommissions: Record<string, number>
  }
  system_version: string
  last_updated: string
}

export interface BusinessSettings {
  company_name: string
  address: string
  phone: string
  email: string
  website: string
  currency: string
  tax_rate: number
  commission_rate: number
  minimum_order: number
  working_hours_start: string
  working_hours_end: string
  working_days: string[]
  emergency_available: boolean
}

export interface AISettings {
  providers: Array<{
    name: string
    model: string
    temperature: number
    maxTokens: number
    enabled: boolean
    priority: number
    rateLimit: number
  }>
  defaultProvider: string
  globalSettings: {
    enabled: boolean
    timeout: number
    retryAttempts: number
  }
}

export interface WhatsAppSettings {
  business_account_id: string
  phone_number_id: string
  webhook_url: string
  enabled: boolean
  rate_limit: number
  templates: any[]
}

export interface SecuritySettings {
  password_min_length: number
  password_require_uppercase: boolean
  password_require_lowercase: boolean
  password_require_numbers: boolean
  password_require_symbols: boolean
  password_expiry_days: number
  max_login_attempts: number
  lockout_duration: number
  two_factor_enabled: boolean
  session_encryption: boolean
  api_rate_limit: number
}

export interface NotificationSettings {
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  whatsapp_notifications: boolean
  email_provider: string
  smtp_host: string
  smtp_port: number
  from_email: string
  from_name: string
}

export interface PerformanceSettings {
  cache_enabled: boolean
  cache_ttl: number
  cdn_enabled: boolean
  compression_enabled: boolean
  minify_assets: boolean
  lazy_loading: boolean
  image_optimization: boolean
  database_pool_size: number
  request_timeout: number
  max_file_size: number
}

export function useSettingsData() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null)
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null)
  const [aiSettings, setAISettings] = useState<AISettings | null>(null)
  const [whatsappSettings, setWhatsAppSettings] = useState<WhatsAppSettings | null>(null)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()

  // General Settings
  const fetchGeneralSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching general settings...")
      
      const result = await SettingsService.getGeneralSettings()
      setGeneralSettings(result)
      console.log("✅ General settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres généraux"
      setError(message)
      console.error("❌ Failed to fetch general settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateGeneralSettings = useCallback(async (data: Partial<GeneralSettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating general settings:", data)
      
      const result = await SettingsService.updateGeneralSettings(data)
      setGeneralSettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres généraux mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres généraux"
      console.error("❌ Failed to update general settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Business Settings
  const fetchBusinessSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching business settings...")
      
      const result = await SettingsService.getBusinessSettings()
      setBusinessSettings(result)
      console.log("✅ Business settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres business"
      setError(message)
      console.error("❌ Failed to fetch business settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateBusinessSettings = useCallback(async (data: Partial<BusinessSettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating business settings:", data)
      
      const result = await SettingsService.updateBusinessSettings(data)
      setBusinessSettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres business mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres business"
      console.error("❌ Failed to update business settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // AI Settings
  const fetchAISettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching AI settings...")
      
      const result = await SettingsService.getAISettings()
      setAISettings(result)
      console.log("✅ AI settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres IA"
      setError(message)
      console.error("❌ Failed to fetch AI settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateAISettings = useCallback(async (data: Partial<AISettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating AI settings:", data)
      
      const result = await SettingsService.updateAISettings(data)
      setAISettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres IA mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres IA"
      console.error("❌ Failed to update AI settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // WhatsApp Settings
  const fetchWhatsAppSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching WhatsApp settings...")
      
      const result = await SettingsService.getWhatsAppSettings()
      setWhatsAppSettings(result)
      console.log("✅ WhatsApp settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres WhatsApp"
      setError(message)
      console.error("❌ Failed to fetch WhatsApp settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateWhatsAppSettings = useCallback(async (data: Partial<WhatsAppSettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating WhatsApp settings:", data)
      
      const result = await SettingsService.updateWhatsAppSettings(data)
      setWhatsAppSettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres WhatsApp mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres WhatsApp"
      console.error("❌ Failed to update WhatsApp settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Security Settings
  const fetchSecuritySettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching security settings...")
      
      const result = await SettingsService.getSecuritySettings()
      setSecuritySettings(result)
      console.log("✅ Security settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres sécurité"
      setError(message)
      console.error("❌ Failed to fetch security settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateSecuritySettings = useCallback(async (data: Partial<SecuritySettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating security settings:", data)
      
      const result = await SettingsService.updateSecuritySettings(data)
      setSecuritySettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres sécurité mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres sécurité"
      console.error("❌ Failed to update security settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Notification Settings
  const fetchNotificationSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching notification settings...")
      
      const result = await SettingsService.getNotificationsSettings()
      setNotificationSettings(result)
      console.log("✅ Notification settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres notifications"
      setError(message)
      console.error("❌ Failed to fetch notification settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateNotificationSettings = useCallback(async (data: Partial<NotificationSettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating notification settings:", data)
      
      const result = await SettingsService.updateNotificationsSettings(data)
      setNotificationSettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres notifications mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres notifications"
      console.error("❌ Failed to update notification settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Performance Settings
  const fetchPerformanceSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching performance settings...")
      
      const result = await SettingsService.getPerformanceSettings()
      setPerformanceSettings(result)
      console.log("✅ Performance settings loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des paramètres performance"
      setError(message)
      console.error("❌ Failed to fetch performance settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updatePerformanceSettings = useCallback(async (data: Partial<PerformanceSettings>) => {
    try {
      setLoading(true)
      console.log("✏️ Updating performance settings:", data)
      
      const result = await SettingsService.updatePerformanceSettings(data)
      setPerformanceSettings(result)
      
      toast({
        title: "Succès",
        description: "Paramètres performance mis à jour avec succès",
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des paramètres performance"
      console.error("❌ Failed to update performance settings:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    // Data
    generalSettings,
    businessSettings,
    aiSettings,
    whatsappSettings,
    securitySettings,
    notificationSettings,
    performanceSettings,
    
    // State
    loading,
    error,
    
    // General Settings
    fetchGeneralSettings,
    updateGeneralSettings,
    
    // Business Settings
    fetchBusinessSettings,
    updateBusinessSettings,
    
    // AI Settings
    fetchAISettings,
    updateAISettings,
    
    // WhatsApp Settings
    fetchWhatsAppSettings,
    updateWhatsAppSettings,
    
    // Security Settings
    fetchSecuritySettings,
    updateSecuritySettings,
    
    // Notification Settings
    fetchNotificationSettings,
    updateNotificationSettings,
    
    // Performance Settings
    fetchPerformanceSettings,
    updatePerformanceSettings,
  }
}
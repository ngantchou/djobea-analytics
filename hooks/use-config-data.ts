"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

interface ServiceOption {
  value: string
  label: string
}

interface ZoneOption {
  value: string
  label: string
}

interface PriorityOption {
  value: string
  label: string
  description: string
  color: string
}

interface SchedulingOption {
  value: string
  label: string
  description: string
}

interface StatusOption {
  value: string
  label: string
  description: string
  color: string
}

interface AppConfig {
  app: {
    name: string
    version: string
    timezone: string
    currency: string
    language: string
    country: string
  }
  features: {
    realtime: boolean
    notifications: boolean
    exports: boolean
    geolocation: boolean
    analytics: boolean
    ai: boolean
    payments: boolean
  }
  limits: {
    maxFileSize: number
    maxDescriptionLength: number
    maxNotesLength: number
    requestsPerPage: number
  }
  formats: {
    dateFormat: string
    timeFormat: string
    numberFormat: string
  }
}

interface ConfigData {
  services: ServiceOption[]
  zones: ZoneOption[]
  priorities: PriorityOption[]
  scheduling: SchedulingOption[]
  statuses: StatusOption[]
  appConfig: AppConfig
}

export function useConfigData() {
  const [data, setData] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchConfigData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all configuration data in parallel
      const [
        servicesResponse,
        zonesResponse,
        prioritiesResponse,
        schedulingResponse,
        statusResponse,
        appConfigResponse
      ] = await Promise.all([
        apiClient.get('/api/config/services'),
        apiClient.get('/api/config/zones'),
        apiClient.get('/api/config/priorities'),
        apiClient.get('/api/config/scheduling'),
        apiClient.get('/api/config/status'),
        apiClient.get('/api/config/app-config')
      ])

      // Transform services data
      const services: ServiceOption[] = servicesResponse.data.services?.map((service: string) => ({
        value: service,
        label: service
      })) || []

      // Transform zones data
      const zones: ZoneOption[] = zonesResponse.data.zones?.map((zone: string) => ({
        value: zone,
        label: zone
      })) || []

      // Transform priorities data
      const priorities: PriorityOption[] = prioritiesResponse.data.priorities || []

      // Transform scheduling data
      const scheduling: SchedulingOption[] = schedulingResponse.data.scheduling || []

      // Transform status data
      const statuses: StatusOption[] = statusResponse.data.statuses || []

      // Get app config
      const appConfig: AppConfig = appConfigResponse.data

      setData({
        services,
        zones,
        priorities,
        scheduling,
        statuses,
        appConfig
      })

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement de la configuration"
      setError(message)
      logger.error("Failed to fetch config data", { error: err })

      // Use fallback data if API fails
      setData({
        services: getDefaultServices(),
        zones: getDefaultZones(),
        priorities: getDefaultPriorities(),
        scheduling: getDefaultScheduling(),
        statuses: getDefaultStatuses(),
        appConfig: getDefaultAppConfig()
      })

      toast({
        title: "Configuration",
        description: "Utilisation des valeurs par défaut",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchConfigData()
  }, [fetchConfigData])

  const refetch = useCallback(() => {
    fetchConfigData()
  }, [fetchConfigData])

  // Utility functions to get specific config data
  const getServiceOptions = useCallback(() => {
    return data?.services || getDefaultServices()
  }, [data])

  const getZoneOptions = useCallback(() => {
    return data?.zones || getDefaultZones()
  }, [data])

  const getPriorityOptions = useCallback(() => {
    return data?.priorities || getDefaultPriorities()
  }, [data])

  const getSchedulingOptions = useCallback(() => {
    return data?.scheduling || getDefaultScheduling()
  }, [data])

  const getStatusOptions = useCallback(() => {
    return data?.statuses || getDefaultStatuses()
  }, [data])

  const getAppConfig = useCallback(() => {
    return data?.appConfig || getDefaultAppConfig()
  }, [data])

  return {
    data,
    loading,
    error,
    refetch,
    getServiceOptions,
    getZoneOptions,
    getPriorityOptions,
    getSchedulingOptions,
    getStatusOptions,
    getAppConfig
  }
}

// Default fallback data
function getDefaultServices(): ServiceOption[] {
  return [
    { value: "Électricité", label: "Électricité" },
    { value: "Plomberie", label: "Plomberie" },
    { value: "Ménage", label: "Ménage" },
    { value: "Jardinage", label: "Jardinage" },
    { value: "Électroménager", label: "Électroménager" },
    { value: "Climatisation", label: "Climatisation" },
    { value: "Peinture", label: "Peinture" },
    { value: "Maçonnerie", label: "Maçonnerie" },
    { value: "Menuiserie", label: "Menuiserie" },
    { value: "Informatique", label: "Informatique" },
    { value: "Mécanique", label: "Mécanique" },
    { value: "Livraison", label: "Livraison" }
  ]
}

function getDefaultZones(): ZoneOption[] {
  return [
    { value: "Bonamoussadi", label: "Bonamoussadi" },
    { value: "Akwa", label: "Akwa" },
    { value: "Deido", label: "Deido" },
    { value: "Bonapriso", label: "Bonapriso" },
    { value: "Bali", label: "Bali" },
    { value: "Makepe", label: "Makepe" },
    { value: "Ndogpassi", label: "Ndogpassi" },
    { value: "PK8", label: "PK8" },
    { value: "Logpom", label: "Logpom" },
    { value: "Bassa", label: "Bassa" },
    { value: "Kotto", label: "Kotto" }
  ]
}

function getDefaultPriorities(): PriorityOption[] {
  return [
    {
      value: "low",
      label: "Faible",
      description: "Non urgent, flexible sur les délais",
      color: "green"
    },
    {
      value: "normal",
      label: "Normale",
      description: "Délai standard, dans la semaine",
      color: "blue"
    },
    {
      value: "high",
      label: "Élevée",
      description: "Important, dans les 2-3 jours",
      color: "orange"
    },
    {
      value: "urgent",
      label: "Urgent",
      description: "Très important, dans la journée",
      color: "red"
    }
  ]
}

function getDefaultScheduling(): SchedulingOption[] {
  return [
    {
      value: "flexible",
      label: "Flexible",
      description: "Aucune contrainte de temps"
    },
    {
      value: "morning",
      label: "Matin",
      description: "Entre 8h et 12h"
    },
    {
      value: "afternoon",
      label: "Après-midi",
      description: "Entre 12h et 17h"
    },
    {
      value: "evening",
      label: "Soir",
      description: "Entre 17h et 20h"
    },
    {
      value: "weekend",
      label: "Week-end",
      description: "Samedi ou dimanche"
    },
    {
      value: "specific",
      label: "Date précise",
      description: "Date et heure spécifiques"
    }
  ]
}

function getDefaultStatuses(): StatusOption[] {
  return [
    {
      value: "pending",
      label: "En attente",
      description: "Demande créée, en attente d'attribution",
      color: "yellow"
    },
    {
      value: "assigned",
      label: "Assignée",
      description: "Assignée à un prestataire",
      color: "blue"
    },
    {
      value: "in_progress",
      label: "En cours",
      description: "Service en cours d'exécution",
      color: "purple"
    },
    {
      value: "completed",
      label: "Terminée",
      description: "Service terminé avec succès",
      color: "green"
    },
    {
      value: "cancelled",
      label: "Annulée",
      description: "Demande annulée",
      color: "red"
    }
  ]
}

function getDefaultAppConfig(): AppConfig {
  return {
    app: {
      name: "Djobea Analytics",
      version: "1.0.0",
      timezone: "Africa/Douala",
      currency: "FCFA",
      language: "fr",
      country: "CM"
    },
    features: {
      realtime: true,
      notifications: true,
      exports: true,
      geolocation: true,
      analytics: true,
      ai: false,
      payments: true
    },
    limits: {
      maxFileSize: 5242880, // 5MB
      maxDescriptionLength: 1000,
      maxNotesLength: 500,
      requestsPerPage: 20
    },
    formats: {
      dateFormat: "DD/MM/YYYY",
      timeFormat: "HH:mm",
      numberFormat: "fr-FR"
    }
  }
}
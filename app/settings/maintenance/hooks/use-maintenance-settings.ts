"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export interface MaintenanceSettings {
  scheduledWindow: {
    dayOfWeek: number
    startTime: string
    endTime: string
    timezone: string
  }
  preNotificationHours: number
  maintenancePageEnabled: boolean
  autoRollbackEnabled: boolean
  rollbackTimeoutMinutes: number
  maintenanceMessage: string
  allowedIPs: string[]
}

export interface DeploymentSettings {
  environments: string[]
  currentEnvironment: string
  blueGreenEnabled: boolean
  automatedTesting: boolean
  featureFlagsEnabled: boolean
  rolloutPercentage: number
  deploymentStrategy: "rolling" | "blue-green" | "canary"
  healthCheckUrl: string
  maxDeploymentTime: number
}

export interface SystemStatus {
  uptime: number
  lastMaintenance: string
  nextMaintenance: string
  deploymentsToday: number
  environment: string
  version: string
  healthScore: number
  activeIncidents: number
}

export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  environments: string[]
  createdAt: string
  updatedAt: string
  conditions?: {
    userSegment?: string
    region?: string
    version?: string
  }
}

export interface DeploymentHistory {
  id: string
  version: string
  environment: string
  status: "success" | "failed" | "in-progress" | "rolled-back"
  timestamp: string
  duration: number
  deployedBy: string
  changes: string[]
}

export function useMaintenanceSettings() {
  const [loading, setLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)

  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    scheduledWindow: {
      dayOfWeek: 0,
      startTime: "02:00",
      endTime: "04:00",
      timezone: "Africa/Douala",
    },
    preNotificationHours: 48,
    maintenancePageEnabled: true,
    autoRollbackEnabled: true,
    rollbackTimeoutMinutes: 30,
    maintenanceMessage:
      "Nous effectuons une maintenance programmée pour améliorer nos services. Nous serons de retour bientôt.",
    allowedIPs: ["192.168.1.1", "10.0.0.1"],
  })

  const [deploymentSettings, setDeploymentSettings] = useState<DeploymentSettings>({
    environments: ["development", "staging", "production"],
    currentEnvironment: "production",
    blueGreenEnabled: true,
    automatedTesting: true,
    featureFlagsEnabled: true,
    rolloutPercentage: 100,
    deploymentStrategy: "blue-green",
    healthCheckUrl: "/api/health",
    maxDeploymentTime: 30,
  })

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    uptime: 99.9,
    lastMaintenance: "2025-01-07 02:00",
    nextMaintenance: "2025-01-14 02:00",
    deploymentsToday: 3,
    environment: "production",
    version: "1.2.3",
    healthScore: 95,
    activeIncidents: 0,
  })

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: "new-matching-algorithm",
      name: "Nouvel algorithme de matching",
      description: "Amélioration de l'algorithme de matching prestataires",
      enabled: true,
      rolloutPercentage: 50,
      environments: ["staging", "production"],
      createdAt: "2025-01-01T10:00:00Z",
      updatedAt: "2025-01-07T15:30:00Z",
      conditions: {
        userSegment: "premium",
        region: "cameroon",
      },
    },
    {
      id: "enhanced-notifications",
      name: "Notifications améliorées",
      description: "Nouveau système de notifications push",
      enabled: false,
      rolloutPercentage: 0,
      environments: ["development"],
      createdAt: "2025-01-05T14:00:00Z",
      updatedAt: "2025-01-05T14:00:00Z",
    },
    {
      id: "ai-conversation-v2",
      name: "IA Conversation v2",
      description: "Nouvelle version de l'IA conversationnelle",
      enabled: true,
      rolloutPercentage: 100,
      environments: ["development", "staging", "production"],
      createdAt: "2024-12-20T09:00:00Z",
      updatedAt: "2025-01-03T11:15:00Z",
      conditions: {
        version: ">=1.2.0",
      },
    },
  ])

  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([
    {
      id: "dep-001",
      version: "1.2.3",
      environment: "production",
      status: "success",
      timestamp: "2025-01-10T14:30:00Z",
      duration: 12,
      deployedBy: "admin@djobea.com",
      changes: ["Fix matching algorithm", "Update UI components", "Security patches"],
    },
    {
      id: "dep-002",
      version: "1.2.2",
      environment: "staging",
      status: "success",
      timestamp: "2025-01-10T10:15:00Z",
      duration: 8,
      deployedBy: "dev@djobea.com",
      changes: ["Feature flags implementation", "Performance improvements"],
    },
    {
      id: "dep-003",
      version: "1.2.1",
      environment: "production",
      status: "rolled-back",
      timestamp: "2025-01-09T16:45:00Z",
      duration: 25,
      deployedBy: "admin@djobea.com",
      changes: ["Database migration", "API updates"],
    },
  ])

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [maintenanceSettings, deploymentSettings, featureFlags])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings/maintenance")
      if (response.ok) {
        const data = await response.json()
        setMaintenanceSettings(data.maintenance || maintenanceSettings)
        setDeploymentSettings(data.deployment || deploymentSettings)
        setSystemStatus(data.status || systemStatus)
        setFeatureFlags(data.featureFlags || featureFlags)
        setIsMaintenanceMode(data.maintenanceMode || false)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance: maintenanceSettings,
          deployment: deploymentSettings,
          featureFlags: featureFlags,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setHasUnsavedChanges(false)
      toast.success("Configuration maintenance sauvegardée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = () => {
    setMaintenanceSettings({
      scheduledWindow: {
        dayOfWeek: 0,
        startTime: "02:00",
        endTime: "04:00",
        timezone: "Africa/Douala",
      },
      preNotificationHours: 48,
      maintenancePageEnabled: true,
      autoRollbackEnabled: true,
      rollbackTimeoutMinutes: 30,
      maintenanceMessage:
        "Nous effectuons une maintenance programmée pour améliorer nos services. Nous serons de retour bientôt.",
      allowedIPs: ["192.168.1.1", "10.0.0.1"],
    })
    setDeploymentSettings({
      environments: ["development", "staging", "production"],
      currentEnvironment: "production",
      blueGreenEnabled: true,
      automatedTesting: true,
      featureFlagsEnabled: true,
      rolloutPercentage: 100,
      deploymentStrategy: "blue-green",
      healthCheckUrl: "/api/health",
      maxDeploymentTime: 30,
    })
    setHasUnsavedChanges(true)
    toast.success("Configuration réinitialisée")
  }

  const handleTestSystem = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/maintenance/test", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Test failed")
      }

      const results = await response.json()
      toast.success(`Tests système réussis (${results.passed}/${results.total})`)
    } catch (error) {
      toast.error("Erreur lors des tests système")
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    hasUnsavedChanges,
    maintenanceSettings,
    deploymentSettings,
    systemStatus,
    featureFlags,
    deploymentHistory,
    isMaintenanceMode,
    handleSaveSettings,
    handleResetSettings,
    handleTestSystem,
    setMaintenanceSettings,
    setDeploymentSettings,
    setFeatureFlags,
    setIsMaintenanceMode,
    setSystemStatus,
    setDeploymentHistory,
  }
}

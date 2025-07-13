"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Download,
  Code,
  Settings,
  Shield,
  Zap,
  Bell,
  Users,
  Database,
  Wrench,
  Building,
  Bot,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsEndpoint {
  path: string
  method: string
  summary: string
  description: string
  category: string
  parameters?: any[]
  requestBody?: any
  responses: any
  example?: string
}

export default function SettingsApiDocsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Settings API endpoints
  const endpoints: SettingsEndpoint[] = [
    // General Settings
    {
      path: "/api/settings",
      method: "GET",
      summary: "Récupérer les paramètres généraux",
      description: "Obtient la configuration générale de l'application",
      category: "general",
      responses: {
        "200": { description: "Paramètres récupérés avec succès" },
        "401": { description: "Non autorisé" },
      },
      example: `{
  "appName": "Djobea Analytics",
  "timezone": "Africa/Douala",
  "language": "fr",
  "currency": "XAF"
}`,
    },
    {
      path: "/api/settings",
      method: "POST",
      summary: "Mettre à jour les paramètres généraux",
      description: "Met à jour la configuration générale de l'application",
      category: "general",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                appName: { type: "string" },
                timezone: { type: "string" },
                language: { type: "string" },
                currency: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Paramètres mis à jour avec succès" },
        "400": { description: "Données invalides" },
        "401": { description: "Non autorisé" },
      },
    },

    // Notifications
    {
      path: "/api/settings/notifications",
      method: "GET",
      summary: "Récupérer les paramètres de notification",
      description: "Obtient la configuration des notifications (email, SMS, push, WhatsApp)",
      category: "notifications",
      responses: {
        "200": { description: "Paramètres de notification récupérés" },
      },
      example: `{
  "email": {
    "enabled": true,
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false
    }
  },
  "sms": {
    "enabled": true,
    "provider": "twilio"
  },
  "push": {
    "enabled": true,
    "vapidKeys": {...}
  },
  "whatsapp": {
    "enabled": true,
    "businessAccountId": "123456789"
  }
}`,
    },
    {
      path: "/api/settings/notifications",
      method: "POST",
      summary: "Mettre à jour les paramètres de notification",
      description: "Configure les paramètres de notification pour tous les canaux",
      category: "notifications",
      responses: {
        "200": { description: "Paramètres de notification mis à jour" },
      },
    },
    {
      path: "/api/settings/notifications/test",
      method: "POST",
      summary: "Tester les notifications",
      description: "Envoie une notification de test pour valider la configuration",
      category: "notifications",
      responses: {
        "200": { description: "Test de notification réussi" },
      },
    },

    // Security
    {
      path: "/api/settings/security",
      method: "GET",
      summary: "Récupérer les paramètres de sécurité",
      description: "Obtient la configuration de sécurité et d'authentification",
      category: "security",
      responses: {
        "200": { description: "Paramètres de sécurité récupérés" },
      },
      example: `{
  "authentication": {
    "jwtExpiration": "24h",
    "refreshTokenExpiration": "7d",
    "maxLoginAttempts": 5
  },
  "encryption": {
    "algorithm": "AES-256-GCM",
    "keyRotationInterval": "30d"
  },
  "compliance": {
    "gdprEnabled": true,
    "dataRetentionDays": 365
  }
}`,
    },
    {
      path: "/api/settings/security",
      method: "POST",
      summary: "Mettre à jour les paramètres de sécurité",
      description: "Configure les paramètres de sécurité et de conformité",
      category: "security",
      responses: {
        "200": { description: "Paramètres de sécurité mis à jour" },
      },
    },

    // Performance
    {
      path: "/api/settings/performance",
      method: "GET",
      summary: "Récupérer les paramètres de performance",
      description: "Obtient la configuration de performance et d'optimisation",
      category: "performance",
      responses: {
        "200": { description: "Paramètres de performance récupérés" },
      },
      example: `{
  "cache": {
    "redisEnabled": true,
    "ttl": 300,
    "maxMemory": "512mb"
  },
  "cdn": {
    "enabled": true,
    "provider": "cloudflare",
    "regions": ["europe", "africa"]
  },
  "optimization": {
    "imageCompression": true,
    "minifyAssets": true,
    "gzipEnabled": true
  }
}`,
    },
    {
      path: "/api/settings/performance",
      method: "POST",
      summary: "Mettre à jour les paramètres de performance",
      description: "Configure les paramètres de performance et d'optimisation",
      category: "performance",
      responses: {
        "200": { description: "Paramètres de performance mis à jour" },
      },
    },

    // AI Settings
    {
      path: "/api/settings/ai",
      method: "GET",
      summary: "Récupérer les paramètres IA",
      description: "Obtient la configuration des fonctionnalités d'intelligence artificielle",
      category: "ai",
      responses: {
        "200": { description: "Paramètres IA récupérés" },
      },
      example: `{
  "predictions": {
    "enabled": true,
    "model": "gpt-4",
    "confidence": 0.8
  },
  "autoAssignment": {
    "enabled": true,
    "algorithm": "ml-based"
  },
  "chatbot": {
    "enabled": true,
    "language": "fr",
    "fallbackToHuman": true
  }
}`,
    },
    {
      path: "/api/settings/ai",
      method: "POST",
      summary: "Mettre à jour les paramètres IA",
      description: "Configure les fonctionnalités d'intelligence artificielle",
      category: "ai",
      responses: {
        "200": { description: "Paramètres IA mis à jour" },
      },
    },

    // WhatsApp
    {
      path: "/api/settings/whatsapp",
      method: "GET",
      summary: "Récupérer les paramètres WhatsApp",
      description: "Obtient la configuration de l'intégration WhatsApp Business",
      category: "whatsapp",
      responses: {
        "200": { description: "Paramètres WhatsApp récupérés" },
      },
      example: `{
  "businessAccount": {
    "id": "123456789",
    "name": "Djobea Services",
    "verified": true
  },
  "webhook": {
    "url": "https://api.djobea.com/webhook/whatsapp",
    "verifyToken": "secure_token"
  },
  "templates": {
    "welcome": "template_id_1",
    "confirmation": "template_id_2"
  }
}`,
    },
    {
      path: "/api/settings/whatsapp",
      method: "POST",
      summary: "Mettre à jour les paramètres WhatsApp",
      description: "Configure l'intégration WhatsApp Business",
      category: "whatsapp",
      responses: {
        "200": { description: "Paramètres WhatsApp mis à jour" },
      },
    },

    // Business
    {
      path: "/api/settings/business",
      method: "GET",
      summary: "Récupérer les paramètres business",
      description: "Obtient la configuration business et opérationnelle",
      category: "business",
      responses: {
        "200": { description: "Paramètres business récupérés" },
      },
      example: `{
  "company": {
    "name": "Djobea SARL",
    "address": "Douala, Cameroun",
    "phone": "+237 6 XX XX XX XX",
    "email": "contact@djobea.com"
  },
  "pricing": {
    "commission": 15,
    "currency": "XAF",
    "taxRate": 19.25
  },
  "operations": {
    "workingHours": "08:00-18:00",
    "timezone": "Africa/Douala",
    "serviceRadius": 50
  }
}`,
    },
    {
      path: "/api/settings/business",
      method: "POST",
      summary: "Mettre à jour les paramètres business",
      description: "Configure les paramètres business et opérationnels",
      category: "business",
      responses: {
        "200": { description: "Paramètres business mis à jour" },
      },
    },

    // Providers
    {
      path: "/api/settings/providers",
      method: "GET",
      summary: "Récupérer les paramètres prestataires",
      description: "Obtient la configuration de gestion des prestataires",
      category: "providers",
      responses: {
        "200": { description: "Paramètres prestataires récupérés" },
      },
      example: `{
  "validation": {
    "requireDocuments": true,
    "backgroundCheck": true,
    "minimumRating": 4.0
  },
  "commission": {
    "rate": 15,
    "paymentSchedule": "weekly"
  },
  "ratings": {
    "minimumReviews": 5,
    "autoSuspendThreshold": 3.0
  }
}`,
    },
    {
      path: "/api/settings/providers",
      method: "POST",
      summary: "Mettre à jour les paramètres prestataires",
      description: "Configure la gestion des prestataires",
      category: "providers",
      responses: {
        "200": { description: "Paramètres prestataires mis à jour" },
      },
    },
    {
      path: "/api/settings/providers/test",
      method: "POST",
      summary: "Tester la validation prestataire",
      description: "Teste le processus de validation d'un prestataire",
      category: "providers",
      responses: {
        "200": { description: "Test de validation réussi" },
      },
    },

    // Requests
    {
      path: "/api/settings/requests",
      method: "GET",
      summary: "Récupérer les paramètres demandes",
      description: "Obtient la configuration de traitement des demandes",
      category: "requests",
      responses: {
        "200": { description: "Paramètres demandes récupérés" },
      },
      example: `{
  "processing": {
    "autoAssignment": true,
    "maxAssignmentTime": 30,
    "priorityLevels": ["low", "normal", "high", "urgent"]
  },
  "matching": {
    "algorithm": "distance_rating",
    "maxDistance": 25,
    "minimumRating": 4.0
  },
  "notifications": {
    "clientUpdates": true,
    "providerAlerts": true,
    "adminNotifications": true
  }
}`,
    },
    {
      path: "/api/settings/requests",
      method: "POST",
      summary: "Mettre à jour les paramètres demandes",
      description: "Configure le traitement des demandes",
      category: "requests",
      responses: {
        "200": { description: "Paramètres demandes mis à jour" },
      },
    },
    {
      path: "/api/settings/requests/test-matching",
      method: "POST",
      summary: "Tester l'algorithme de matching",
      description: "Teste l'algorithme d'attribution des demandes",
      category: "requests",
      responses: {
        "200": { description: "Test d'algorithme réussi" },
      },
    },

    // Administration
    {
      path: "/api/settings/admin",
      method: "GET",
      summary: "Récupérer les paramètres admin",
      description: "Obtient la configuration d'administration système",
      category: "admin",
      responses: {
        "200": { description: "Paramètres admin récupérés" },
      },
      example: `{
  "users": {
    "maxAdmins": 5,
    "sessionTimeout": 3600,
    "passwordPolicy": {
      "minLength": 8,
      "requireSpecialChars": true
    }
  },
  "roles": {
    "superAdmin": ["all"],
    "admin": ["read", "write"],
    "moderator": ["read"]
  },
  "system": {
    "maintenanceMode": false,
    "debugMode": false,
    "logLevel": "info"
  }
}`,
    },
    {
      path: "/api/settings/admin",
      method: "POST",
      summary: "Mettre à jour les paramètres admin",
      description: "Configure l'administration système",
      category: "admin",
      responses: {
        "200": { description: "Paramètres admin mis à jour" },
      },
    },
    {
      path: "/api/settings/admin/test",
      method: "POST",
      summary: "Tester la configuration admin",
      description: "Valide la configuration d'administration",
      category: "admin",
      responses: {
        "200": { description: "Test de configuration réussi" },
      },
    },

    // Maintenance
    {
      path: "/api/settings/maintenance",
      method: "GET",
      summary: "Récupérer les paramètres de maintenance",
      description: "Obtient la configuration de maintenance et déploiement",
      category: "maintenance",
      responses: {
        "200": { description: "Paramètres de maintenance récupérés" },
      },
      example: `{
  "mode": {
    "enabled": false,
    "message": "Maintenance en cours...",
    "estimatedDuration": "30 minutes"
  },
  "deployment": {
    "autoBackup": true,
    "rollbackEnabled": true,
    "healthChecks": true
  },
  "featureFlags": {
    "newDashboard": true,
    "aiPredictions": false,
    "whatsappIntegration": true
  }
}`,
    },
    {
      path: "/api/settings/maintenance",
      method: "POST",
      summary: "Mettre à jour les paramètres de maintenance",
      description: "Configure la maintenance et les déploiements",
      category: "maintenance",
      responses: {
        "200": { description: "Paramètres de maintenance mis à jour" },
      },
    },
    {
      path: "/api/settings/maintenance/toggle",
      method: "POST",
      summary: "Basculer le mode maintenance",
      description: "Active ou désactive le mode maintenance",
      category: "maintenance",
      responses: {
        "200": { description: "Mode maintenance basculé" },
      },
    },
    {
      path: "/api/settings/maintenance/deploy",
      method: "POST",
      summary: "Déclencher un déploiement",
      description: "Lance un processus de déploiement",
      category: "maintenance",
      responses: {
        "200": { description: "Déploiement lancé" },
      },
    },
    {
      path: "/api/settings/maintenance/feature-flags",
      method: "GET",
      summary: "Récupérer les feature flags",
      description: "Obtient la liste des feature flags",
      category: "maintenance",
      responses: {
        "200": { description: "Feature flags récupérés" },
      },
    },
    {
      path: "/api/settings/maintenance/feature-flags",
      method: "POST",
      summary: "Créer un feature flag",
      description: "Crée un nouveau feature flag",
      category: "maintenance",
      responses: {
        "201": { description: "Feature flag créé" },
      },
    },
    {
      path: "/api/settings/maintenance/feature-flags/[id]",
      method: "PUT",
      summary: "Mettre à jour un feature flag",
      description: "Met à jour un feature flag existant",
      category: "maintenance",
      responses: {
        "200": { description: "Feature flag mis à jour" },
      },
    },
    {
      path: "/api/settings/maintenance/feature-flags/[id]/toggle",
      method: "POST",
      summary: "Basculer un feature flag",
      description: "Active ou désactive un feature flag",
      category: "maintenance",
      responses: {
        "200": { description: "Feature flag basculé" },
      },
    },
    {
      path: "/api/settings/maintenance/test",
      method: "POST",
      summary: "Tester la configuration maintenance",
      description: "Valide la configuration de maintenance",
      category: "maintenance",
      responses: {
        "200": { description: "Test de maintenance réussi" },
      },
    },
  ]

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((endpoint) => {
      const matchesSearch =
        endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [endpoints, searchTerm, selectedCategory])

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = new Set<string>()
    endpoints.forEach((endpoint) => {
      allCategories.add(endpoint.category)
    })
    return Array.from(allCategories).sort()
  }, [endpoints])

  const categoryInfo = {
    general: { icon: Settings, label: "Général", color: "text-blue-400" },
    notifications: { icon: Bell, label: "Notifications", color: "text-yellow-400" },
    security: { icon: Shield, label: "Sécurité", color: "text-red-400" },
    performance: { icon: Zap, label: "Performance", color: "text-green-400" },
    ai: { icon: Bot, label: "Intelligence Artificielle", color: "text-purple-400" },
    whatsapp: { icon: Users, label: "WhatsApp", color: "text-green-500" },
    business: { icon: Building, label: "Business", color: "text-orange-400" },
    providers: { icon: Users, label: "Prestataires", color: "text-cyan-400" },
    requests: { icon: Database, label: "Demandes", color: "text-pink-400" },
    admin: { icon: Shield, label: "Administration", color: "text-indigo-400" },
    maintenance: { icon: Wrench, label: "Maintenance", color: "text-gray-400" },
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "POST":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "PUT":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "DELETE":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "PATCH":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const downloadApiDoc = () => {
    const apiDoc = {
      title: "Djobea Settings API Documentation",
      version: "1.2.0",
      description: "API complète pour la gestion des paramètres de configuration",
      baseUrl: "https://djobea-analytics.vercel.app",
      endpoints: endpoints,
    }

    const dataStr = JSON.stringify(apiDoc, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "djobea-settings-api.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                API Paramètres Djobea
              </h1>
              <p className="text-gray-400 text-lg">Documentation complète des APIs de configuration et paramètres</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  <Settings className="w-3 h-3 mr-1" />
                  Version 1.2.0
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  <Database className="w-3 h-3 mr-1" />
                  {endpoints.length} Endpoints
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  <Wrench className="w-3 h-3 mr-1" />
                  11 Modules
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={downloadApiDoc}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger JSON
              </Button>
              <Button
                onClick={() => window.open("/api-docs", "_blank")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Code className="w-4 h-4 mr-2" />
                API Complète
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher des endpoints de paramètres..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className={selectedCategory === "all" ? "" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                  >
                    Tous ({endpoints.length})
                  </Button>
                  {categories.map((category) => {
                    const info = categoryInfo[category as keyof typeof categoryInfo]
                    const Icon = info?.icon || Settings
                    return (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category ? "" : "border-gray-600 text-gray-300 hover:bg-gray-700"
                        }
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {info?.label || category} ({endpoints.filter((e) => e.category === category).length})
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="authentication" className="data-[state=active]:bg-gray-700">
                Authentification
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-gray-700">
                Exemples
              </TabsTrigger>
              <TabsTrigger value="modules" className="data-[state=active]:bg-gray-700">
                Modules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">À propos de l'API Paramètres</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>
                    L'API Paramètres Djobea permet de gérer toute la configuration de la plateforme de services à
                    domicile. Elle couvre 11 modules principaux avec des endpoints CRUD complets et des fonctionnalités
                    de test.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Fonctionnalités principales</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Configuration générale de l'application</li>
                        <li>• Gestion des notifications multi-canaux</li>
                        <li>• Paramètres de sécurité et conformité</li>
                        <li>• Optimisation des performances</li>
                        <li>• Intelligence artificielle et automatisation</li>
                        <li>• Intégration WhatsApp Business</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Modules avancés</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Configuration business et opérationnelle</li>
                        <li>• Gestion des prestataires</li>
                        <li>• Traitement des demandes</li>
                        <li>• Administration système</li>
                        <li>• Maintenance et déploiement</li>
                        <li>• Feature flags et rollout</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="mt-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Authentification</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>
                    Toutes les APIs de paramètres nécessitent une authentification avec des privilèges administrateur.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Bearer Token (JWT)</h4>
                      <p className="text-sm mb-2">Ajoutez le token dans l'en-tête Authorization :</p>
                      <code className="block bg-gray-900 p-2 rounded text-green-400 text-sm">
                        Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
                      </code>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Permissions requises</h4>
                      <p className="text-sm mb-2">Les endpoints de paramètres nécessitent :</p>
                      <ul className="text-sm space-y-1">
                        <li>
                          • <code className="text-blue-400">admin:read</code> - Pour les endpoints GET
                        </li>
                        <li>
                          • <code className="text-blue-400">admin:write</code> - Pour les endpoints POST/PUT
                        </li>
                        <li>
                          • <code className="text-blue-400">admin:test</code> - Pour les endpoints de test
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Exemples d'utilisation</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Récupérer les paramètres de notification</h4>
                    <code className="block bg-gray-900 p-3 rounded text-green-400 text-sm whitespace-pre">
                      {`curl -X GET "https://djobea-analytics.vercel.app/api/settings/notifications" \\
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \\
  -H "Content-Type: application/json"`}
                    </code>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Mettre à jour les paramètres de performance</h4>
                    <code className="block bg-gray-900 p-3 rounded text-green-400 text-sm whitespace-pre">
                      {`curl -X POST "https://djobea-analytics.vercel.app/api/settings/performance" \\
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cache": {
      "redisEnabled": true,
      "ttl": 300
    },
    "optimization": {
      "imageCompression": true,
      "minifyAssets": true
    }
  }'`}
                    </code>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Basculer le mode maintenance</h4>
                    <code className="block bg-gray-900 p-3 rounded text-green-400 text-sm whitespace-pre">
                      {`curl -X POST "https://djobea-analytics.vercel.app/api/settings/maintenance/toggle" \\
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "enabled": true,
    "message": "Maintenance programmée - Retour dans 30 minutes"
  }'`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modules" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const info = categoryInfo[category as keyof typeof categoryInfo]
                  const Icon = info?.icon || Settings
                  const categoryEndpoints = endpoints.filter((e) => e.category === category)

                  return (
                    <Card
                      key={category}
                      className="bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Icon className={`w-5 h-5 ${info?.color || "text-gray-400"}`} />
                          {info?.label || category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Endpoints:</span>
                            <span className="text-white font-medium">{categoryEndpoints.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">GET:</span>
                            <span className="text-green-400">
                              {categoryEndpoints.filter((e) => e.method === "GET").length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">POST:</span>
                            <span className="text-blue-400">
                              {categoryEndpoints.filter((e) => e.method === "POST").length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">PUT:</span>
                            <span className="text-yellow-400">
                              {categoryEndpoints.filter((e) => e.method === "PUT").length}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedCategory(category)}
                          size="sm"
                          className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300"
                        >
                          Voir les endpoints
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Endpoints List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint, index) => (
              <motion.div
                key={`${endpoint.method}-${endpoint.path}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                          <code className="text-blue-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {categoryInfo[endpoint.category as keyof typeof categoryInfo]?.label || endpoint.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{endpoint.summary}</h3>
                        <p className="text-gray-400 text-sm">{endpoint.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const curlCommand = `curl -X ${endpoint.method} "https://djobea-analytics.vercel.app${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \\
  -H "Content-Type: application/json"`
                            navigator.clipboard.writeText(curlCommand)
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Code className="w-4 h-4 mr-1" />
                          cURL
                        </Button>
                      </div>
                    </div>

                    {/* Example Response */}
                    {endpoint.example && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-semibold text-white mb-2">Exemple de réponse</h4>
                        <pre className="bg-gray-800 p-3 rounded text-green-400 text-xs overflow-x-auto">
                          {endpoint.example}
                        </pre>
                      </div>
                    )}

                    {/* Responses */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-semibold text-white mb-2">Réponses</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                          <Badge
                            key={code}
                            variant="outline"
                            className={
                              code.startsWith("2")
                                ? "border-green-500/30 text-green-400"
                                : code.startsWith("4")
                                  ? "border-yellow-500/30 text-yellow-400"
                                  : "border-red-500/30 text-red-400"
                            }
                          >
                            {code} - {response.description}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredEndpoints.length === 0 && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Aucun endpoint trouvé</h3>
                <p className="text-gray-400">Essayez de modifier vos critères de recherche ou de filtrage.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

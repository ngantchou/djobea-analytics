"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Settings,
  Palette,
  Map,
  Bot,
  Zap,
  BarChart3,
  Users,
  Download,
  Keyboard,
  Bell,
  Globe,
  Smartphone,
  Cloud,
  Shield,
  Workflow,
  Eye,
  MessageSquare,
  Mic,
  Video,
  FileText,
  Search,
  Filter,
  Layout,
  Maximize2,
  Moon,
  Sun,
  Cpu,
  Database,
  Wifi,
  Activity,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationStore } from "@/store/use-notification-store"
import { useTheme } from "next-themes"

interface Feature {
  id: string
  title: string
  description: string
  icon: any
  status: "active" | "beta" | "coming-soon" | "disabled"
  category: string
  enabled: boolean
  link?: string
  linkText?: string
}

export default function FeaturesPage() {
  const { addNotification } = useNotificationStore()
  const { theme, setTheme } = useTheme()

  const [features, setFeatures] = useState<Feature[]>([
    // Dashboard & Interface
    {
      id: "drag-drop",
      title: "Dashboard Personnalisable",
      description: "Réorganisez vos widgets par glisser-déposer selon vos besoins",
      icon: Layout,
      status: "beta",
      category: "interface",
      enabled: true,
      link: "/",
      linkText: "Voir Dashboard",
    },
    {
      id: "dark-mode",
      title: "Mode Sombre/Clair",
      description: "Basculez entre les thèmes sombre et clair pour votre confort",
      icon: theme === "dark" ? Sun : Moon,
      status: "active",
      category: "interface",
      enabled: theme === "dark",
      link: "/settings/general",
      linkText: "Paramètres Thème",
    },
    {
      id: "responsive-widgets",
      title: "Widgets Redimensionnables",
      description: "Ajustez la taille de vos widgets pour optimiser l'espace",
      icon: Maximize2,
      status: "active",
      category: "interface",
      enabled: true,
      link: "/",
      linkText: "Dashboard Principal",
    },
    {
      id: "custom-themes",
      title: "Thèmes Personnalisés",
      description: "Créez vos propres thèmes avec couleurs et polices personnalisées",
      icon: Palette,
      status: "coming-soon",
      category: "interface",
      enabled: false,
    },

    // Analytics & IA
    {
      id: "ai-predictions",
      title: "Prédictions IA",
      description: "Prévisions automatiques des demandes et revenus avec IA",
      icon: Bot,
      status: "active",
      category: "analytics",
      enabled: true,
      link: "/ai",
      linkText: "Ouvrir Prédictions IA",
    },
    {
      id: "anomaly-detection",
      title: "Détection d'Anomalies",
      description: "Alertes automatiques sur les comportements inhabituels",
      icon: Eye,
      status: "coming-soon",
      category: "analytics",
      enabled: false,
    },
    {
      id: "advanced-charts",
      title: "Graphiques Avancés",
      description: "Visualisations interactives avec drill-down et comparaisons",
      icon: BarChart3,
      status: "active",
      category: "analytics",
      enabled: true,
      link: "/analytics",
      linkText: "Voir Analytics",
    },
    {
      id: "cohort-analysis",
      title: "Analyse de Cohortes",
      description: "Analysez la rétention clients par groupes temporels",
      icon: Users,
      status: "beta",
      category: "analytics",
      enabled: false,
    },

    // Géolocalisation
    {
      id: "interactive-map",
      title: "Carte Interactive",
      description: "Visualisez les demandes et prestataires sur une carte en temps réel",
      icon: Map,
      status: "beta",
      category: "geolocation",
      enabled: false,
      link: "/map",
      linkText: "Ouvrir Carte",
    },
    {
      id: "gps-tracking",
      title: "Suivi GPS Prestataires",
      description: "Suivez la position des prestataires en temps réel",
      icon: Globe,
      status: "beta",
      category: "geolocation",
      enabled: false,
    },
    {
      id: "route-optimization",
      title: "Optimisation d'Itinéraires",
      description: "Suggestions d'itinéraires optimaux pour les prestataires",
      icon: Zap,
      status: "coming-soon",
      category: "geolocation",
      enabled: false,
    },

    // Temps Réel
    {
      id: "websocket-live",
      title: "Mises à Jour Temps Réel",
      description: "Synchronisation instantanée sans rechargement de page",
      icon: Wifi,
      status: "active",
      category: "realtime",
      enabled: true,
      link: "/",
      linkText: "Dashboard Temps Réel",
    },
    {
      id: "push-notifications",
      title: "Notifications Push",
      description: "Alertes navigateur pour événements critiques",
      icon: Bell,
      status: "active",
      category: "realtime",
      enabled: true,
      link: "/settings/notifications",
      linkText: "Configurer Notifications",
    },
    {
      id: "system-monitoring",
      title: "Monitoring Système",
      description: "Surveillance des performances serveurs en temps réel",
      icon: Activity,
      status: "beta",
      category: "realtime",
      enabled: false,
      link: "/settings/performance",
      linkText: "Voir Performance",
    },

    // Communication
    {
      id: "whatsapp-advanced",
      title: "WhatsApp Business Avancé",
      description: "Chatbot IA, templates et analytics WhatsApp",
      icon: MessageSquare,
      status: "beta",
      category: "communication",
      enabled: false,
      link: "/settings/whatsapp",
      linkText: "Configurer WhatsApp",
    },
    {
      id: "voice-commands",
      title: "Commandes Vocales",
      description: "Contrôlez le dashboard avec des commandes vocales",
      icon: Mic,
      status: "coming-soon",
      category: "communication",
      enabled: false,
    },
    {
      id: "video-calls",
      title: "Appels Vidéo Intégrés",
      description: "Communication vidéo directe avec prestataires et clients",
      icon: Video,
      status: "coming-soon",
      category: "communication",
      enabled: false,
    },

    // Productivité
    {
      id: "keyboard-shortcuts",
      title: "Raccourcis Clavier",
      description: "Navigation rapide avec raccourcis personnalisables",
      icon: Keyboard,
      status: "active",
      category: "productivity",
      enabled: true,
      link: "/settings/general",
      linkText: "Voir Raccourcis",
    },
    {
      id: "global-search",
      title: "Recherche Globale",
      description: "Recherche instantanée dans toutes les données",
      icon: Search,
      status: "active",
      category: "productivity",
      enabled: true,
      link: "/providers",
      linkText: "Tester Recherche",
    },
    {
      id: "advanced-filters",
      title: "Filtres Avancés",
      description: "Filtrage multi-critères avec sauvegarde des vues",
      icon: Filter,
      status: "active",
      category: "productivity",
      enabled: true,
      link: "/requests",
      linkText: "Voir Filtres",
    },
    {
      id: "bulk-actions",
      title: "Actions en Lot",
      description: "Effectuez des actions sur plusieurs éléments simultanément",
      icon: Workflow,
      status: "beta",
      category: "productivity",
      enabled: false,
    },

    // Export & Intégrations
    {
      id: "multi-export",
      title: "Export Multi-formats",
      description: "Exportez vos données en PDF, Excel, CSV, PNG",
      icon: Download,
      status: "active",
      category: "export",
      enabled: true,
      link: "/analytics",
      linkText: "Tester Export",
    },
    {
      id: "api-webhooks",
      title: "API & Webhooks",
      description: "Intégrations avec systèmes tiers via API REST",
      icon: Cloud,
      status: "active",
      category: "export",
      enabled: true,
      link: "/settings/admin",
      linkText: "Configuration API",
    },
    {
      id: "automated-reports",
      title: "Rapports Automatiques",
      description: "Génération et envoi automatique de rapports périodiques",
      icon: FileText,
      status: "beta",
      category: "export",
      enabled: false,
    },

    // Sécurité
    {
      id: "two-factor-auth",
      title: "Authentification 2FA",
      description: "Sécurité renforcée avec authentification à deux facteurs",
      icon: Shield,
      status: "active",
      category: "security",
      enabled: false,
      link: "/settings/security",
      linkText: "Configurer 2FA",
    },
    {
      id: "audit-logs",
      title: "Journaux d'Audit",
      description: "Traçabilité complète des actions utilisateurs",
      icon: Database,
      status: "beta",
      category: "security",
      enabled: false,
      link: "/settings/security",
      linkText: "Voir Logs",
    },
    {
      id: "role-management",
      title: "Gestion des Rôles",
      description: "Contrôle d'accès granulaire par rôles et permissions",
      icon: Users,
      status: "active",
      category: "security",
      enabled: true,
      link: "/settings/admin",
      linkText: "Gérer Rôles",
    },

    // Mobile
    {
      id: "mobile-app",
      title: "Application Mobile",
      description: "Application native iOS/Android pour gestion nomade",
      icon: Smartphone,
      status: "coming-soon",
      category: "mobile",
      enabled: false,
    },
    {
      id: "offline-mode",
      title: "Mode Hors Ligne",
      description: "Fonctionnement en mode déconnecté avec synchronisation",
      icon: Cpu,
      status: "coming-soon",
      category: "mobile",
      enabled: false,
    },
  ])

  const categories = [
    { id: "all", name: "Toutes", icon: Settings },
    { id: "interface", name: "Interface", icon: Layout },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
    { id: "geolocation", name: "Géolocalisation", icon: Map },
    { id: "realtime", name: "Temps Réel", icon: Wifi },
    { id: "communication", name: "Communication", icon: MessageSquare },
    { id: "productivity", name: "Productivité", icon: Zap },
    { id: "export", name: "Export", icon: Download },
    { id: "security", name: "Sécurité", icon: Shield },
    { id: "mobile", name: "Mobile", icon: Smartphone },
  ]

  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredFeatures =
    selectedCategory === "all" ? features : features.filter((f) => f.category === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600"
      case "beta":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "coming-soon":
        return "bg-blue-500 hover:bg-blue-600"
      case "disabled":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle
      case "beta":
        return AlertCircle
      case "coming-soon":
        return Clock
      case "disabled":
        return XCircle
      default:
        return XCircle
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "beta":
        return "Bêta"
      case "coming-soon":
        return "Bientôt"
      case "disabled":
        return "Désactivé"
      default:
        return "Inconnu"
    }
  }

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled } : f)))

    const feature = features.find((f) => f.id === featureId)
    if (feature) {
      addNotification({
        title: feature.enabled ? "Fonctionnalité désactivée" : "Fonctionnalité activée",
        message: `${feature.title} ${feature.enabled ? "désactivée" : "activée"} avec succès`,
        type: "success",
      })
    }
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    toggleFeature("dark-mode")
  }

  const stats = {
    total: features.length,
    active: features.filter((f) => f.status === "active").length,
    beta: features.filter((f) => f.status === "beta").length,
    comingSoon: features.filter((f) => f.status === "coming-soon").length,
    enabled: features.filter((f) => f.enabled).length,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Fonctionnalités Avancées
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez et activez les fonctionnalités avancées pour optimiser votre expérience Djobea Analytics
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Actives</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.beta}</div>
                <div className="text-sm text-muted-foreground">Bêta</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.comingSoon}</div>
                <div className="text-sm text-muted-foreground">Bientôt</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.enabled}</div>
                <div className="text-sm text-muted-foreground">Activées</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block">{category.name}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  const StatusIcon = getStatusIcon(feature.status)
                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-200 h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`${getStatusColor(feature.status)} text-white text-xs`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {getStatusText(feature.status)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {feature.status === "active" && (
                              <Switch
                                checked={feature.enabled}
                                onCheckedChange={() => {
                                  if (feature.id === "dark-mode") {
                                    handleThemeToggle()
                                  } else {
                                    toggleFeature(feature.id)
                                  }
                                }}
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4">{feature.description}</CardDescription>

                          <div className="flex flex-col gap-2">
                            {/* Lien vers la page de la fonctionnalité */}
                            {feature.link && (
                              <Link href={feature.link}>
                                <Button size="sm" variant="outline" className="w-full bg-transparent">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {feature.linkText || "Ouvrir"}
                                </Button>
                              </Link>
                            )}

                            {/* Actions selon le statut */}
                            {feature.status === "coming-soon" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent"
                                onClick={() =>
                                  addNotification({
                                    title: "Fonctionnalité en développement",
                                    message: `${feature.title} sera bientôt disponible !`,
                                    type: "info",
                                  })
                                }
                              >
                                <Bell className="w-4 h-4 mr-2" />
                                Être notifié
                              </Button>
                            )}

                            {feature.status === "beta" && !feature.enabled && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent"
                                onClick={() => toggleFeature(feature.id)}
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Tester la bêta
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const activeFeatures = features.filter((f) => f.status === "active")
                    activeFeatures.forEach((f) => {
                      if (!f.enabled) toggleFeature(f.id)
                    })
                    addNotification({
                      title: "Fonctionnalités activées",
                      message: "Toutes les fonctionnalités actives ont été activées",
                      type: "success",
                    })
                  }}
                >
                  Tout Activer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const betaFeatures = features.filter((f) => f.status === "beta")
                    betaFeatures.forEach((f) => toggleFeature(f.id))
                    addNotification({
                      title: "Fonctionnalités bêta",
                      message: "Toutes les fonctionnalités bêta ont été activées",
                      type: "info",
                    })
                  }}
                >
                  Tester Bêta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    features.forEach((f) => {
                      if (f.enabled) toggleFeature(f.id)
                    })
                    addNotification({
                      title: "Fonctionnalités désactivées",
                      message: "Toutes les fonctionnalités ont été désactivées",
                      type: "warning",
                    })
                  }}
                >
                  Tout Désactiver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    addNotification({
                      title: "Configuration sauvegardée",
                      message: "Vos préférences ont été sauvegardées",
                      type: "success",
                    })
                  }}
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation vers pages spécifiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Accès Rapide aux Fonctionnalités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/ai">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Bot className="w-4 h-4 mr-2" />
                    Prédictions IA
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics Avancés
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/providers">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Search className="w-4 h-4 mr-2" />
                    Recherche Globale
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/settings/whatsapp">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp Business
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/settings/security">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Shield className="w-4 h-4 mr-2" />
                    Sécurité & 2FA
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/settings/performance">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Activity className="w-4 h-4 mr-2" />
                    Monitoring Système
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

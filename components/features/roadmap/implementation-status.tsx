"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, AlertCircle, XCircle, Star, TrendingUp, Shield, Smartphone, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImplementationItem {
  id: string
  title: string
  description: string
  status: "completed" | "in-progress" | "planned" | "not-started"
  priority: 1 | 2 | 3 | 4 | 5
  complexity: 1 | 2 | 3 | 4 | 5
  businessImpact: 1 | 2 | 3 | 4 | 5
  estimatedWeeks: number
  category: string
  dependencies?: string[]
  technologies: string[]
}

export function ImplementationStatus() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const implementations: ImplementationItem[] = [
    // Priority 1 - Core Business
    {
      id: "drag-drop-dashboard",
      title: "Dashboard Drag & Drop",
      description: "Widgets redimensionnables et repositionnables avec sauvegarde des layouts",
      status: "not-started",
      priority: 1,
      complexity: 4,
      businessImpact: 5,
      estimatedWeeks: 3,
      category: "core",
      technologies: ["@dnd-kit/core", "zustand", "react-grid-layout"],
    },
    {
      id: "interactive-map",
      title: "Carte Interactive Temps Réel",
      description: "Visualisation géographique avec tracking GPS et optimisation d'itinéraires",
      status: "not-started",
      priority: 1,
      complexity: 4,
      businessImpact: 5,
      estimatedWeeks: 4,
      category: "core",
      technologies: ["react-map-gl", "mapbox-gl", "turf.js"],
    },
    {
      id: "ai-predictions",
      title: "Prédictions IA & ML",
      description: "Algorithmes de prévision de demande et recommandations intelligentes",
      status: "not-started",
      priority: 1,
      complexity: 5,
      businessImpact: 5,
      estimatedWeeks: 5,
      category: "core",
      technologies: ["@tensorflow/tfjs", "brain.js", "ml-regression"],
    },
    {
      id: "global-search",
      title: "Recherche Globale Avancée",
      description: "Recherche full-text avec suggestions intelligentes et filtres dynamiques",
      status: "in-progress",
      priority: 1,
      complexity: 3,
      businessImpact: 4,
      estimatedWeeks: 2,
      category: "core",
      technologies: ["fuse.js", "elasticsearch", "algolia"],
    },

    // Priority 2 - Productivity
    {
      id: "keyboard-shortcuts",
      title: "Raccourcis Clavier Complets",
      description: "Navigation complète au clavier avec palette de commandes",
      status: "in-progress",
      priority: 2,
      complexity: 2,
      businessImpact: 3,
      estimatedWeeks: 1,
      category: "productivity",
      technologies: ["cmdk", "hotkeys-js", "react-hotkeys-hook"],
    },
    {
      id: "bulk-actions",
      title: "Actions en Lot",
      description: "Sélection multiple et actions groupées sur les entités",
      status: "not-started",
      priority: 2,
      complexity: 3,
      businessImpact: 4,
      estimatedWeeks: 2,
      category: "productivity",
      technologies: ["react-table", "zustand", "react-hook-form"],
    },
    {
      id: "offline-pwa",
      title: "Mode Hors Ligne & PWA",
      description: "Application progressive avec synchronisation automatique",
      status: "not-started",
      priority: 2,
      complexity: 4,
      businessImpact: 3,
      estimatedWeeks: 3,
      category: "productivity",
      technologies: ["workbox", "idb", "react-query"],
    },

    // Priority 3 - Security
    {
      id: "two-factor-auth",
      title: "Authentification 2FA",
      description: "Sécurité renforcée avec TOTP et codes de récupération",
      status: "not-started",
      priority: 3,
      complexity: 3,
      businessImpact: 4,
      estimatedWeeks: 2,
      category: "security",
      technologies: ["speakeasy", "qrcode", "passport"],
    },
    {
      id: "audit-logs",
      title: "Journaux d'Audit",
      description: "Traçabilité complète avec recherche et export pour conformité",
      status: "not-started",
      priority: 3,
      complexity: 3,
      businessImpact: 4,
      estimatedWeeks: 2,
      category: "security",
      technologies: ["winston", "elasticsearch", "logstash"],
    },
    {
      id: "advanced-roles",
      title: "Gestion Rôles Avancée",
      description: "Permissions granulaires avec hiérarchie et délégation",
      status: "planned",
      priority: 3,
      complexity: 4,
      businessImpact: 4,
      estimatedWeeks: 3,
      category: "security",
      technologies: ["casbin", "jsonwebtoken", "bcrypt"],
    },

    // Priority 4 - Mobile & Communication
    {
      id: "mobile-app",
      title: "Application Mobile Native",
      description: "App React Native avec synchronisation temps réel",
      status: "not-started",
      priority: 4,
      complexity: 5,
      businessImpact: 4,
      estimatedWeeks: 6,
      category: "mobile",
      technologies: ["expo", "react-native", "@react-native-firebase"],
    },
    {
      id: "whatsapp-advanced",
      title: "WhatsApp Business Avancé",
      description: "Chatbot IA avec NLP et analytics des conversations",
      status: "planned",
      priority: 4,
      complexity: 4,
      businessImpact: 5,
      estimatedWeeks: 4,
      category: "mobile",
      technologies: ["whatsapp-web.js", "natural", "dialogflow"],
    },
    {
      id: "integrated-communication",
      title: "Communication Intégrée",
      description: "Chat temps réel, appels vidéo et partage d'écran",
      status: "not-started",
      priority: 4,
      complexity: 5,
      businessImpact: 3,
      estimatedWeeks: 5,
      category: "mobile",
      technologies: ["socket.io", "webrtc", "simple-peer"],
    },

    // Priority 5 - Advanced Analytics
    {
      id: "automated-reports",
      title: "Rapports Automatiques",
      description: "Génération et distribution programmée de rapports personnalisés",
      status: "not-started",
      priority: 5,
      complexity: 3,
      businessImpact: 4,
      estimatedWeeks: 3,
      category: "analytics",
      technologies: ["puppeteer", "node-cron", "nodemailer"],
    },
    {
      id: "cohort-analysis",
      title: "Analyse de Cohortes",
      description: "Segmentation clients avec analyse de rétention et LTV",
      status: "not-started",
      priority: 5,
      complexity: 4,
      businessImpact: 3,
      estimatedWeeks: 3,
      category: "analytics",
      technologies: ["d3.js", "recharts", "sql-query-builder"],
    },
    {
      id: "system-monitoring",
      title: "Monitoring Système",
      description: "Surveillance infrastructure avec alertes automatiques",
      status: "not-started",
      priority: 5,
      complexity: 4,
      businessImpact: 2,
      estimatedWeeks: 2,
      category: "analytics",
      technologies: ["prometheus", "grafana", "node-exporter"],
    },
  ]

  const categories = [
    { id: "all", name: "Toutes", icon: BarChart3 },
    { id: "core", name: "Core Business", icon: Star },
    { id: "productivity", name: "Productivité", icon: TrendingUp },
    { id: "security", name: "Sécurité", icon: Shield },
    { id: "mobile", name: "Mobile", icon: Smartphone },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
  ]

  const filteredImplementations =
    selectedCategory === "all" ? implementations : implementations.filter((item) => item.category === selectedCategory)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "planned":
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      case "not-started":
        return <XCircle className="w-5 h-5 text-gray-500" />
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé"
      case "in-progress":
        return "En cours"
      case "planned":
        return "Planifié"
      case "not-started":
        return "Non commencé"
      default:
        return "Inconnu"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      case "planned":
        return "bg-blue-500"
      case "not-started":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-orange-500"
      case 3:
        return "bg-yellow-500"
      case 4:
        return "bg-blue-500"
      case 5:
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const stats = {
    total: implementations.length,
    completed: implementations.filter((i) => i.status === "completed").length,
    inProgress: implementations.filter((i) => i.status === "in-progress").length,
    planned: implementations.filter((i) => i.status === "planned").length,
    notStarted: implementations.filter((i) => i.status === "not-started").length,
    totalWeeks: implementations.reduce((sum, item) => sum + item.estimatedWeeks, 0),
    priority1: implementations.filter((i) => i.priority === 1).length,
  }

  const completionPercentage = Math.round(((stats.completed + stats.inProgress * 0.5) / stats.total) * 100)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-400">Terminés</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
            <div className="text-sm text-gray-400">En cours</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.planned}</div>
            <div className="text-sm text-gray-400">Planifiés</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.priority1}</div>
            <div className="text-sm text-gray-400">Priorité 1</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalWeeks}</div>
            <div className="text-sm text-gray-400">Semaines</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progression Globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Avancement du projet</span>
              <span className="text-white font-bold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Terminé ({stats.completed})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">En cours ({stats.inProgress})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Planifié ({stats.planned})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-300">Non commencé ({stats.notStarted})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-gray-800/50">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 data-[state=active]:bg-blue-600"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{category.name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredImplementations.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(item.status)}
                          <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                        </div>
                        <CardDescription className="text-gray-400">{item.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                        {getStatusText(item.status)}
                      </Badge>
                      <Badge className={`${getPriorityColor(item.priority)} text-white text-xs`}>
                        P{item.priority}
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-600">
                        {item.estimatedWeeks}w
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Complexity & Impact */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Complexité</div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < item.complexity ? "bg-red-500" : "bg-gray-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Impact Business</div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < item.businessImpact ? "bg-green-500" : "bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Technologies</div>
                        <div className="flex flex-wrap gap-1">
                          {item.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-xs text-gray-300 border-gray-600 bg-gray-700/50"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

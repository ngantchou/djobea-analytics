"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  TrendingUp,
  RefreshCw,
  Download,
  Share2,
  Settings,
  AlertTriangle,
  Target,
  Lightbulb,
  Zap,
  Users,
  DollarSign,
  Star,
  BarChart3,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAIPredictions } from "@/hooks/use-ai-predictions"
import { useNotificationStore } from "@/store/use-notification-store"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface PredictionModel {
  id: string
  name: string
  description: string
  type: "demand" | "revenue" | "satisfaction" | "performance"
  status: "active" | "training" | "error" | "inactive"
  accuracy: number
  confidence: number
  lastTrained: string
  predictions: number
  icon: any
}

interface Insight {
  id: string
  type: "opportunity" | "risk" | "optimization" | "trend"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  action: string
  category: string
}

export default function AIPredictions() {
  const { predictions, insights, isLoading, refreshPredictions } = useAIPredictions()
  const { addNotification } = useNotificationStore()

  const [selectedModel, setSelectedModel] = useState<string>("demand")
  const [timeRange, setTimeRange] = useState<string>("7d")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const models: PredictionModel[] = [
    {
      id: "demand",
      name: "Prédiction de Demande",
      description: "Anticipe les pics et creux d'activité",
      type: "demand",
      status: "active",
      accuracy: 87.3,
      confidence: 92.1,
      lastTrained: "2024-01-15T10:30:00Z",
      predictions: 1247,
      icon: TrendingUp,
    },
    {
      id: "revenue",
      name: "Prévision de Revenus",
      description: "Projections financières précises",
      type: "revenue",
      status: "active",
      accuracy: 84.7,
      confidence: 89.4,
      lastTrained: "2024-01-15T09:15:00Z",
      predictions: 892,
      icon: DollarSign,
    },
    {
      id: "satisfaction",
      name: "Satisfaction Client",
      description: "Prédiction des scores de satisfaction",
      type: "satisfaction",
      status: "training",
      accuracy: 79.2,
      confidence: 85.6,
      lastTrained: "2024-01-14T16:45:00Z",
      predictions: 634,
      icon: Star,
    },
    {
      id: "performance",
      name: "Performance Prestataires",
      description: "Évaluation prédictive des performances",
      type: "performance",
      status: "active",
      accuracy: 91.8,
      confidence: 94.2,
      lastTrained: "2024-01-15T11:20:00Z",
      predictions: 1456,
      icon: Users,
    },
  ]

  const aiInsights: Insight[] = [
    {
      id: "1",
      type: "opportunity",
      title: "Pic de demande prévu demain",
      description: "Une augmentation de 35% des demandes est prévue demain entre 14h et 18h",
      impact: "high",
      confidence: 89.2,
      action: "Mobiliser 3 prestataires supplémentaires",
      category: "Demande",
    },
    {
      id: "2",
      type: "risk",
      title: "Baisse satisfaction zone Nord",
      description: "Risque de chute de 15% de la satisfaction dans la zone Nord cette semaine",
      impact: "medium",
      confidence: 76.8,
      action: "Contacter les prestataires de la zone",
      category: "Satisfaction",
    },
    {
      id: "3",
      type: "optimization",
      title: "Optimisation itinéraires possible",
      description: "Réduction de 20% du temps de trajet possible avec réorganisation",
      impact: "high",
      confidence: 92.4,
      action: "Implémenter nouveau routage",
      category: "Logistique",
    },
    {
      id: "4",
      type: "trend",
      title: "Nouvelle tendance services premium",
      description: "Croissance de 45% des demandes de services premium ce mois",
      impact: "medium",
      confidence: 83.7,
      action: "Recruter prestataires spécialisés",
      category: "Business",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "training":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      case "inactive":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "training":
        return "Formation"
      case "error":
        return "Erreur"
      case "inactive":
        return "Inactif"
      default:
        return "Inconnu"
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return Target
      case "risk":
        return AlertTriangle
      case "optimization":
        return Zap
      case "trend":
        return TrendingUp
      default:
        return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "text-green-400 bg-green-400/10"
      case "risk":
        return "text-red-400 bg-red-400/10"
      case "optimization":
        return "text-blue-400 bg-blue-400/10"
      case "trend":
        return "text-purple-400 bg-purple-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleModelRetrain = (modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    if (model) {
      addNotification({
        title: "Réentraînement lancé",
        message: `Le modèle ${model.name} est en cours de réentraînement`,
        type: "info",
      })
    }
  }

  const handleExport = () => {
    addNotification({
      title: "Export en cours",
      message: "Vos prédictions sont en cours d'export au format PDF",
      type: "success",
    })
  }

  const handleShare = () => {
    addNotification({
      title: "Lien de partage créé",
      message: "Le lien de partage a été copié dans le presse-papiers",
      type: "success",
    })
  }

  // Données simulées pour les graphiques
  const generatePredictionData = (type: string) => {
    const data = []
    const now = new Date()

    for (let i = -7; i <= 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)

      let value = 100
      let predicted = null

      // Patterns différents selon le type
      switch (type) {
        case "demand":
          value = 80 + Math.sin(i * 0.5) * 20 + Math.random() * 10
          if (i > 0) {
            predicted = value * (1 + Math.sin(i * 0.3) * 0.2)
          }
          break
        case "revenue":
          value = 5000 + Math.sin(i * 0.4) * 1000 + Math.random() * 500
          if (i > 0) {
            predicted = value * (1 + Math.sin(i * 0.2) * 0.15)
          }
          break
        case "satisfaction":
          value = 4.2 + Math.sin(i * 0.6) * 0.3 + Math.random() * 0.1
          if (i > 0) {
            predicted = Math.max(3.5, Math.min(5, value + Math.sin(i * 0.1) * 0.2))
          }
          break
        case "performance":
          value = 85 + Math.sin(i * 0.7) * 10 + Math.random() * 5
          if (i > 0) {
            predicted = Math.max(70, Math.min(100, value + Math.sin(i * 0.15) * 5))
          }
          break
      }

      data.push({
        date: date.toISOString().split("T")[0],
        actual: i <= 0 ? Math.round(value * 100) / 100 : null,
        predicted: i > 0 ? Math.round(predicted * 100) / 100 : null,
        confidence: i > 0 ? Math.max(70, 95 - Math.abs(i) * 3) : null,
      })
    }

    return data
  }

  const selectedModelData = models.find((m) => m.id === selectedModel)
  const chartData = generatePredictionData(selectedModel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-400" />
            Prédictions IA
          </h1>
          <p className="text-gray-400 mt-2">Intelligence artificielle pour anticiper et optimiser vos opérations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
            <label htmlFor="auto-refresh" className="text-sm text-gray-300">
              Auto-actualisation
            </label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPredictions}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">85.4%</div>
            <div className="text-sm text-gray-400">Précision Moyenne</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">3/4</div>
            <div className="text-sm text-gray-400">Modèles Actifs</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">4,229</div>
            <div className="text-sm text-gray-400">Total Prédictions</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">2h</div>
            <div className="text-sm text-gray-400">Dernière MAJ</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="predictions" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-blue-600">
            <Settings className="w-4 h-4 mr-2" />
            Gestion Modèles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          {/* Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map((model) => {
              const Icon = model.icon
              return (
                <motion.div key={model.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedModel === model.id
                        ? "bg-blue-600/20 border-blue-500"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="w-6 h-6 text-blue-400" />
                        <Badge className={`${getStatusColor(model.status)} text-white text-xs`}>
                          {getStatusText(model.status)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{model.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{model.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Précision</span>
                          <span className="text-green-400">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Prediction Chart */}
          {selectedModelData && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <selectedModelData.icon className="w-5 h-5 text-blue-400" />
                      {selectedModelData.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">Prédictions pour les 7 prochains jours</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="7d">7 jours</SelectItem>
                        <SelectItem value="14d">14 jours</SelectItem>
                        <SelectItem value="30d">30 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Données réelles"
                      />
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.2}
                        strokeDasharray="5 5"
                        name="Prédictions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-400">Données réelles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded border-2 border-dashed border-green-500"></div>
                    <span className="text-gray-400">Prédictions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{insight.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${getImpactColor(insight.impact)} text-white text-xs`}>
                                Impact{" "}
                                {insight.impact === "high" ? "Élevé" : insight.impact === "medium" ? "Moyen" : "Faible"}
                              </Badge>
                              <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                {insight.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-400">{insight.confidence}%</div>
                          <div className="text-xs text-gray-400">Confiance</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 mb-4">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <Target className="w-4 h-4" />
                          {insight.action}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                        >
                          Planifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.map((model, index) => {
              const Icon = model.icon
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white">{model.name}</CardTitle>
                            <CardDescription className="text-gray-400">{model.description}</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(model.status)} text-white`}>
                          {getStatusText(model.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Précision</div>
                          <div className="text-lg font-semibold text-green-400">{model.accuracy}%</div>
                          <Progress value={model.accuracy} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Confiance</div>
                          <div className="text-lg font-semibold text-blue-400">{model.confidence}%</div>
                          <Progress value={model.confidence} className="h-1 mt-1" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Dernière formation</div>
                          <div className="text-white">{new Date(model.lastTrained).toLocaleDateString("fr-FR")}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Prédictions</div>
                          <div className="text-white">{model.predictions.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModelRetrain(model.id)}
                          disabled={model.status === "training"}
                          className="flex-1 border-gray-600 text-gray-300 hover:text-white bg-transparent"
                        >
                          {model.status === "training" ? (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                              Formation...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Réentraîner
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

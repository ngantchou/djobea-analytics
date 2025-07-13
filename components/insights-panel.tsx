"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, AlertTriangle, Lightbulb, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInsightsData } from "@/hooks/use-api-data"

interface Insight {
  id: string
  type: "prediction" | "recommendation" | "alert" | "opportunity"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high"
  category: string
  actionable: boolean
  createdAt: string
}

export function InsightsPanel() {
  const { data, isLoading, error } = useInsightsData()
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  // Données par défaut si l'API n'est pas disponible
  const defaultInsights: Insight[] = [
    {
      id: "1",
      type: "prediction",
      title: "Pic de demandes prévu",
      description:
        "Une augmentation de 35% des demandes est prévue pour les 3 prochains jours en raison des conditions météorologiques.",
      confidence: 87,
      impact: "high",
      category: "Demande",
      actionable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: "recommendation",
      title: "Optimisation des routes",
      description: "Regrouper les interventions dans la zone Bonamoussadi pourrait réduire les temps de trajet de 23%.",
      confidence: 92,
      impact: "medium",
      category: "Efficacité",
      actionable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      type: "alert",
      title: "Prestataire surchargé",
      description: "Jean-Baptiste Électricité a 8 demandes en attente, risque de délais importants.",
      confidence: 95,
      impact: "high",
      category: "Ressources",
      actionable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      type: "opportunity",
      title: "Nouveau marché détecté",
      description: "Forte demande non satisfaite pour les services de jardinage dans le secteur Akwa.",
      confidence: 78,
      impact: "medium",
      category: "Expansion",
      actionable: true,
      createdAt: new Date().toISOString(),
    },
  ]

  const insights = data?.data || defaultInsights

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "prediction":
        return Brain
      case "recommendation":
        return Lightbulb
      case "alert":
        return AlertTriangle
      case "opportunity":
        return Target
      default:
        return Brain
    }
  }

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "prediction":
        return "from-purple-500 to-pink-500"
      case "recommendation":
        return "from-blue-500 to-cyan-500"
      case "alert":
        return "from-red-500 to-orange-500"
      case "opportunity":
        return "from-green-500 to-emerald-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getImpactColor = (impact: Insight["impact"]) => {
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

  const getTypeLabel = (type: Insight["type"]) => {
    switch (type) {
      case "prediction":
        return "Prédiction"
      case "recommendation":
        return "Recommandation"
      case "alert":
        return "Alerte"
      case "opportunity":
        return "Opportunité"
      default:
        return "Insight"
    }
  }

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 mb-12">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
            <p>Erreur lors du chargement des insights IA</p>
            <p className="text-sm text-red-300 mt-2">Vérifiez votre connexion API</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 mb-12">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl">Insights IA</span>
            <p className="text-sm text-gray-400 font-normal">Analyses prédictives et recommandations intelligentes</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-700/30 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-3"></div>
                <div className="h-3 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-600"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getImpactColor(insight.impact)} text-white text-xs px-2 py-1`}>
                        {insight.impact}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{insight.title}</h3>

                  <p className="text-gray-400 text-xs mb-3 line-clamp-3">{insight.description}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      {getTypeLabel(insight.type)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">{insight.confidence}%</span>
                    </div>
                  </div>

                  {insight.actionable && (
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Action à implémenter
                      }}
                    >
                      Agir maintenant
                    </Button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Statistiques des insights */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {insights.filter((i) => i.type === "prediction").length}
              </div>
              <div className="text-sm text-gray-400">Prédictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {insights.filter((i) => i.type === "recommendation").length}
              </div>
              <div className="text-sm text-gray-400">Recommandations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{insights.filter((i) => i.type === "alert").length}</div>
              <div className="text-sm text-gray-400">Alertes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {insights.filter((i) => i.type === "opportunity").length}
              </div>
              <div className="text-sm text-gray-400">Opportunités</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

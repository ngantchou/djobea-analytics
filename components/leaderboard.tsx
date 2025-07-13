"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, TrendingUp, Users, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLeaderboard } from "@/hooks/use-api-data"

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  rating: number
  completedJobs: number
  responseTime: number
  revenue: number
  specialties: string[]
  rank: number
  change: number
  badge?: "gold" | "silver" | "bronze"
}

export function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")
  const [selectedMetric, setSelectedMetric] = useState<"rating" | "jobs" | "revenue">("rating")

  const { data, isLoading, error } = useLeaderboard()

  // Données par défaut
  const defaultLeaderboard: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Jean-Baptiste Électricité",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      completedJobs: 156,
      responseTime: 12,
      revenue: 3200000,
      specialties: ["Électricité", "Dépannage"],
      rank: 1,
      change: 0,
      badge: "gold",
    },
    {
      id: "2",
      name: "Marie Plomberie Pro",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      completedJobs: 142,
      responseTime: 15,
      revenue: 2890000,
      specialties: ["Plomberie", "Réparation"],
      rank: 2,
      change: 1,
      badge: "silver",
    },
    {
      id: "3",
      name: "Paul Climatisation",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      completedJobs: 98,
      responseTime: 18,
      revenue: 2650000,
      specialties: ["Climatisation", "Maintenance"],
      rank: 3,
      change: -1,
      badge: "bronze",
    },
    {
      id: "4",
      name: "Sophie Jardinage",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.6,
      completedJobs: 87,
      responseTime: 22,
      revenue: 1450000,
      specialties: ["Jardinage", "Paysagisme"],
      rank: 4,
      change: 2,
    },
    {
      id: "5",
      name: "David Réparations",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.5,
      completedJobs: 76,
      responseTime: 20,
      revenue: 1890000,
      specialties: ["Réparations", "Bricolage"],
      rank: 5,
      change: -1,
    },
  ]

  const leaderboard = data?.data || defaultLeaderboard

  const periods = [
    { key: "week" as const, label: "Semaine" },
    { key: "month" as const, label: "Mois" },
    { key: "year" as const, label: "Année" },
  ]

  const metrics = [
    { key: "rating" as const, label: "Note", icon: Star },
    { key: "jobs" as const, label: "Travaux", icon: Users },
    { key: "revenue" as const, label: "Revenus", icon: TrendingUp },
  ]

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "gold":
        return "bg-yellow-500"
      case "silver":
        return "bg-gray-400"
      case "bronze":
        return "bg-orange-600"
      default:
        return "bg-blue-500"
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return "↗"
    if (change < 0) return "↘"
    return "→"
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const formatRevenue = (revenue: number) => {
    return `${(revenue / 1000000).toFixed(1)}M`
  }

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <Trophy className="w-12 h-12 mx-auto mb-3" />
            <p>Erreur lors du chargement du classement</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl">Classement</span>
              <p className="text-sm text-gray-400 font-normal">Top prestataires</p>
            </div>
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Sélecteur de période */}
            <div className="flex gap-1">
              {periods.map((period) => (
                <Button
                  key={period.key}
                  size="sm"
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`text-xs ${
                    selectedPeriod === period.key
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-gray-600 text-gray-300 hover:text-white bg-transparent"
                  }`}
                >
                  {period.label}
                </Button>
              ))}
            </div>

            {/* Sélecteur de métrique */}
            <div className="flex gap-1">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <Button
                    key={metric.key}
                    size="sm"
                    variant={selectedMetric === metric.key ? "default" : "outline"}
                    onClick={() => setSelectedMetric(metric.key)}
                    className={`text-xs ${
                      selectedMetric === metric.key
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-gray-600 text-gray-300 hover:text-white bg-transparent"
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {metric.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                </div>
                <div className="w-16 h-6 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-gray-700/50 ${
                  provider.rank <= 3 ? "bg-gray-700/30 border border-gray-600" : "bg-gray-700/20"
                }`}
              >
                {/* Rang et badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      provider.rank === 1
                        ? "bg-yellow-500"
                        : provider.rank === 2
                          ? "bg-gray-400"
                          : provider.rank === 3
                            ? "bg-orange-600"
                            : "bg-gray-600"
                    }`}
                  >
                    {provider.rank <= 3 ? <Trophy className="w-4 h-4" /> : provider.rank}
                  </div>

                  {provider.badge && (
                    <Award
                      className={`w-4 h-4 ${
                        provider.badge === "gold"
                          ? "text-yellow-500"
                          : provider.badge === "silver"
                            ? "text-gray-400"
                            : "text-orange-600"
                      }`}
                    />
                  )}
                </div>

                {/* Avatar et info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {provider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium truncate">{provider.name}</h3>
                      <div className={`text-xs ${getChangeColor(provider.change)}`}>
                        {getChangeIcon(provider.change)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.specialties.slice(0, 2).map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="border-gray-600 text-gray-300 text-xs px-1 py-0"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Métriques */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-white font-medium">{provider.rating}</span>
                    </div>
                    <div className="text-xs text-gray-400">Note</div>
                  </div>

                  <div className="text-center">
                    <div className="text-blue-400 font-medium">{provider.completedJobs}</div>
                    <div className="text-xs text-gray-400">Travaux</div>
                  </div>

                  <div className="text-center">
                    <div className="text-green-400 font-medium">{formatRevenue(provider.revenue)}</div>
                    <div className="text-xs text-gray-400">FCFA</div>
                  </div>

                  <div className="text-center">
                    <div className="text-purple-400 font-medium">{provider.responseTime}min</div>
                    <div className="text-xs text-gray-400">Réponse</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Statistiques du classement */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-400">{leaderboard.length}</div>
              <div className="text-sm text-gray-400">Prestataires classés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {(leaderboard.reduce((sum, p) => sum + p.rating, 0) / leaderboard.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Note moyenne</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {leaderboard.reduce((sum, p) => sum + p.completedJobs, 0)}
              </div>
              <div className="text-sm text-gray-400">Total travaux</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(leaderboard.reduce((sum, p) => sum + p.responseTime, 0) / leaderboard.length)}min
              </div>
              <div className="text-sm text-gray-400">Temps moyen</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

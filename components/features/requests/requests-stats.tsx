"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, CheckCircle, AlertCircle, XCircle, TrendingUp, Users, Star } from "lucide-react"

interface RequestsStatsProps {
  stats: {
    total: number
    pending: number
    assigned: number
    inProgress: number
    completed: number
    cancelled: number
    avgResponseTime: string
    completionRate: number
  } | null
  loading?: boolean
}

export function RequestsStats({ stats, loading }: RequestsStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsCards = [
    {
      title: "Total des demandes",
      value: stats.total,
      icon: Users,
      description: "Toutes les demandes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "En attente",
      value: stats.pending,
      icon: Clock,
      description: "Demandes non assignées",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      badge: stats.pending > 10 ? "Élevé" : "Normal",
      badgeVariant: stats.pending > 10 ? "destructive" : "secondary",
    },
    {
      title: "Assignées",
      value: stats.assigned,
      icon: Users,
      description: "Prestataires assignés",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "En cours",
      value: stats.inProgress,
      icon: AlertCircle,
      description: "Interventions actives",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Terminées",
      value: stats.completed,
      icon: CheckCircle,
      description: "Services complétés",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Annulées",
      value: stats.cancelled,
      icon: XCircle,
      description: "Demandes annulées",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Temps de réponse",
      value: stats.avgResponseTime,
      icon: TrendingUp,
      description: "Temps moyen",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      isString: true,
    },
    {
      title: "Taux de completion",
      value: `${stats.completionRate}%`,
      icon: Star,
      description: "Demandes terminées",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      isString: true,
      badge: stats.completionRate >= 80 ? "Excellent" : stats.completionRate >= 60 ? "Bon" : "À améliorer",
      badgeVariant: stats.completionRate >= 80 ? "default" : stats.completionRate >= 60 ? "secondary" : "destructive",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.isString ? stat.value : stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                {stat.badge && (
                  <Badge variant={stat.badgeVariant as any} className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

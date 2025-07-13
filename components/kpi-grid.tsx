"use client"

import { TrendingUp, TrendingDown, Clock, Users, Star } from "lucide-react"
import { useKPIsData } from "@/hooks/use-api-data"

interface KPIData {
  successRate: number
  responseTime: number
  totalRequests: number
  satisfaction: number
  trends: {
    successRate: number
    responseTime: number
    totalRequests: number
    satisfaction: number
  }
}

export function KPIGrid({ period }: { period: string }) {
  const { data, isLoading, error } = useKPIsData(period)

  // Données par défaut en cas d'erreur ou de chargement
  const kpiData: KPIData = data?.data || {
    successRate: 89.2,
    responseTime: 14.5,
    totalRequests: 247,
    satisfaction: 4.8,
    trends: {
      successRate: 2.3,
      responseTime: -1.2,
      totalRequests: 15,
      satisfaction: 0.1,
    },
  }

  const kpis = [
    {
      icon: TrendingUp,
      value: `${kpiData.successRate}%`,
      label: "Taux de Réussite",
      trend: kpiData.trends.successRate,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      value: `${kpiData.responseTime}m`,
      label: "Temps de Réponse",
      trend: kpiData.trends.responseTime,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      value: kpiData.totalRequests.toString(),
      label: "Demandes Totales",
      trend: kpiData.trends.totalRequests,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Star,
      value: kpiData.satisfaction.toString(),
      label: "Satisfaction Client",
      trend: kpiData.trends.satisfaction,
      color: "from-orange-500 to-red-500",
    },
  ]

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="col-span-full bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-400">Erreur lors du chargement des KPIs</p>
          <p className="text-red-300 text-sm mt-2">Vérifiez votre connexion API</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${kpi.color} rounded-xl flex items-center justify-center`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                kpi.trend > 0 ? "text-green-400" : kpi.trend < 0 ? "text-red-400" : "text-slate-400"
              }`}
            >
              {kpi.trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : kpi.trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>
                {kpi.trend > 0 ? "+" : ""}
                {kpi.trend}%
              </span>
            </div>
          </div>

          <div className="text-3xl font-bold text-white mb-2">{isLoading ? "..." : kpi.value}</div>

          <div className="text-slate-400 text-sm uppercase tracking-wide">{kpi.label}</div>

          <div className="text-xs text-slate-500 mt-2">
            {kpi.trend > 0 ? "En hausse" : kpi.trend < 0 ? "En baisse" : "Stable"} cette semaine
          </div>
        </div>
      ))}
    </div>
  )
}

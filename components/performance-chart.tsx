"use client"

import { useState } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Users, CheckCircle } from "lucide-react"
import { usePerformanceData } from "@/hooks/use-api-data"

interface PerformanceData {
  date: string
  requests: number
  completed: number
  responseTime: number
  satisfaction: number
  activeProviders: number
}

export function PerformanceChart({ period }: { period: string }) {
  const [chartType, setChartType] = useState<"line" | "area">("area")
  const [selectedMetric, setSelectedMetric] = useState<"requests" | "responseTime" | "satisfaction">("requests")

  const { data, isLoading, error } = usePerformanceData(period)

  // Données par défaut pour la démonstration
  const defaultData: PerformanceData[] = [
    { date: "Lun", requests: 45, completed: 42, responseTime: 15, satisfaction: 4.2, activeProviders: 12 },
    { date: "Mar", requests: 52, completed: 48, responseTime: 18, satisfaction: 4.1, activeProviders: 14 },
    { date: "Mer", requests: 38, completed: 36, responseTime: 12, satisfaction: 4.5, activeProviders: 11 },
    { date: "Jeu", requests: 61, completed: 58, responseTime: 22, satisfaction: 4.0, activeProviders: 16 },
    { date: "Ven", requests: 73, completed: 69, responseTime: 19, satisfaction: 4.3, activeProviders: 18 },
    { date: "Sam", requests: 89, completed: 84, responseTime: 16, satisfaction: 4.6, activeProviders: 20 },
    { date: "Dim", requests: 67, completed: 63, responseTime: 14, satisfaction: 4.4, activeProviders: 17 },
  ]

  const performanceData = data?.data || defaultData

  const metrics = [
    {
      key: "requests" as const,
      label: "Demandes",
      icon: Users,
      color: "#3B82F6",
      value: performanceData.reduce((sum, item) => sum + item.requests, 0),
      change: "+12%",
    },
    {
      key: "responseTime" as const,
      label: "Temps de réponse",
      icon: Clock,
      color: "#8B5CF6",
      value: Math.round(performanceData.reduce((sum, item) => sum + item.responseTime, 0) / performanceData.length),
      change: "-8%",
      unit: "min",
    },
    {
      key: "satisfaction" as const,
      label: "Satisfaction",
      icon: CheckCircle,
      color: "#10B981",
      value: (performanceData.reduce((sum, item) => sum + item.satisfaction, 0) / performanceData.length).toFixed(1),
      change: "+5%",
      unit: "/5",
    },
  ]

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3" />
            <p>Erreur lors du chargement des données de performance</p>
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
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Performance Globale
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={chartType === "line" ? "default" : "outline"}
              onClick={() => setChartType("line")}
              className="text-xs"
            >
              Ligne
            </Button>
            <Button
              size="sm"
              variant={chartType === "area" ? "default" : "outline"}
              onClick={() => setChartType("area")}
              className="text-xs"
            >
              Zone
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Métriques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {metrics.map((metric) => {
            const Icon = metric.icon
            const isSelected = selectedMetric === metric.key

            return (
              <div
                key={metric.key}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "bg-gray-700/30 hover:bg-gray-700/50 border border-transparent"
                }`}
                onClick={() => setSelectedMetric(metric.key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5" style={{ color: metric.color }} />
                  <Badge className={`text-xs ${metric.change.startsWith("+") ? "bg-green-500" : "bg-red-500"}`}>
                    {metric.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {isLoading ? "..." : `${metric.value}${metric.unit || ""}`}
                </div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            )
          })}
        </div>

        {/* Graphique */}
        <div className="h-80">
          {isLoading ? (
            <div className="h-full bg-gray-700/20 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Chargement du graphique...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Legend />

                  {selectedMetric === "requests" && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Demandes totales"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="2"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                        name="Demandes terminées"
                      />
                    </>
                  )}

                  {selectedMetric === "responseTime" && (
                    <Area
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      name="Temps de réponse (min)"
                    />
                  )}

                  {selectedMetric === "satisfaction" && (
                    <Area
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      name="Satisfaction (/5)"
                    />
                  )}
                </AreaChart>
              ) : (
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Legend />

                  {selectedMetric === "requests" && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        name="Demandes totales"
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                        name="Demandes terminées"
                      />
                    </>
                  )}

                  {selectedMetric === "responseTime" && (
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                      name="Temps de réponse (min)"
                    />
                  )}

                  {selectedMetric === "satisfaction" && (
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                      name="Satisfaction (/5)"
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Résumé des tendances */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Tendance positive sur les 7 derniers jours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-400">
                {performanceData.reduce((sum, item) => sum + item.activeProviders, 0)} prestataires actifs au total
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

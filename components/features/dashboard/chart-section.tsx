"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface ChartData {
  requests: Array<{ name: string; value: number; completed: number }>
  revenue: Array<{ name: string; value: number }>
  services: Array<{ name: string; value: number; color: string }>
}

export function ChartSection() {
  const router = useRouter()
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getAnalyticsData("7d")

        if (response.success && response.data) {
          setChartData({
            requests: response.data.requestsChart || [],
            revenue: response.data.revenueChart || [],
            services: response.data.servicesChart || [],
          })
        } else {
          // Données par défaut
          setChartData({
            requests: [
              { name: "Lun", value: 12, completed: 10 },
              { name: "Mar", value: 19, completed: 15 },
              { name: "Mer", value: 15, completed: 12 },
              { name: "Jeu", value: 25, completed: 20 },
              { name: "Ven", value: 22, completed: 18 },
              { name: "Sam", value: 18, completed: 16 },
              { name: "Dim", value: 8, completed: 7 },
            ],
            revenue: [
              { name: "Lun", value: 2400 },
              { name: "Mar", value: 1398 },
              { name: "Mer", value: 9800 },
              { name: "Jeu", value: 3908 },
              { name: "Ven", value: 4800 },
              { name: "Sam", value: 3800 },
              { name: "Dim", value: 4300 },
            ],
            services: [
              { name: "Plomberie", value: 35, color: "#3B82F6" },
              { name: "Électricité", value: 28, color: "#10B981" },
              { name: "Nettoyage", value: 20, color: "#F59E0B" },
              { name: "Menuiserie", value: 17, color: "#EF4444" },
            ],
          })
        }
      } catch (error) {
        logger.error("Erreur lors du chargement des données de graphique", error)
        setChartData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [])

  const handleViewAnalytics = () => {
    logger.logUserAction("view_full_analytics")
    router.push("/analytics")
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Analyse des Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData) {
    return (
      <Card className="bg-red-900/20 border-red-700">
        <CardContent className="p-6">
          <p className="text-red-400">Erreur lors du chargement des graphiques</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Analyse des Performances
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={handleViewAnalytics}>
          Voir tout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700">
            <TabsTrigger value="requests" className="data-[state=active]:bg-blue-600">
              Demandes
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600">
              Revenus
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600">
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.requests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" name="Total" />
                <Bar dataKey="completed" fill="#10B981" name="Complétées" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B" }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.services}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.services.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

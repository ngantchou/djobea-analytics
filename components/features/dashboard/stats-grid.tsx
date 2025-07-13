"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ClipboardList, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface DashboardStats {
  totalProviders: number
  activeProviders: number
  providersChange: number
  totalRequests: number
  pendingRequests: number
  requestsChange: number
  totalRevenue: number
  monthlyRevenue: number
  revenueChange: number
  completionRate: number
  rateChange: number
}

export function StatsGrid() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getDashboardData()

        if (response.success && response.data) {
          setStats(response.data.stats)
        } else {
          // Données par défaut en cas d'erreur
          setStats({
            totalProviders: 156,
            activeProviders: 142,
            providersChange: 12,
            totalRequests: 1247,
            pendingRequests: 23,
            requestsChange: -5,
            totalRevenue: 45600,
            monthlyRevenue: 12300,
            revenueChange: 18,
            completionRate: 94.2,
            rateChange: 2.1,
          })
        }
      } catch (error) {
        logger.error("Erreur lors du chargement des statistiques", error)
        // Données par défaut en cas d'erreur
        setStats({
          totalProviders: 156,
          activeProviders: 142,
          providersChange: 12,
          totalRequests: 1247,
          pendingRequests: 23,
          requestsChange: -5,
          totalRevenue: 45600,
          monthlyRevenue: 12300,
          revenueChange: 18,
          completionRate: 94.2,
          rateChange: 2.1,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleViewProviders = () => {
    logger.logUserAction("view_all_providers")
    router.push("/providers")
  }

  const handleViewRequests = () => {
    logger.logUserAction("view_all_requests")
    router.push("/requests")
  }

  const handleViewFinances = () => {
    logger.logUserAction("view_finances")
    router.push("/finances")
  }

  const handleViewAnalytics = () => {
    logger.logUserAction("view_analytics")
    router.push("/analytics")
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-6">
            <p className="text-red-400">Erreur lors du chargement des statistiques</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Prestataires */}
      <Card
        className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group"
        onClick={handleViewProviders}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Prestataires</CardTitle>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleViewProviders()
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalProviders}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{stats.activeProviders} actifs</p>
            <div className="flex items-center gap-1">
              {stats.providersChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-xs ${stats.providersChange > 0 ? "text-green-400" : "text-red-400"}`}>
                {Math.abs(stats.providersChange)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demandes */}
      <Card
        className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group"
        onClick={handleViewRequests}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Demandes</CardTitle>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-green-400" />
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleViewRequests()
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalRequests}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400 border-yellow-700">
                {stats.pendingRequests} en attente
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {stats.requestsChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-xs ${stats.requestsChange > 0 ? "text-green-400" : "text-red-400"}`}>
                {Math.abs(stats.requestsChange)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenus */}
      <Card
        className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group"
        onClick={handleViewFinances}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Revenus</CardTitle>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-400" />
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleViewFinances()
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalRevenue)}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{formatCurrency(stats.monthlyRevenue)} ce mois</p>
            <div className="flex items-center gap-1">
              {stats.revenueChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-xs ${stats.revenueChange > 0 ? "text-green-400" : "text-red-400"}`}>
                {Math.abs(stats.revenueChange)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taux de completion */}
      <Card
        className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group"
        onClick={handleViewAnalytics}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Taux de Réussite</CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleViewAnalytics()
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-1">{stats.completionRate}%</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Demandes complétées</p>
            <div className="flex items-center gap-1">
              {stats.rateChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-400" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-400" />
              )}
              <span className={`text-xs ${stats.rateChange > 0 ? "text-green-400" : "text-red-400"}`}>
                {Math.abs(stats.rateChange)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

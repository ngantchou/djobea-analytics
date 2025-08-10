"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ClipboardList, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, CheckCircle, Clock, AlertCircle, Activity } from "lucide-react"
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
  avgResponseTime?: number
  responseTimeChange?: number
  satisfactionRate?: number
  satisfactionChange?: number
  systemUptime?: number
  uptimeChange?: number
  completedRequests?: number
  completedChange?: number
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  change: number
  icon: React.ReactNode
  onClick?: () => void
  badge?: string
  badgeColor?: string
}

function StatCard({ title, value, subtitle, change, icon, onClick, badge, badgeColor }: StatCardProps) {
  const getChangeDirection = () => {
    if (change === 0) return null;
    return change > 0 ? <ArrowUpRight className="h-3 w-3 text-green-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />;
  };

  const getChangeColor = () => {
    if (change === 0) return "text-gray-400";
    // Some metrics like response time are better when they decrease
    if (title.includes("Temps de Réponse")) {
      return change < 0 ? "text-green-400" : "text-red-400";
    }
    return change > 0 ? "text-green-400" : "text-red-400";
  };

  return (
    <Card
      className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {icon}
          {onClick && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="flex items-center justify-between">
          {badge ? (
            <Badge variant="secondary" className={`${badgeColor || "bg-yellow-900/30 text-yellow-400 border-yellow-700"}`}>
              {badge}
            </Badge>
          ) : (
            <p className="text-xs text-gray-400">{subtitle || ""}</p>
          )}
          {change !== undefined && change !== null && (
            <div className="flex items-center gap-1">
              {getChangeDirection()}
              <span className={`text-xs ${getChangeColor()}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
          // Just set to null instead of providing mock data
          setStats(null)
        }
      } catch (error) {
        logger.error("Erreur lors du chargement des statistiques", error)
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "—";
    return num.toLocaleString("fr-FR");
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return "—";
    return `${value}%`;
  }

  const formatTime = (minutes: number | undefined) => {
    if (minutes === undefined || minutes === null) return "—";
    return `${minutes}min`;
  }

  // Navigation handlers
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
        {[...Array(8)].map((_, i) => (
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

  const statCards = [
    {
      title: "Prestataires",
      value: formatNumber(stats.totalProviders),
      subtitle: `${formatNumber(stats.activeProviders)} actifs`,
      change: stats.providersChange,
      icon: <Users className="h-4 w-4 text-blue-400" />,
      onClick: handleViewProviders
    },
    {
      title: "Demandes",
      value: formatNumber(stats.totalRequests),
      change: stats.requestsChange,
      icon: <ClipboardList className="h-4 w-4 text-green-400" />,
      onClick: handleViewRequests,
      badge: `${formatNumber(stats.pendingRequests)} en attente`,
      badgeColor: "bg-yellow-900/30 text-yellow-400 border-yellow-700"
    },
    {
      title: "Revenus",
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${formatCurrency(stats.monthlyRevenue)} ce mois`,
      change: stats.revenueChange,
      icon: <DollarSign className="h-4 w-4 text-yellow-400" />,
      onClick: handleViewFinances
    },
    {
      title: "Taux de Réussite",
      value: formatPercentage(stats.completionRate),
      subtitle: "Demandes complétées",
      change: stats.rateChange,
      icon: <TrendingUp className="h-4 w-4 text-purple-400" />,
      onClick: handleViewAnalytics
    },
    {
      title: "Demandes Complétées",
      value: formatNumber(stats.completedRequests),
      subtitle: "Total des missions réussies",
      change: stats.completedChange || 0,
      icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
      onClick: handleViewRequests
    },
    {
      title: "Temps de Réponse",
      value: formatTime(stats.avgResponseTime),
      subtitle: "Moyenne de prise en charge",
      change: stats.responseTimeChange || 0,
      icon: <Clock className="h-4 w-4 text-indigo-400" />,
      onClick: handleViewAnalytics
    },
    {
      title: "Satisfaction",
      value: formatPercentage(stats.satisfactionRate),
      subtitle: "Évaluation des clients",
      change: stats.satisfactionChange || 0,
      icon: <TrendingUp className="h-4 w-4 text-rose-400" />,
      onClick: handleViewAnalytics
    },
    {
      title: "Disponibilité",
      value: formatPercentage(stats.systemUptime),
      subtitle: "Uptime de la plateforme",
      change: stats.uptimeChange || 0,
      icon: <Activity className="h-4 w-4 text-sky-400" />,
      onClick: () => router.push("/settings/system")
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          change={card.change}
          icon={card.icon}
          onClick={card.onClick}
          badge={card.badge}
          badgeColor={card.badgeColor}
        />
      ))}
    </div>
  )
}
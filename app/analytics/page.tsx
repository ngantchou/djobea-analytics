"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiClient } from "@/lib/api-client"
import { AnalyticsStats } from "@/components/features/analytics/analytics-stats"
import { AnalyticsCharts } from "@/components/features/analytics/analytics-charts"
import { AnalyticsInsights } from "@/components/features/analytics/analytics-insights"
import { AnalyticsLeaderboard } from "@/components/features/analytics/analytics-leaderboard"
import { AnalyticsQuickActions } from "@/components/features/analytics/analytics-quick-actions"
import { AnalyticsFilters } from "@/components/features/analytics/analytics-filters"
import { AnalyticsToolbar } from "@/components/analytics-toolbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-8 w-16 bg-gray-800" />
                <Skeleton className="h-3 w-32 bg-gray-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <Skeleton className="h-80 bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <Skeleton className="h-96 bg-gray-800" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <Skeleton className="h-96 bg-gray-800" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AnalyticsError({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <Alert className="border-red-800 bg-red-900/20">
      <AlertCircle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2">Erreur lors du chargement des données analytiques</p>
            <p className="text-sm text-red-400">
              {error?.message || "Le backend analytique semble indisponible. Utilisation des données de démonstration."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-700 text-red-300 hover:bg-red-800 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

function AnalyticsContent() {
  const [period, setPeriod] = useState("7d")
  const [filters, setFilters] = useState({})
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use API client for authenticated requests
      const response = await apiClient.getAnalyticsData(period)
      
      if (response.success) {
        setData(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch analytics data')
      }
    } catch (err) {
      console.error('Analytics API error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [period])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleRefresh = () => {
    loadAnalyticsData()
  }

  if (loading) {
    return <AnalyticsLoadingSkeleton />
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6"
    >
      {/* Error Banner */}
      {error && (
        <motion.div variants={itemVariants}>
          <AnalyticsError error={error} onRetry={handleRefresh} />
        </motion.div>
      )}

      {/* Toolbar with Filters Button */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <AnalyticsToolbar selectedPeriod={period} onPeriodChange={setPeriod} />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
          {showFilters ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>
      </motion.div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <AnalyticsFilters period={period} onPeriodChange={setPeriod} onFiltersChange={handleFiltersChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <AnalyticsStats data={data?.stats} period={period} />
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants}>
        <AnalyticsCharts data={data?.charts} period={period} />
      </motion.div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AnalyticsInsights data={data?.insights} />
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants}>
          <AnalyticsLeaderboard data={data?.leaderboard} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Analyse détaillée des performances et métriques</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AnalyticsContent />
        </Suspense>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnalyticsQuickActions />
        </motion.div>
      </div>
    </div>
  )
}
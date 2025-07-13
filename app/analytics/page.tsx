"use client"

import { useState, Suspense } from "react"
import { AnalyticsStats } from "@/components/features/analytics/analytics-stats"
import { AnalyticsCharts } from "@/components/features/analytics/analytics-charts"
import { AnalyticsInsights } from "@/components/features/analytics/analytics-insights"
import { AnalyticsLeaderboard } from "@/components/features/analytics/analytics-leaderboard"
import { AnalyticsQuickActions } from "@/components/features/analytics/analytics-quick-actions"
import { AnalyticsFilters } from "@/components/features/analytics/analytics-filters"
import { AnalyticsToolbar } from "@/components/analytics-toolbar"
import { Card, CardContent } from "@/components/ui/card"
import { useAnalyticsData } from "@/hooks/use-analytics-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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

function AnalyticsError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert className="border-red-800 bg-red-900/20">
      <AlertCircle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-red-300">
        <div className="flex items-center justify-between">
          <span>Erreur lors du chargement des données: {error.message}</span>
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

  const { data, isLoading, error, refetch } = useAnalyticsData(period)

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleRefresh = () => {
    refetch()
  }

  if (error) {
    return <AnalyticsError error={error} onRetry={handleRefresh} />
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <AnalyticsToolbar selectedPeriod={period} onPeriodChange={setPeriod} />

      {/* Filters */}
      <AnalyticsFilters period={period} onPeriodChange={setPeriod} onFiltersChange={handleFiltersChange} />

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <Skeleton className="h-20 bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnalyticsStats data={data?.stats} period={period} />
      )}

      {/* Charts Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <Skeleton className="h-80 bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnalyticsCharts data={data?.charts} period={period} />
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <Skeleton className="h-96 bg-gray-800" />
              </CardContent>
            </Card>
          ) : (
            <AnalyticsInsights data={data?.insights} />
          )}
        </div>

        {/* Leaderboard */}
        <div>
          {isLoading ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <Skeleton className="h-96 bg-gray-800" />
              </CardContent>
            </Card>
          ) : (
            <AnalyticsLeaderboard data={data?.leaderboard} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Analyse détaillée des performances et métriques</p>
          </div>
        </div>

        {/* Main Content */}
        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AnalyticsContent />
        </Suspense>

        {/* Quick Actions */}
        <AnalyticsQuickActions />
      </div>
    </div>
  )
}

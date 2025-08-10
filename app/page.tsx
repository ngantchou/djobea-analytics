"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertCircle, CheckCircle } from "lucide-react"
import { useDashboardData, useKPIsData } from "@/hooks/use-api-data"
import { StatsGrid } from "@/components/features/dashboard/stats-grid"
import { RecentActivity } from "@/components/features/dashboard/recent-activity"
import { ChartSection } from "@/components/features/dashboard/chart-section"
import { QuickActions } from "@/components/features/dashboard/quick-actions"
import { Suspense } from "react"
import { InteractiveMap } from "@/components/geolocation/interactive-map"
import { MapPin } from "lucide-react"

export default function DashboardPage() {
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboardData()
  const { data: kpisData, isLoading: isKPIsLoading, error: kpisError } = useKPIsData()

  // Test backend connection on mount
  useEffect(() => {
    console.log("🚀 Dashboard mounted - testing backend connection")
    console.log("📊 Dashboard data:", dashboardData)
    console.log("📈 KPIs data:", kpisData)
  }, [dashboardData, kpisData])

  if (isDashboardLoading || isKPIsLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (dashboardError || kpisError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur de connexion au backend: {dashboardError?.message || kpisError?.message}
            <br />
            
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Backend connecté
          </Badge>
          <Button>Actualiser</Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <StatsGrid data={kpisData} />

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Charts Section */}
        <div className="col-span-4">
          <ChartSection data={dashboardData} />
        </div>

        {/* Recent Activity */}
        <div className="col-span-3">
          <RecentActivity data={dashboardData} />
        </div>
      </div>
      {/* Carte Interactive */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Aperçu Géographique
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <Suspense fallback={<div className="h-full bg-gray-700 rounded animate-pulse" />}>
            <InteractiveMap compact={true} />
          </Suspense>
        </CardContent>
      </Card>

      <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse" />}>
        {/* Quick Actions */}
        <QuickActions />
      </Suspense>
    </div>
  )
}

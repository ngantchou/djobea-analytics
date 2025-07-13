"use client"

import { Suspense } from "react"
import { DashboardTitle } from "@/components/features/dashboard/dashboard-title"
import { StatsGrid } from "@/components/features/dashboard/stats-grid"
import { ChartSection } from "@/components/features/dashboard/chart-section"
import { RecentActivity } from "@/components/features/dashboard/recent-activity"
import { QuickActions } from "@/components/features/dashboard/quick-actions"
import { InteractiveMap } from "@/components/geolocation/interactive-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardTitle />

      <Suspense fallback={<DashboardLoading />}>
        <StatsGrid />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-96 bg-gray-200 rounded animate-pulse" />}>
          <ChartSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 bg-gray-200 rounded animate-pulse" />}>
          <RecentActivity />
        </Suspense>
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
        <QuickActions />
      </Suspense>
    </div>
  )
}

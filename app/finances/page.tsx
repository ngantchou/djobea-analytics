"use client"

import { Suspense } from "react"
import { FinancesStats } from "@/components/features/finances/finances-stats"
import { FinancesCharts } from "@/components/features/finances/finances-charts"
import { FinancesFilters } from "@/components/features/finances/finances-filters"
import { FinancesQuickActions } from "@/components/features/finances/finances-quick-actions"
import { TransactionsTable } from "@/components/features/finances/transactions-table"
import { ForecastPanel } from "@/components/features/finances/forecast-panel"

export default function FinancesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Finances
            </h1>
            <p className="text-gray-400 mt-1">Gérez vos revenus, dépenses et prévisions financières</p>
          </div>
          <FinancesQuickActions />
        </div>

        {/* Filters */}
        <FinancesFilters />

        {/* Stats */}
        <Suspense fallback={<div className="animate-pulse bg-gray-800 h-32 rounded-lg" />}>
          <FinancesStats />
        </Suspense>

        {/* Charts and Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="animate-pulse bg-gray-800 h-96 rounded-lg" />}>
              <FinancesCharts />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<div className="animate-pulse bg-gray-800 h-96 rounded-lg" />}>
              <ForecastPanel />
            </Suspense>
          </div>
        </div>

        {/* Transactions Table */}
        <Suspense fallback={<div className="animate-pulse bg-gray-800 h-96 rounded-lg" />}>
          <TransactionsTable />
        </Suspense>
      </div>
    </div>
  )
}

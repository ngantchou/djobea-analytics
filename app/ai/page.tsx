import { Suspense } from "react"
import AIPredictions from "@/components/features/ai/ai-predictions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prédictions IA - Djobea Analytics",
  description: "Intelligence artificielle pour anticiper et optimiser vos opérations",
}

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<AIPageSkeleton />}>
          <AIPredictions />
        </Suspense>
      </div>
    </div>
  )
}

function AIPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-96"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-700 rounded w-24"></div>
          <div className="h-9 bg-gray-700 rounded w-24"></div>
          <div className="h-9 bg-gray-700 rounded w-24"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4">
            <div className="h-6 bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-700 rounded flex-1"></div>
          ))}
        </div>

        {/* Models Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="h-6 w-6 bg-gray-700 rounded"></div>
                <div className="h-5 bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-5 bg-gray-700 rounded w-32 mb-1"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-3"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-12"></div>
                </div>
                <div className="h-1 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-64"></div>
            </div>
            <div className="h-9 bg-gray-700 rounded w-32"></div>
          </div>
          <div className="h-80 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  )
}

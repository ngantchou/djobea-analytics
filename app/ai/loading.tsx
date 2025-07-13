export default function AILoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-96"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 bg-gray-700 rounded w-32"></div>
              <div className="h-9 bg-gray-700 rounded w-24"></div>
              <div className="h-9 bg-gray-700 rounded w-24"></div>
              <div className="h-9 bg-gray-700 rounded w-24"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="h-6 bg-gray-700 rounded w-16 mb-2 mx-auto"></div>
                <div className="h-4 bg-gray-700 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="grid w-full grid-cols-3 bg-gray-800/50 rounded-lg p-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-700 rounded mx-1"></div>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
              {/* Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-6 w-6 bg-gray-700 rounded"></div>
                      <div className="h-5 bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="h-5 bg-gray-700 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-3"></div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                        <div className="h-4 bg-gray-700 rounded w-12"></div>
                      </div>
                      <div className="h-1 bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Skeleton */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-64"></div>
                    </div>
                    <div className="h-9 bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80 bg-gray-700 rounded mb-4"></div>
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

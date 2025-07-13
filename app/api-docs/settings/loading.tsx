"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SettingsApiDocsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="h-10 bg-gray-700 rounded-lg mb-2 animate-pulse" />
              <div className="h-6 bg-gray-800 rounded-lg mb-4 w-2/3 animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-6 bg-gray-700 rounded-full w-24 animate-pulse" />
                <div className="h-6 bg-gray-700 rounded-full w-28 animate-pulse" />
                <div className="h-6 bg-gray-700 rounded-full w-20 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-gray-700 rounded-lg w-32 animate-pulse" />
              <div className="h-10 bg-gray-700 rounded-lg w-28 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Search and Filters Skeleton */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-10 bg-gray-800 rounded-lg animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-700 rounded-lg w-20 animate-pulse" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Skeleton */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg w-32 animate-pulse" />
            ))}
          </div>
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded-lg w-48 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-4 bg-gray-800 rounded-lg w-3/4 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-700 rounded-lg w-32 animate-pulse" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-700 rounded-lg w-32 animate-pulse" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Endpoints List Skeleton */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-6 bg-gray-700 rounded-full w-16 animate-pulse" />
                          <div className="h-6 bg-gray-800 rounded-lg w-48 animate-pulse" />
                          <div className="h-6 bg-gray-700 rounded-full w-20 animate-pulse" />
                        </div>
                        <div className="h-6 bg-gray-700 rounded-lg mb-1 w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded-lg w-full animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 bg-gray-700 rounded-lg w-16 animate-pulse" />
                      </div>
                    </div>

                    {/* Example Response Skeleton */}
                    {index % 3 === 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="h-5 bg-gray-700 rounded-lg w-32 mb-2 animate-pulse" />
                        <div className="bg-gray-800 p-3 rounded space-y-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-3 bg-gray-700 rounded animate-pulse" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Responses Skeleton */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="h-5 bg-gray-700 rounded-lg w-20 mb-2 animate-pulse" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-6 bg-gray-700 rounded-full w-24 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

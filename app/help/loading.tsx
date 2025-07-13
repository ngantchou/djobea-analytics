"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HelpLoading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Skeleton className="h-12 w-96 mx-auto bg-gray-800" />
            <Skeleton className="h-6 w-[600px] mx-auto bg-gray-800" />
            <Skeleton className="h-14 w-[500px] mx-auto bg-gray-800 rounded-lg" />
          </motion.div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24 bg-gray-700" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-gray-700" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-8 w-8 rounded-lg bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-700" />
                      <Skeleton className="h-3 w-16 bg-gray-700" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-700" />
                    <Skeleton className="h-6 w-48 bg-gray-700" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="p-4 bg-gray-700/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-64 bg-gray-600" />
                        <Skeleton className="h-5 w-16 bg-gray-600" />
                      </div>
                      <Skeleton className="h-4 w-full bg-gray-600" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 bg-gray-600" />
                        <Skeleton className="h-4 w-16 bg-gray-600" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

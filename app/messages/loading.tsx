"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex h-[calc(100vh-8rem)] bg-gray-800 rounded-lg overflow-hidden">
          {/* Contacts Sidebar Skeleton */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <Skeleton className="h-6 w-24 mb-4 bg-gray-700" />
              <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
            </div>

            {/* Contacts List */}
            <div className="flex-1 p-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Skeleton className="w-12 h-12 rounded-full bg-gray-700" />
                      <Skeleton className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gray-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-16 bg-gray-700" />
                      </div>
                      <Skeleton className="h-3 w-48 bg-gray-700" />
                      <Skeleton className="h-3 w-20 bg-gray-700" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area Skeleton */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <Skeleton className="h-3 w-20 bg-gray-700" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 bg-gray-700" />
                <Skeleton className="w-8 h-8 bg-gray-700" />
                <Skeleton className="w-8 h-8 bg-gray-700" />
              </div>
            </div>

            {/* Messages Skeleton */}
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div className="max-w-[70%]">
                    <Skeleton className={`h-16 w-64 rounded-lg ${i % 2 === 0 ? "bg-gray-700" : "bg-blue-600/20"}`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input Skeleton */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-end gap-2">
                <Skeleton className="flex-1 h-20 bg-gray-700 rounded-lg" />
                <div className="flex items-center gap-1">
                  <Skeleton className="w-8 h-8 bg-gray-700" />
                  <Skeleton className="w-8 h-8 bg-gray-700" />
                  <Skeleton className="w-8 h-8 bg-gray-700" />
                  <Skeleton className="w-10 h-8 bg-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

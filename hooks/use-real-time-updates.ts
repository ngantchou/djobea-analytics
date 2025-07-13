"use client"

import { useEffect } from "react"
import { useDashboardStore } from "@/store/use-dashboard-store"

export function useRealTimeUpdates() {
  const { updateStats, isRealTimeEnabled, setLastUpdate } = useDashboardStore()

  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      // Simulate real-time data updates
      const updates = {
        totalRequests: Math.floor(Math.random() * 3) - 1, // -1 to +1
        pendingRequests: Math.floor(Math.random() * 3) - 1,
        activeProviders: Math.floor(Math.random() * 2), // 0 to +1
      }

      // Only update if there are actual changes
      const hasChanges = Object.values(updates).some((value) => value !== 0)
      if (hasChanges) {
        updateStats(updates)
        setLastUpdate(new Date())
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [updateStats, isRealTimeEnabled, setLastUpdate])
}

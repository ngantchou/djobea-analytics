"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/lib/services/dashboard-service"
import { logger } from "@/lib/logger"

export function useDashboardData(period = "7d") {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => dashboardService.getDashboardData(period),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      logger.error("Dashboard data fetch failed", { error, period })
    },
  })
}

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

// Hook générique pour les données avec cache et refetch
export function useApiData<T>(
  queryKey: string[],
  queryFn: () => Promise<any>,
  options?: {
    staleTime?: number
    refetchInterval?: number
    enabled?: boolean
  },
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 30 * 1000, // 30 secondes par défaut
    refetchInterval: options?.refetchInterval || 60 * 1000, // 1 minute par défaut
    enabled: options?.enabled !== false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Hook pour les mutations avec gestion d'erreur
export function useApiMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: V) => void
    onError?: (error: Error, variables: V) => void
    invalidateQueries?: string[][]
  },
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables)

      // Invalider les queries spécifiées
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
    },
    onError: (error: Error, variables) => {
      console.error("Mutation error:", error)
      toast.error(error.message || "Une erreur est survenue")
      options?.onError?.(error, variables)
    },
  })
}

// Hooks spécifiques pour chaque entité
export function useDashboardData(period = "7d") {
  return useApiData(["dashboard", period], () => apiClient.getDashboardData(period))
}

export function useAnalyticsData(period = "7d") {
  return useApiData(["analytics", period], () => apiClient.getAnalyticsData(period))
}

export function useKPIsData(period = "7d") {
  return useApiData(["analytics", "kpis", period], () => apiClient.getKPIs(period))
}

export function useInsightsData() {
  return useApiData(["analytics", "insights"], () => apiClient.getInsights())
}

export function useProvidersData(params?: any) {
  return useApiData(["providers", params], () => apiClient.getProviders(params))
}

export function useRequestsData(params?: any) {
  return useApiData(["requests", params], () => apiClient.getRequests(params))
}

export function useFinancesData(params?: any) {
  return useApiData(["finances", params], () => apiClient.getFinancesData(params))
}

export function useAIPredictionsData(type?: string) {
  return useApiData(["ai", "predictions", type], () => apiClient.getAIPredictions(type))
}

export function useGeolocationData(bounds?: any) {
  return useApiData(["geolocation", bounds], () => apiClient.getGeolocationData(bounds))
}

export function useNotificationsData(params?: any) {
  return useApiData(["notifications", params], () => apiClient.getNotifications(params))
}

// Mutations communes
export function useUpdateProviderStatus() {
  return useApiMutation(
    ({ id, status }: { id: string; status: string }) => apiClient.updateProviderStatus(id, status),
    {
      onSuccess: () => toast.success("Statut mis à jour avec succès"),
      invalidateQueries: [["providers"]],
    },
  )
}

export function useAssignRequest() {
  return useApiMutation(
    ({ requestId, providerId }: { requestId: string; providerId: string }) =>
      apiClient.assignRequest(requestId, providerId),
    {
      onSuccess: () => toast.success("Demande assignée avec succès"),
      invalidateQueries: [["requests"], ["providers"]],
    },
  )
}

export function useUpdateRequestStatus() {
  return useApiMutation(({ id, status }: { id: string; status: string }) => apiClient.updateRequestStatus(id, status), {
    onSuccess: () => toast.success("Statut mis à jour avec succès"),
    invalidateQueries: [["requests"]],
  })
}

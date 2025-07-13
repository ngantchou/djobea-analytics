"use client"

import { useState, useEffect, useCallback } from "react"
import { providersService, type Provider } from "@/lib/services/providers-service"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export interface ProvidersFilters {
  search: string
  status: string
  specialty: string
  zone: string
  minRating: string
  sortBy?: "name" | "rating" | "missions" | "joinDate"
  sortOrder?: "asc" | "desc"
}

export interface ProvidersPagination {
  page: number
  totalPages: number
  total: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ProvidersStats {
  total: number
  active: number
  inactive: number
  suspended: number
  available: number
  avgRating: number
  newThisMonth: number
  topPerformers: Provider[]
}

export function useProvidersData(filters: ProvidersFilters, page: number, pageSize: number) {
  const [data, setData] = useState<Provider[]>([])
  const [stats, setStats] = useState<ProvidersStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<ProvidersPagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    startIndex: 0,
    endIndex: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        limit: pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        specialty: filters.specialty || undefined,
        zone: filters.zone || undefined,
        minRating: filters.minRating ? Number.parseFloat(filters.minRating) : undefined,
        sortBy: filters.sortBy || "name",
        sortOrder: filters.sortOrder || "asc",
      }

      const result = await providersService.getProviders(params)

      setData(result.providers)
      setStats(result.stats)

      // Calculate pagination
      const calculatedPagination: ProvidersPagination = {
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        total: result.total,
        startIndex: (result.pagination.page - 1) * pageSize + 1,
        endIndex: Math.min(result.pagination.page * pageSize, result.total),
        hasNextPage: result.pagination.hasNext,
        hasPrevPage: result.pagination.hasPrev,
      }

      setPagination(calculatedPagination)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des données"
      setError(message)
      logger.error("Failed to fetch providers", { error: err, filters, page, pageSize })

      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, page, pageSize, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const createProvider = useCallback(
    async (providerData: Omit<Provider, "id" | "joinDate" | "lastActivity">) => {
      try {
        setLoading(true)
        await providersService.createProvider(providerData)
        await fetchData() // Refresh data after creation

        toast({
          title: "Succès",
          description: "Prestataire créé avec succès",
          variant: "default",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création"
        logger.error("Failed to create provider", { error: err, providerData })

        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchData, toast],
  )

  const updateProvider = useCallback(
    async (id: string, updates: Partial<Provider>) => {
      try {
        setLoading(true)
        await providersService.updateProvider(id, updates)
        await fetchData() // Refresh data after update

        toast({
          title: "Succès",
          description: "Prestataire mis à jour avec succès",
          variant: "default",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour"
        logger.error("Failed to update provider", { error: err, id, updates })

        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchData, toast],
  )

  const deleteProvider = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await providersService.deleteProvider(id)
        await fetchData() // Refresh data after deletion

        toast({
          title: "Succès",
          description: "Prestataire supprimé avec succès",
          variant: "default",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression"
        logger.error("Failed to delete provider", { error: err, id })

        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchData, toast],
  )

  const updateProviderStatus = useCallback(
    async (id: string, status: Provider["status"]) => {
      try {
        await providersService.updateProviderStatus(id, status)
        await fetchData() // Refresh data after status update

        toast({
          title: "Succès",
          description: `Statut du prestataire mis à jour: ${status}`,
          variant: "default",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut"
        logger.error("Failed to update provider status", { error: err, id, status })

        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchData, toast],
  )

  return {
    data,
    stats,
    pagination,
    loading,
    error,
    refetch,
    createProvider,
    updateProvider,
    deleteProvider,
    updateProviderStatus,
  }
}

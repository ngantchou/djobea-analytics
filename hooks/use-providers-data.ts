"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

interface ProvidersFilters {
  page?: number
  limit?: number
  search?: string
  service?: string
  location?: string
  status?: string
  rating?: number
  specialty?: string
  zone?: string
}

interface Provider {
  id: string
  name: string
  phone: string
  whatsapp?: string
  email?: string
  services: string[]
  coverageAreas: string[]
  rating: number
  reviewCount: number
  totalMissions: number
  status: "active" | "inactive" | "suspended"
  availability: "available" | "busy" | "offline"
  specialty: string
  zone: string
  joinDate: string
  lastActivity: string
  hourlyRate?: number
  experience?: number
  profileImage?: string
  description?: string
}

interface ApiResponse {
  success: boolean
  data: Provider[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    total: number
    active: number
    inactive: number
    suspended: number
    available: number
    avgRating: number
    newThisMonth: number
  }
  error?: string
  message?: string
}

export function useProvidersData(filters: ProvidersFilters = {}) {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching providers with filters:", filters)

      // Call the API with proper error handling
      const result = await apiClient.getProviders(filters)

      console.log("📦 API Response:", result)

      if (result.success) {
        setData(result)
        console.log("✅ Providers data set successfully")
      } else {
        const errorMessage = result.error || "Failed to fetch providers data"
        throw new Error(errorMessage)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des prestataires"
      setError(message)
      console.error("❌ Failed to fetch providers data:", { error: err, filters })
      
      logger.error("Failed to fetch providers data", { error: err, filters })

      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    console.log("🚀 useEffect triggered, calling fetchData")
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    console.log("🔄 Manual refetch triggered")
    fetchData()
  }, [fetchData])

  const createProvider = useCallback(
    async (providerData: any) => {
      try {
        setLoading(true)
        console.log("➕ Creating provider:", providerData)
        
        const result = await apiClient.createProvider(providerData)
        
        if (result.success) {
          toast({
            title: "Succès",
            description: "Prestataire créé avec succès",
          })
          await refetch() // Refresh data after creation
          return result.data
        } else {
          throw new Error(result.error || "Failed to create provider")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création du prestataire"
        console.error("❌ Failed to create provider:", err)
        
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
    [refetch],
  )

  const updateProvider = useCallback(
    async (id: string, providerData: any) => {
      try {
        setLoading(true)
        console.log("✏️ Updating provider:", { id, data: providerData })
        
        const result = await apiClient.updateProvider(id, providerData)
        
        if (result.success) {
          toast({
            title: "Succès",
            description: "Prestataire mis à jour avec succès",
          })
          await refetch() // Refresh data after update
          return result.data
        } else {
          throw new Error(result.error || "Failed to update provider")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du prestataire"
        console.error("❌ Failed to update provider:", err)
        
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
    [refetch],
  )

  const deleteProvider = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        console.log("🗑️ Deleting provider:", id)
        
        const result = await apiClient.deleteProvider(id)
        
        if (result.success) {
          toast({
            title: "Succès",
            description: "Prestataire supprimé avec succès",
          })
          await refetch() // Refresh data after deletion
          return result.data
        } else {
          throw new Error(result.error || "Failed to delete provider")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression du prestataire"
        console.error("❌ Failed to delete provider:", err)
        
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
    [refetch],
  )

  // Log current state for debugging
  useEffect(() => {
    console.log("📊 Hook state:", { 
      hasData: !!data, 
      loading, 
      error, 
      providersCount: data?.data?.length || 0 
    })
  }, [data, loading, error])

  return {
    data,
    loading,
    error,
    refetch,
    createProvider,
    updateProvider,
    deleteProvider,
  }
}
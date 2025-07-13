"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Request {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string
  serviceType: string
  description: string
  location: string
  address: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  completedDate?: string
  assignedProvider?: {
    id: string
    name: string
    rating: number
  }
  estimatedCost: number
  finalCost?: number
  rating?: number
  feedback?: string
  urgency: boolean
  images?: string[]
  notes?: string
}

export interface RequestsStats {
  total: number
  pending: number
  assigned: number
  inProgress: number
  completed: number
  cancelled: number
  avgResponseTime: string
  completionRate: number
}

export interface RequestsFilters {
  page: number
  limit: number
  search: string
  status: string
  priority: string
  service: string
  zone: string
  dateRange: string
}

export interface RequestsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useRequestsData(filters: RequestsFilters) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<Request[]>([])
  const [stats, setStats] = useState<RequestsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<RequestsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        serviceType: filters.service,
        location: filters.zone,
        dateRange: filters.dateRange,
      })

      const response = await fetch(`/api/requests?${searchParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setRequests(data.data || [])
      setStats(data.stats || null)
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue"
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  const updateRequest = useCallback(
    async (id: string, updates: Partial<Request>) => {
      try {
        const response = await fetch(`/api/requests/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const updatedRequest = await response.json()

        setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, ...updatedRequest } : request)))

        toast({
          title: "Demande mise à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        })
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la demande",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const assignRequest = useCallback(
    async (requestId: string, providerId: string, providerName: string) => {
      try {
        const response = await fetch(`/api/requests/${requestId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ providerId }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        setRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: "assigned",
                  assignedProvider: { id: providerId, name: providerName, rating: 4.5 },
                  updatedAt: new Date().toISOString(),
                }
              : request,
          ),
        )

        toast({
          title: "Demande assignée",
          description: `La demande a été assignée à ${providerName}`,
        })
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible d'assigner la demande",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const cancelRequest = useCallback(
    async (requestId: string, reason: string) => {
      try {
        const response = await fetch(`/api/requests/${requestId}/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        setRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: "cancelled",
                  notes: reason,
                  updatedAt: new Date().toISOString(),
                }
              : request,
          ),
        )

        toast({
          title: "Demande annulée",
          description: "La demande a été annulée avec succès",
        })
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible d'annuler la demande",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const refetch = useCallback(() => {
    return fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return {
    requests,
    stats,
    loading,
    error,
    pagination,
    refetch,
    updateRequest,
    assignRequest,
    cancelRequest,
  }
}

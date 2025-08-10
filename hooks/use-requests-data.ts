"use client"

import { useState, useEffect, useCallback } from "react"
import { RequestsService } from "@/lib/services/requests-service"
import type { ServiceRequest, RequestFilters, CreateRequestData, UpdateRequestData, AssignRequestData } from "@/lib/services/requests-service"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

interface RequestsFilters extends RequestFilters {
  page?: number
  limit?: number
  search?: string
  serviceType?: string
  location?: string
  priority?: string
  status?: string
  dateRange?: string
}

interface RequestsData {
  requests: ServiceRequest[]
  total: number
  page: number
  totalPages: number
  stats?: {
    total: number
    pending: number
    assigned: number
    inProgress: number
    completed: number
    cancelled: number
    avgResponseTime?: string
    completionRate?: number
  }
}

export function useRequestsData(filters: RequestsFilters = {}) {
  const [data, setData] = useState<RequestsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Transform filters to match service expectations
  const transformFilters = useCallback((filters: RequestsFilters): RequestFilters => {
    const {
      page,
      limit,
      search,
      serviceType,
      location,
      priority,
      status,
      dateRange,
      ...restFilters
    } = filters

    const transformedFilters: RequestFilters = {
      ...restFilters,
    }

    // Transform status string to array if provided
    if (status && status !== "all") {
      transformedFilters.status = [status]
    }

    // Transform priority string to array if provided
    if (priority && priority !== "all") {
      transformedFilters.priority = [priority]
    }

    // Transform serviceType to category array if provided
    if (serviceType && serviceType !== "all") {
      transformedFilters.category = [serviceType]
    }

    // Transform location string to location filter
    if (location && location !== "all") {
      transformedFilters.location = location
    }

    // Transform dateRange string to date range object
    if (dateRange && dateRange !== "all") {
      const today = new Date()
      let start: string, end: string
      
      switch (dateRange) {
        case "today":
          start = today.toISOString().split('T')[0]
          end = start
          break
        case "week":
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          start = weekStart.toISOString().split('T')[0]
          end = today.toISOString().split('T')[0]
          break
        case "month":
          start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
          end = today.toISOString().split('T')[0]
          break
        case "quarter":
          const quarter = Math.floor(today.getMonth() / 3)
          start = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
          end = today.toISOString().split('T')[0]
          break
        default:
          break
      }
      
      if (start! && end!) {
        transformedFilters.dateRange = { start, end }
      }
    }

    // Handle search by adding it to the filters (service should handle search logic)
    if (search && search.trim()) {
      transformedFilters.search = search.trim()
    }

    return transformedFilters
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const transformedFilters = transformFilters(filters)
      const page = filters.page || 1
      const limit = filters.limit || 20

      const result = await RequestsService.getRequests(transformedFilters, page, limit)

      setData({
        requests: result.requests,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        stats: result.stats, // Include stats from the API response
      })

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des demandes"
      setError(message)
      logger.error("Failed to fetch requests data", { error: err, filters })

      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters), toast, transformFilters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const createRequest = useCallback(
    async (requestData: CreateRequestData) => {
      try {
        const result = await RequestsService.createRequest(requestData)
        
        toast({
          title: "Succès",
          description: "Demande créée avec succès",
        })
        
        refetch()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la création de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const updateRequest = useCallback(
    async (id: string, requestData: UpdateRequestData) => {
      try {
        const result = await RequestsService.updateRequest(id, requestData)
        
        toast({
          title: "Succès",
          description: "Demande mise à jour avec succès",
        })
        
        refetch()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const assignRequest = useCallback(
    async (id: string, assignData: AssignRequestData) => {
      try {
        const result = await RequestsService.assignRequest(id, assignData)
        
        toast({
          title: "Succès",
          description: "Demande assignée avec succès",
        })
        
        refetch()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'assignation de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const cancelRequest = useCallback(
    async (id: string, reason: string) => {
      try {
        const result = await RequestsService.cancelRequest(id, reason)
        
        toast({
          title: "Succès",
          description: "Demande annulée avec succès",
        })
        
        refetch()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'annulation de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const updateStatus = useCallback(
    async (id: string, status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled", notes?: string) => {
      try {
        const result = await RequestsService.updateStatus(id, status, notes)
        
        toast({
          title: "Succès",
          description: "Statut mis à jour avec succès",
        })
        
        refetch()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const deleteRequest = useCallback(
    async (id: string) => {
      try {
        await RequestsService.deleteRequest(id)
        
        toast({
          title: "Succès",
          description: "Demande supprimée avec succès",
        })
        
        refetch()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const duplicateRequest = useCallback(
    async (id: string) => {
      try {
        const result = await RequestsService.duplicateRequest(id)
        
        toast({
          title: "Succès",
          description: "Demande dupliquée avec succès",
        })
        
        refetch()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la duplication de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const uploadAttachment = useCallback(
    async (requestId: string, file: File) => {
      try {
        const url = await RequestsService.uploadAttachment(requestId, file)
        
        toast({
          title: "Succès",
          description: "Pièce jointe uploadée avec succès",
        })
        
        refetch()
        return url
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'upload de la pièce jointe"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const removeAttachment = useCallback(
    async (requestId: string, attachmentUrl: string) => {
      try {
        await RequestsService.removeAttachment(requestId, attachmentUrl)
        
        toast({
          title: "Succès",
          description: "Pièce jointe supprimée avec succès",
        })
        
        refetch()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la pièce jointe"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast, refetch],
  )

  const contactProvider = useCallback(
    async (id: string, message: string) => {
      try {
        await RequestsService.contactProvider(id, message)
        
        toast({
          title: "Succès",
          description: "Message envoyé au prestataire",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'envoi du message"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const generateInvoice = useCallback(
    async (id: string) => {
      try {
        const blob = await RequestsService.generateInvoice(id)
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `facture-demande-${id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Succès",
          description: "Facture générée et téléchargée",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la génération de la facture"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const exportRequests = useCallback(
    async (format: "csv" | "xlsx" | "pdf" = "csv") => {
      try {
        const transformedFilters = transformFilters(filters)
        const blob = await RequestsService.exportRequests(transformedFilters, format)
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `demandes.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Succès",
          description: "Export téléchargé avec succès",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'export"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [filters, transformFilters, toast],
  )

  // Utility functions
  const getRequest = useCallback(
    async (id: string) => {
      try {
        return await RequestsService.getRequest(id)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la récupération de la demande"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const getAvailableProviders = useCallback(
    async (requestId: string) => {
      try {
        return await RequestsService.getAvailableProviders(requestId)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la récupération des prestataires"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const getStats = useCallback(
    async () => {
      try {
        const transformedFilters = transformFilters(filters)
        return await RequestsService.getRequestStats(transformedFilters)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la récupération des statistiques"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [filters, transformFilters, toast],
  )

  return {
    // Data
    data,
    loading,
    error,
    
    // Core operations
    refetch,
    createRequest,
    updateRequest,
    assignRequest,
    cancelRequest,
    updateStatus,
    deleteRequest,
    duplicateRequest,
    
    // File operations
    uploadAttachment,
    removeAttachment,
    
    // Communication
    contactProvider,
    
    // Reports & Export
    generateInvoice,
    exportRequests,
    
    // Utility functions
    getRequest,
    getAvailableProviders,
    getStats,
  }
}
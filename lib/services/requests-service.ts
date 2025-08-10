"use client"

import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export interface ServiceRequest {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  providerId?: string
  providerName?: string
  assignedAt?: string
  completedAt?: string
  location: {
    address: string
    city: string
    postalCode: string
    coordinates?: [number, number]
  }
  budget?: {
    min: number
    max: number
    currency: string
  }
  scheduledDate?: string
  estimatedDuration?: number
  tags: string[]
  attachments: string[]
  notes?: string
  rating?: number
  feedback?: string
  createdAt: string
  updatedAt: string
}

export interface RequestFilters {
  status?: string[]
  category?: string[]
  priority?: string[]
  dateRange?: {
    start: string
    end: string
  }
  location?: string
  providerId?: string
  clientId?: string
  search?: string
}

export interface CreateRequestData {
  title: string
  description: string
  category: string
  subcategory?: string
  priority: "low" | "medium" | "high" | "urgent"
  clientName: string
  clientEmail: string
  clientPhone: string
  location: {
    address: string
    city: string
    postalCode: string
  }
  budget?: {
    min: number
    max: number
    currency: string
  }
  scheduledDate?: string
  estimatedDuration?: number
  tags?: string[]
  attachments?: string[]
  notes?: string
}

export interface UpdateRequestData extends Partial<CreateRequestData> {
  status?: "pending" | "assigned" | "in-progress" | "completed" | "cancelled"
  providerId?: string
  rating?: number
  feedback?: string
}

export interface AssignRequestData {
  providerId: string
  notes?: string
  scheduledDate?: string
  estimatedCost?: number
}

export interface RequestStats {
  total: number
  pending: number
  assigned: number
  inProgress: number
  completed: number
  cancelled: number
  averageCompletionTime: number
  satisfactionRate: number
}

export class RequestsService {
  private serviceName = "RequestsService"

  // Helper method to validate request data
  private validateRequestData(data: CreateRequestData): void {
    if (!data.title?.trim()) {
      throw new Error("Le titre de la demande est requis")
    }
    
    if (!data.description?.trim()) {
      throw new Error("La description est requise")
    }
    
    if (!data.category?.trim()) {
      throw new Error("La catégorie est requise")
    }
    
    if (!data.clientName?.trim()) {
      throw new Error("Le nom du client est requis")
    }
    
    if (!data.clientEmail?.trim()) {
      throw new Error("L'email du client est requis")
    }
    
    if (data.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clientEmail)) {
      throw new Error("Format d'email invalide")
    }
    
    if (!data.clientPhone?.trim()) {
      throw new Error("Le téléphone du client est requis")
    }
    
    if (!data.location?.address?.trim()) {
      throw new Error("L'adresse est requise")
    }
    
    if (!data.location?.city?.trim()) {
      throw new Error("La ville est requise")
    }
    
    if (data.budget && (data.budget.min < 0 || data.budget.max < 0 || data.budget.min > data.budget.max)) {
      throw new Error("Budget invalide")
    }
    
    if (data.estimatedDuration && data.estimatedDuration < 0) {
      throw new Error("La durée estimée doit être positive")
    }
  }

  static async getRequests(
    filters?: RequestFilters,
    page = 1,
    limit = 20,
  ): Promise<{
    requests: ServiceRequest[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      logger.info("Fetching requests", { filters, page, limit })

      const result = await apiClient.getRequests({
        ...filters,
        page,
        limit,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch requests")
      }
      logger.info("Requests result fetched successfully", {
        result
      })
      const response = {
        requests: result?.data || [],
        total: result?.pagination?.total || 0,
        page: result?.pagination?.page || page,
        totalPages: result?.pagination?.totalPages || Math.ceil((result?.pagination?.total || 0) / limit),
        // Pass stats directly from API response - your API already has the correct format
        stats: result?.stats || null,
      }

      logger.info("Requests fetched successfully", {
        count: response.requests.length,
        total: response.total,
      })

      return response
    } catch (error) {
      logger.error("Failed to fetch requests", { error, filters, page, limit })
      throw error
    }
  }

  static async getRequest(id: string): Promise<ServiceRequest> {
    try {
      logger.info("Fetching request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      const result = await apiClient.getRequest(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch request")
      }

      logger.info("Request fetched successfully", { id })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to fetch request", { error, id })
      throw error
    }
  }

  static async createRequest(data: CreateRequestData): Promise<ServiceRequest> {
    try {
      logger.info("Creating request", { title: data.title })

      // Validate data before sending
      const service = new RequestsService()
      service.validateRequestData(data)

      const result = await apiClient.createRequest(data)

      if (!result.success) {
        throw new Error(result.error || "Failed to create request")
      }

      logger.info("Request created successfully", { id: result.data?.id })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to create request", { error, data })
      throw error
    }
  }

  static async updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest> {
    try {
      logger.info("Updating request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      const result = await apiClient.updateRequest(id, data)

      if (!result.success) {
        throw new Error(result.error || "Failed to update request")
      }

      logger.info("Request updated successfully", { id })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to update request", { error, id, data })
      throw error
    }
  }

  static async deleteRequest(id: string): Promise<void> {
    try {
      logger.info("Deleting request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      const result = await apiClient.deleteRequest(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete request")
      }

      logger.info("Request deleted successfully", { id })
    } catch (error) {
      logger.error("Failed to delete request", { error, id })
      throw error
    }
  }

  static async assignRequest(id: string, data: AssignRequestData): Promise<ServiceRequest> {
    try {
      logger.info("Assigning request", { id, providerId: data.providerId })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      if (!data.providerId) {
        throw new Error("L'ID du prestataire est requis")
      }

      const result = await apiClient.assignRequest(id, data.providerId)

      if (!result.success) {
        throw new Error(result.error || "Failed to assign request")
      }

      logger.info("Request assigned successfully", { id, providerId: data.providerId })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to assign request", { error, id, data })
      throw error
    }
  }

  static async updateStatus(id: string, status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled", notes?: string): Promise<ServiceRequest> {
    try {
      logger.info("Updating request status", { id, status })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      if (!status) {
        throw new Error("Le statut est requis")
      }

      const result = await apiClient.updateRequestStatus(id, status, notes)

      if (!result.success) {
        throw new Error(result.error || "Failed to update request status")
      }

      logger.info("Request status updated successfully", { id, status })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to update request status", { error, id, status })
      throw error
    }
  }

  static async cancelRequest(id: string, reason: string): Promise<ServiceRequest> {
    try {
      logger.info("Cancelling request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      if (!reason?.trim()) {
        throw new Error("La raison d'annulation est requise")
      }

      const result = await apiClient.cancelRequest(id, reason)

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel request")
      }

      logger.info("Request cancelled successfully", { id })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to cancel request", { error, id, reason })
      throw error
    }
  }

  static async contactProvider(id: string, message: string): Promise<void> {
    try {
      logger.info("Contacting provider for request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      if (!message?.trim()) {
        throw new Error("Le message est requis")
      }

      // Since this method doesn't exist in apiClient, we'll use the generic request method
      const result = await apiClient.request(`/api/requests/${id}/contact-provider`, {
        method: "POST",
        body: { message },
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to contact provider")
      }

      logger.info("Provider contacted successfully", { id })
    } catch (error) {
      logger.error("Failed to contact provider", { error, id, message })
      throw error
    }
  }

  static async generateInvoice(id: string): Promise<Blob> {
    try {
      logger.info("Generating invoice for request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      const result = await apiClient.downloadFile(`/api/requests/${id}/invoice`)
      
      logger.info("Invoice generated successfully", { id })
      return result
    } catch (error) {
      logger.error("Failed to generate invoice", { error, id })
      throw error
    }
  }

  static async getRequestStats(filters?: RequestFilters): Promise<RequestStats> {
    try {
      logger.info("Fetching request stats", { filters })

      const result = await apiClient.getRequestsStats()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch request stats")
      }

      logger.info("Request stats fetched successfully")
      return result.data as RequestStats
    } catch (error) {
      logger.error("Failed to fetch request stats", { error, filters })
      throw error
    }
  }

  static async getAvailableProviders(requestId: string): Promise<any[]> {
    try {
      logger.info("Fetching available providers for request", { requestId })

      if (!requestId) {
        throw new Error("L'ID de la demande est requis")
      }

      const result = await apiClient.request(`/api/requests/${requestId}/available-providers`)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch available providers")
      }

      logger.info("Available providers fetched successfully", { requestId })
      return result.data as any[]
    } catch (error) {
      logger.error("Failed to fetch available providers", { error, requestId })
      throw error
    }
  }

  static async uploadAttachment(requestId: string, file: File): Promise<string> {
    try {
      logger.info("Uploading attachment for request", { requestId, fileName: file.name })

      if (!requestId) {
        throw new Error("L'ID de la demande est requis")
      }

      if (!file) {
        throw new Error("Le fichier est requis")
      }

      const result = await apiClient.uploadFile(file, `/api/requests/${requestId}/attachments`)

      if (!result.success) {
        throw new Error(result.error || "Failed to upload attachment")
      }

      logger.info("Attachment uploaded successfully", { requestId, fileName: file.name })
      return result.data?.url || result.data
    } catch (error) {
      logger.error("Failed to upload attachment", { error, requestId, fileName: file.name })
      throw error
    }
  }

  static async removeAttachment(requestId: string, attachmentUrl: string): Promise<void> {
    try {
      logger.info("Removing attachment from request", { requestId, attachmentUrl })

      if (!requestId) {
        throw new Error("L'ID de la demande est requis")
      }

      if (!attachmentUrl) {
        throw new Error("L'URL de la pièce jointe est requise")
      }

      const result = await apiClient.request(`/api/requests/${requestId}/attachments`, {
        method: "DELETE",
        body: { url: attachmentUrl },
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to remove attachment")
      }

      logger.info("Attachment removed successfully", { requestId, attachmentUrl })
    } catch (error) {
      logger.error("Failed to remove attachment", { error, requestId, attachmentUrl })
      throw error
    }
  }

  static async duplicateRequest(id: string): Promise<ServiceRequest> {
    try {
      logger.info("Duplicating request", { id })

      if (!id) {
        throw new Error("L'ID de la demande est requis")
      }

      const result = await apiClient.request(`/api/requests/${id}/duplicate`, {
        method: "POST",
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to duplicate request")
      }

      logger.info("Request duplicated successfully", { id, newId: result.data?.id })
      return result.data as ServiceRequest
    } catch (error) {
      logger.error("Failed to duplicate request", { error, id })
      throw error
    }
  }

  static async exportRequests(filters?: RequestFilters, format: "csv" | "xlsx" | "pdf" = "csv"): Promise<Blob> {
    try {
      logger.info("Exporting requests", { filters, format })

      const result = await apiClient.exportRequests(filters, format)

      if (!result.success) {
        throw new Error(result.error || "Failed to export requests")
      }

      logger.info("Requests exported successfully", { format })
      return result.data as Blob
    } catch (error) {
      logger.error("Failed to export requests", { error, filters, format })
      throw error
    }
  }

  // Utility methods for better UX
  static async validateRequestExists(id: string): Promise<boolean> {
    try {
      await this.getRequest(id)
      return true
    } catch (error) {
      return false
    }
  }

  static async getRequestsByStatus(status: ServiceRequest["status"]): Promise<ServiceRequest[]> {
    try {
      const result = await this.getRequests({ status: [status] })
      return result.requests
    } catch (error) {
      logger.error("Failed to get requests by status", { error, status })
      throw error
    }
  }

  static async getRequestsByCategory(category: string): Promise<ServiceRequest[]> {
    try {
      const result = await this.getRequests({ category: [category] })
      return result.requests
    } catch (error) {
      logger.error("Failed to get requests by category", { error, category })
      throw error
    }
  }

  static async getRequestsByProvider(providerId: string): Promise<ServiceRequest[]> {
    try {
      const result = await this.getRequests({ providerId })
      return result.requests
    } catch (error) {
      logger.error("Failed to get requests by provider", { error, providerId })
      throw error
    }
  }

  static async getRequestsByClient(clientId: string): Promise<ServiceRequest[]> {
    try {
      const result = await this.getRequests({ clientId })
      return result.requests
    } catch (error) {
      logger.error("Failed to get requests by client", { error, clientId })
      throw error
    }
  }

  static async getPendingRequests(): Promise<ServiceRequest[]> {
    return this.getRequestsByStatus("pending")
  }

  static async getCompletedRequests(limit?: number): Promise<ServiceRequest[]> {
    try {
      const result = await this.getRequests({ status: ["completed"] }, 1, limit || 20)
      return result.requests
    } catch (error) {
      logger.error("Failed to get completed requests", { error })
      throw error
    }
  }

  static async getUrgentRequests(): Promise<ServiceRequest[]> {
    try {
      const result = await this.getRequests({ priority: ["urgent"] })
      return result.requests
    } catch (error) {
      logger.error("Failed to get urgent requests", { error })
      throw error
    }
  }

  // Batch operations
  static async bulkUpdateStatus(requestIds: string[], status: ServiceRequest["status"], notes?: string): Promise<void> {
    try {
      logger.info("Bulk updating request status", { count: requestIds.length, status })

      const promises = requestIds.map(id => this.updateStatus(id, status, notes))
      await Promise.all(promises)

      logger.info("Bulk status update completed successfully")
    } catch (error) {
      logger.error("Failed to bulk update request status", { error, requestIds, status })
      throw error
    }
  }

  static async bulkAssignRequests(assignments: Array<{ requestId: string; providerId: string; notes?: string }>): Promise<void> {
    try {
      logger.info("Bulk assigning requests", { count: assignments.length })

      const promises = assignments.map(({ requestId, providerId, notes }) => 
        this.assignRequest(requestId, { providerId, notes })
      )
      await Promise.all(promises)

      logger.info("Bulk assignment completed successfully")
    } catch (error) {
      logger.error("Failed to bulk assign requests", { error, assignments })
      throw error
    }
  }

  static async bulkDeleteRequests(requestIds: string[]): Promise<void> {
    try {
      logger.info("Bulk deleting requests", { count: requestIds.length })

      const promises = requestIds.map(id => this.deleteRequest(id))
      await Promise.all(promises)

      logger.info("Bulk deletion completed successfully")
    } catch (error) {
      logger.error("Failed to bulk delete requests", { error, requestIds })
      throw error
    }
  }

  // Advanced filtering and search
  static async searchRequestsAdvanced(searchParams: {
    query?: string
    filters?: RequestFilters
    sortBy?: "createdAt" | "updatedAt" | "priority" | "status"
    sortOrder?: "asc" | "desc"
    page?: number
    limit?: number
  }): Promise<{
    requests: ServiceRequest[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      logger.info("Advanced search for requests", { searchParams })

      const { query, filters, sortBy, sortOrder, page = 1, limit = 20 } = searchParams

      // Combine search query with filters
      const combinedFilters: RequestFilters = {
        ...filters,
        search: query,
      }

      // Add sorting parameters if provided
      const requestParams: any = {
        ...combinedFilters,
        page,
        limit,
      }

      if (sortBy) {
        requestParams.sortBy = sortBy
        requestParams.sortOrder = sortOrder || "desc"
      }

      const result = await this.getRequests(combinedFilters, page, limit)

      logger.info("Advanced search completed", { 
        query, 
        resultsCount: result.requests.length 
      })

      return result
    } catch (error) {
      logger.error("Failed to perform advanced search", { error, searchParams })
      throw error
    }
  }
}
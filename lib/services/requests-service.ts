import { ApiClient } from "@/lib/api-client"

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
  status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
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
      const response = await ApiClient.post<{
        requests: ServiceRequest[]
        total: number
        page: number
        totalPages: number
      }>("/api/requests", {
        filters,
        page,
        limit,
      })
      return response
    } catch (error) {
      console.error("Get requests error:", error)
      throw new Error("Erreur lors de la récupération des demandes")
    }
  }

  static async getRequest(id: string): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.get<ServiceRequest>(`/api/requests/${id}`)
      return response
    } catch (error) {
      console.error("Get request error:", error)
      throw new Error("Erreur lors de la récupération de la demande")
    }
  }

  static async createRequest(data: CreateRequestData): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.post<ServiceRequest>("/api/requests/create", data)
      return response
    } catch (error) {
      console.error("Create request error:", error)
      throw new Error("Erreur lors de la création de la demande")
    }
  }

  static async updateRequest(id: string, data: UpdateRequestData): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.put<ServiceRequest>(`/api/requests/${id}`, data)
      return response
    } catch (error) {
      console.error("Update request error:", error)
      throw new Error("Erreur lors de la mise à jour de la demande")
    }
  }

  static async deleteRequest(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/requests/${id}`)
    } catch (error) {
      console.error("Delete request error:", error)
      throw new Error("Erreur lors de la suppression de la demande")
    }
  }

  static async assignRequest(id: string, data: AssignRequestData): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.post<ServiceRequest>(`/api/requests/${id}/assign`, data)
      return response
    } catch (error) {
      console.error("Assign request error:", error)
      throw new Error("Erreur lors de l'assignation de la demande")
    }
  }

  static async updateStatus(id: string, status: ServiceRequest["status"], notes?: string): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.post<ServiceRequest>(`/api/requests/${id}/status`, {
        status,
        notes,
      })
      return response
    } catch (error) {
      console.error("Update status error:", error)
      throw new Error("Erreur lors de la mise à jour du statut")
    }
  }

  static async cancelRequest(id: string, reason: string): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.post<ServiceRequest>(`/api/requests/${id}/cancel`, {
        reason,
      })
      return response
    } catch (error) {
      console.error("Cancel request error:", error)
      throw new Error("Erreur lors de l'annulation de la demande")
    }
  }

  static async contactProvider(id: string, message: string): Promise<void> {
    try {
      await ApiClient.post(`/api/requests/${id}/contact-provider`, {
        message,
      })
    } catch (error) {
      console.error("Contact provider error:", error)
      throw new Error("Erreur lors du contact du prestataire")
    }
  }

  static async generateInvoice(id: string): Promise<Blob> {
    try {
      const response = await ApiClient.get(`/api/requests/${id}/invoice`, {
        responseType: "blob",
      })
      return response
    } catch (error) {
      console.error("Generate invoice error:", error)
      throw new Error("Erreur lors de la génération de la facture")
    }
  }

  static async getRequestStats(filters?: RequestFilters): Promise<RequestStats> {
    try {
      const response = await ApiClient.post<RequestStats>("/api/requests/stats", { filters })
      return response
    } catch (error) {
      console.error("Get request stats error:", error)
      throw new Error("Erreur lors de la récupération des statistiques")
    }
  }

  static async getAvailableProviders(requestId: string): Promise<any[]> {
    try {
      const response = await ApiClient.get<any[]>(`/api/requests/${requestId}/available-providers`)
      return response
    } catch (error) {
      console.error("Get available providers error:", error)
      throw new Error("Erreur lors de la récupération des prestataires disponibles")
    }
  }

  static async uploadAttachment(requestId: string, file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await ApiClient.post<{ url: string }>(`/api/requests/${requestId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.url
    } catch (error) {
      console.error("Upload attachment error:", error)
      throw new Error("Erreur lors du téléchargement de la pièce jointe")
    }
  }

  static async removeAttachment(requestId: string, attachmentUrl: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/requests/${requestId}/attachments`, {
        data: { url: attachmentUrl },
      })
    } catch (error) {
      console.error("Remove attachment error:", error)
      throw new Error("Erreur lors de la suppression de la pièce jointe")
    }
  }

  static async duplicateRequest(id: string): Promise<ServiceRequest> {
    try {
      const response = await ApiClient.post<ServiceRequest>(`/api/requests/${id}/duplicate`)
      return response
    } catch (error) {
      console.error("Duplicate request error:", error)
      throw new Error("Erreur lors de la duplication de la demande")
    }
  }

  static async exportRequests(filters?: RequestFilters, format: "csv" | "xlsx" | "pdf" = "csv"): Promise<Blob> {
    try {
      const response = await ApiClient.post(
        "/api/requests/export",
        {
          filters,
          format,
        },
        {
          responseType: "blob",
        },
      )
      return response
    } catch (error) {
      console.error("Export requests error:", error)
      throw new Error("Erreur lors de l'export des demandes")
    }
  }
}

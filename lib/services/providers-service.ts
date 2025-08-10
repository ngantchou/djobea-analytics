"use client"

import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/lib/api-client"

export interface Provider {
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
  successRate: number
  responseTime: number
  performanceStatus: "excellent" | "good" | "warning" | "poor"
  status: "active" | "inactive" | "suspended"
  availability: "available" | "busy" | "offline"
  specialty: string
  zone: string
  joinDate: string
  lastActivity: string
  completedJobs: number
  cancelledJobs: number
  averageRating: number
  profileImage?: string
  description?: string
  certifications?: string[]
  hourlyRate?: number
  experience?: number
  acceptanceRate?: number
  location?: {
    lat: number
    lng: number
    address: string
  }
  workingHours?: {
    [key: string]: { start: string; end: string } | null
  }
  pricing?: {
    hourlyRate?: number
    fixedRates?: Record<string, number>
  }
}

export interface ProvidersFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  specialty?: string
  zone?: string
  minRating?: number
  services?: string[]
  availability?: boolean
  sortBy?: "name" | "rating" | "missions" | "joinDate"
  sortOrder?: "asc" | "desc"
}

export interface ProvidersResponse {
  providers: Provider[]
  total: number
  stats: {
    total: number
    active: number
    inactive: number
    suspended: number
    available: number
    avgRating: number
    newThisMonth: number
    topPerformers: Provider[]
  }
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateProviderData {
  name: string
  phone: string
  whatsapp?: string
  email?: string
  services: string
  coverage: string
  rate?: string
  experience?: string
  description?: string
}

export interface UpdateProviderData extends CreateProviderData {
  id?: string
}

export interface ProviderContactOptions {
  method: "call" | "whatsapp" | "email"
  message?: string
}

export interface AvailableProvidersFilters {
  serviceType?: string
  location?: string
  limit?: number
  radius?: number
  urgency?: boolean
  date?: string
}

class ProvidersService {
  private serviceName = "ProvidersService"

  // Helper method to transform form data before sending to API
  private transformProviderData(data: CreateProviderData) {
    return {
      ...data,
      services: data.services?.split(',').map(s => s.trim()).filter(Boolean) || [],
      coverageAreas: data.coverage?.split(',').map(s => s.trim()).filter(Boolean) || [],
      hourlyRate: data.rate ? Number(data.rate) : undefined,
      experience: data.experience ? Number(data.experience) : undefined,
    }
  }

  // Helper method to validate provider data
  private validateProviderData(data: CreateProviderData): void {
    if (!data.name?.trim()) {
      throw new Error("Le nom du prestataire est requis")
    }
    
    if (!data.phone?.trim()) {
      throw new Error("Le numéro de téléphone est requis")
    }
    
    if (!data.services?.trim()) {
      throw new Error("Les services sont requis")
    }
    
    if (!data.coverage?.trim()) {
      throw new Error("Les zones de couverture sont requises")
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("Format d'email invalide")
    }
    
    if (data.rate && (isNaN(Number(data.rate)) || Number(data.rate) < 0)) {
      throw new Error("Le tarif doit être un nombre positif")
    }
    
    if (data.experience && (isNaN(Number(data.experience)) || Number(data.experience) < 0)) {
      throw new Error("L'expérience doit être un nombre positif")
    }
  }

  async getProviders(filters?: ProvidersFilters): Promise<ProvidersResponse> {
    try {
      logger.info("Fetching providers", { filters })

      const result = await apiClient.getProviders(filters)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch providers")
      }

      const response: ProvidersResponse = {
        providers: result.data?.data || [],
        total: result.data?.pagination?.total || 0,
        stats: result.data?.stats || {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          available: 0,
          avgRating: 0,
          newThisMonth: 0,
          topPerformers: [],
        },
        pagination: result.data?.pagination || {
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }

      logger.info("Providers fetched successfully", {
        count: response.providers.length,
        total: response.total,
      })

      return response
    } catch (error) {
      logger.error("Failed to fetch providers", { error, filters })
      throw error
    }
  }

  async getProvider(id: string): Promise<Provider> {
    try {
      logger.info("Fetching provider", { id })

      if (!id) {
        throw new Error("Provider ID is required")
      }

      const result = await apiClient.getProvider(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch provider")
      }

      logger.info("Provider fetched successfully", { id })
      return result.data as Provider
    } catch (error) {
      logger.error("Failed to fetch provider", { error, id })
      throw error
    }
  }

  async createProvider(providerData: CreateProviderData): Promise<Provider> {
    try {
      logger.info("Creating provider", { name: providerData.name })

      // Validate data before sending
      this.validateProviderData(providerData)

      // Transform data for API
      const transformedData = this.transformProviderData(providerData)

      const result = await apiClient.createProvider(transformedData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create provider")
      }

      logger.info("Provider created successfully", { id: result.data?.id })
      return result.data as Provider
    } catch (error) {
      logger.error("Failed to create provider", { error, providerData })
      throw error
    }
  }

  async updateProvider(id: string, updates: CreateProviderData): Promise<Provider> {
    try {
      logger.info("Updating provider", { id, updates })

      if (!id) {
        throw new Error("Provider ID is required")
      }

      // Validate data before sending
      this.validateProviderData(updates)

      // Transform data for API
      const transformedData = this.transformProviderData(updates)

      const result = await apiClient.updateProvider(id, transformedData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update provider")
      }

      logger.info("Provider updated successfully", { id })
      return result.data?.data || result.data as Provider
    } catch (error) {
      logger.error("Failed to update provider", { error, id, updates })
      throw error
    }
  }

  async deleteProvider(id: string): Promise<void> {
    try {
      logger.info("Deleting provider", { id })

      if (!id) {
        throw new Error("Provider ID is required")
      }

      const result = await apiClient.deleteProvider(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete provider")
      }

      logger.info("Provider deleted successfully", { id })
    } catch (error) {
      logger.error("Failed to delete provider", { error, id })
      throw error
    }
  }

  async updateProviderStatus(id: string, status: Provider["status"]): Promise<void> {
    try {
      logger.info("Updating provider status", { id, status })

      if (!id) {
        throw new Error("Provider ID is required")
      }

      if (!status) {
        throw new Error("Provider status is required")
      }

      const result = await apiClient.updateProviderStatus(id, status)

      if (!result.success) {
        throw new Error(result.error || "Failed to update provider status")
      }

      logger.info("Provider status updated successfully", { id, status })
    } catch (error) {
      logger.error("Failed to update provider status", { error, id, status })
      throw error
    }
  }

  async contactProvider(id: string, options: ProviderContactOptions): Promise<void> {
    try {
      logger.info("Contacting provider", { id, method: options.method })

      if (!id) {
        throw new Error("Provider ID is required")
      }

      if (!options.method) {
        throw new Error("Contact method is required")
      }

      // Note: This method doesn't exist in apiClient yet, so we'll call it directly
      // You can add it to apiClient if needed, or keep this direct implementation
      const result = await apiClient.request(`/api/providers/${id}/contact`, {
        method: "POST",
        body: options,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to contact provider")
      }

      logger.info("Provider contacted successfully", { id, method: options.method })
    } catch (error) {
      logger.error("Failed to contact provider", { error, id, options })
      throw error
    }
  }

  async getAvailableProviders(filters?: AvailableProvidersFilters): Promise<Provider[]> {
    try {
      logger.info("Fetching available providers", { filters })

      const result = await apiClient.getAvailableProviders(filters || {})

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch available providers")
      }

      logger.info("Available providers fetched successfully", { 
        count: result.data?.data?.length || result.data?.length || 0 
      })
      
      return (result.data?.data || result.data || []) as Provider[]
    } catch (error) {
      logger.error("Failed to fetch available providers", { error, filters })
      throw error
    }
  }

  async searchProviders(query: string): Promise<Provider[]> {
    try {
      logger.info("Searching providers", { query })

      if (!query?.trim()) {
        throw new Error("Search query is required")
      }

      const result = await apiClient.searchProviders({ q: query })

      if (!result.success) {
        throw new Error(result.error || "Failed to search providers")
      }

      logger.info("Provider search completed", { 
        query, 
        resultsCount: result.data?.data?.length || result.data?.length || 0 
      })
      
      return (result.data?.data || result.data || []) as Provider[]
    } catch (error) {
      logger.error("Failed to search providers", { error, query })
      throw error
    }
  }

  async getProvidersStats(): Promise<any> {
    try {
      logger.info("Fetching providers stats")

      const result = await apiClient.getProvidersStats()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch providers stats")
      }

      logger.info("Providers stats fetched successfully")
      return result.data
    } catch (error) {
      logger.error("Failed to fetch providers stats", { error })
      throw error
    }
  }

  async getProvidersCount(): Promise<number> {
    try {
      logger.info("Fetching providers count")

      const result = await apiClient.getProvidersCount()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch providers count")
      }

      logger.info("Providers count fetched successfully")
      return result.data?.count || result.data || 0
    } catch (error) {
      logger.error("Failed to fetch providers count", { error })
      throw error
    }
  }

  // Utility methods for better UX
  async validateProviderExists(id: string): Promise<boolean> {
    try {
      await this.getProvider(id)
      return true
    } catch (error) {
      return false
    }
  }

  async getProvidersByService(serviceType: string): Promise<Provider[]> {
    try {
      return this.searchProviders(serviceType)
    } catch (error) {
      logger.error("Failed to get providers by service", { error, serviceType })
      throw error
    }
  }

  async getProvidersByZone(zone: string): Promise<Provider[]> {
    try {
      const result = await this.getProviders({ zone })
      return result.providers
    } catch (error) {
      logger.error("Failed to get providers by zone", { error, zone })
      throw error
    }
  }

  // Batch operations helper
  async bulkUpdateStatus(providerIds: string[], status: Provider["status"]): Promise<void> {
    try {
      logger.info("Bulk updating provider status", { count: providerIds.length, status })

      const promises = providerIds.map(id => this.updateProviderStatus(id, status))
      await Promise.all(promises)

      logger.info("Bulk status update completed successfully")
    } catch (error) {
      logger.error("Failed to bulk update provider status", { error, providerIds, status })
      throw error
    }
  }
}

// Export singleton instance
export const providersService = new ProvidersService()
export default providersService
"use client"
import { logger } from "@/lib/logger"

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

class ProvidersService {
  async getProviders(filters?: ProvidersFilters): Promise<ProvidersResponse> {
    try {
      logger.info("Fetching providers", { filters })

      const params = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/providers?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch providers")
      }

      logger.info("Providers fetched successfully", {
        count: result.data?.length || 0,
        total: result.pagination?.total || 0,
      })

      return {
        providers: result.data || [],
        total: result.pagination?.total || 0,
        stats: result.stats || {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          available: 0,
          avgRating: 0,
          newThisMonth: 0,
          topPerformers: [],
        },
        pagination: result.pagination || {
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }
    } catch (error) {
      logger.error("Failed to fetch providers", { error, filters })
      throw error
    }
  }

  async getProvider(id: string): Promise<Provider> {
    try {
      logger.info("Fetching provider", { id })

      const response = await fetch(`/api/providers/${id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch provider")
      }

      logger.info("Provider fetched successfully", { id })
      return result
    } catch (error) {
      logger.error("Failed to fetch provider", { error, id })
      throw error
    }
  }

  async createProvider(providerData: CreateProviderData): Promise<Provider> {
    try {
      logger.info("Creating provider", { name: providerData.name })

      const response = await fetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(providerData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create provider")
      }

      logger.info("Provider created successfully", { id: result.id })
      return result
    } catch (error) {
      logger.error("Failed to create provider", { error, providerData })
      throw error
    }
  }

  async updateProvider(id: string, updates: CreateProviderData): Promise<Provider> {
    try {
      logger.info("Updating provider", { id, updates })

      const response = await fetch(`/api/providers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update provider")
      }

      logger.info("Provider updated successfully", { id })
      return result.data
    } catch (error) {
      logger.error("Failed to update provider", { error, id, updates })
      throw error
    }
  }

  async deleteProvider(id: string): Promise<void> {
    try {
      logger.info("Deleting provider", { id })

      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
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

      const response = await fetch(`/api/providers/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update provider status")
      }

      logger.info("Provider status updated successfully", { id, status })
    } catch (error) {
      logger.error("Failed to update provider status", { error, id, status })
      throw error
    }
  }

  async contactProvider(id: string, method: "call" | "whatsapp" | "email", message?: string): Promise<void> {
    try {
      logger.info("Contacting provider", { id, method })

      const response = await fetch(`/api/providers/${id}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method, message }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to contact provider")
      }

      logger.info("Provider contacted successfully", { id, method })
    } catch (error) {
      logger.error("Failed to contact provider", { error, id, method })
      throw error
    }
  }

  async getAvailableProviders(filters?: {
    serviceType?: string
    location?: { lat: number; lng: number; radius?: number }
    date?: string
    urgency?: boolean
  }): Promise<Provider[]> {
    try {
      logger.info("Fetching available providers", { filters })

      const response = await fetch("/api/providers/available", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters || {}),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch available providers")
      }

      logger.info("Available providers fetched successfully", { count: result.data?.length || 0 })
      return result.data || []
    } catch (error) {
      logger.error("Failed to fetch available providers", { error, filters })
      throw error
    }
  }

  async searchProviders(query: string): Promise<Provider[]> {
    try {
      logger.info("Searching providers", { query })

      const response = await fetch(`/api/providers/search?q=${encodeURIComponent(query)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to search providers")
      }

      logger.info("Provider search completed", { query, resultsCount: result.data?.length || 0 })
      return result.data || []
    } catch (error) {
      logger.error("Failed to search providers", { error, query })
      throw error
    }
  }
}

export const providersService = new ProvidersService()
export default providersService

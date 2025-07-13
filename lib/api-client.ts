"use client"

import { logger } from "@/lib/logger"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number | boolean>
  timeout?: number
  retries?: number
  cache?: RequestCache
}

interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout = 30000
  private maxRetries = 3

  constructor() {
    // URL du backend externe
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async requestWithTimeout(url: string, config: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout")
      }
      throw error
    }
  }

  private async retryRequest<T>(requestFn: () => Promise<T>, retries: number = this.maxRetries): Promise<T> {
    try {
      return await requestFn()
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        logger.warn(`Retrying request, ${retries} attempts remaining`, { error })
        await this.delay(Math.pow(2, this.maxRetries - retries) * 1000)
        return this.retryRequest(requestFn, retries - 1)
      }
      throw error
    }
  }

  private shouldRetry(error: any): boolean {
    return (
      error instanceof TypeError ||
      (error.status >= 500 && error.status < 600) ||
      error.status === 408 ||
      error.status === 429
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private createApiError(response: Response, data?: any): ApiError {
    const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`) as ApiError
    error.status = response.status
    error.code = data?.code
    error.details = data?.details
    return error
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
      retries = this.maxRetries,
      cache = "default",
    } = options

    const url = this.buildUrl(endpoint, params)

    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      cache,
    }

    // Ajouter le token d'authentification si disponible
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    if (body && method !== "GET") {
      config.body = JSON.stringify(body)
    }

    const requestFn = async () => {
      const startTime = Date.now()

      try {
        const response = await this.requestWithTimeout(url, config, timeout)
        const duration = Date.now() - startTime

        logger.logApiRequest(method, endpoint, response.status, duration)

        let data
        const contentType = response.headers.get("content-type")

        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        if (!response.ok) {
          throw this.createApiError(response, data)
        }

        return data
      } catch (error) {
        const duration = Date.now() - startTime
        logger.error("API request failed", {
          method,
          endpoint,
          duration,
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    return this.retryRequest(requestFn, retries)
  }

  // Dashboard APIs
  async getDashboardData(period = "7d") {
    return this.request("/dashboard", {
      params: { period },
      cache: "default",
    })
  }

  // Analytics APIs
  async getAnalyticsData(period = "7d") {
    return this.request("/analytics", { params: { period } })
  }

  async getKPIs(period = "7d") {
    return this.request("/analytics/kpis", { params: { period } })
  }

  async getInsights() {
    return this.request("/analytics/insights", { cache: "force-cache" })
  }

  async getPerformanceData(period = "7d") {
    return this.request("/analytics/performance", { params: { period } })
  }

  async getServicesData(period = "7d") {
    return this.request("/analytics/services", { params: { period } })
  }

  async getGeographicData(period = "7d") {
    return this.request("/analytics/geographic", { params: { period } })
  }

  async getLeaderboard() {
    return this.request("/analytics/leaderboard")
  }

  // Providers APIs
  async getProviders(params?: {
    page?: number
    limit?: number
    search?: string
    service?: string
    location?: string
    status?: string
    rating?: number
  }) {
    return this.request("/providers", { params })
  }

  async getProvider(id: string) {
    return this.request(`/providers/${id}`)
  }

  async createProvider(data: any) {
    return this.request("/providers", { method: "POST", body: data })
  }

  async updateProvider(id: string, data: any) {
    return this.request(`/providers/${id}`, { method: "PUT", body: data })
  }

  async deleteProvider(id: string) {
    return this.request(`/providers/${id}`, { method: "DELETE" })
  }

  async updateProviderStatus(id: string, status: string) {
    return this.request(`/providers/${id}/status`, { method: "PUT", body: { status } })
  }

  // Requests APIs
  async getRequests(params?: {
    page?: number
    limit?: number
    search?: string
    serviceType?: string
    location?: string
    priority?: string
    status?: string
    dateRange?: string
  }) {
    return this.request("/requests", { params })
  }

  async getRequest(id: string) {
    return this.request(`/requests/${id}`)
  }

  async createRequest(data: any) {
    return this.request("/requests", { method: "POST", body: data })
  }

  async updateRequest(id: string, data: any) {
    return this.request(`/requests/${id}`, { method: "PUT", body: data })
  }

  async assignRequest(id: string, providerId: string) {
    return this.request(`/requests/${id}/assign`, { method: "POST", body: { providerId } })
  }

  async cancelRequest(id: string, reason: string) {
    return this.request(`/requests/${id}/cancel`, { method: "POST", body: { reason } })
  }

  async updateRequestStatus(id: string, status: string) {
    return this.request(`/requests/${id}/status`, { method: "PUT", body: { status } })
  }

  // Finances APIs
  async getFinancesData(params?: {
    dateRange?: string
    category?: string
    type?: string
    status?: string
  }) {
    return this.request("/finances", { params })
  }

  async getTransactions(params?: {
    page?: number
    limit?: number
    dateRange?: string
    category?: string
    type?: string
    status?: string
  }) {
    return this.request("/finances/transactions", { params })
  }

  // AI Predictions APIs
  async getAIPredictions(type?: string) {
    return this.request("/ai/predictions", { params: { type } })
  }

  async getAIInsights() {
    return this.request("/ai/insights")
  }

  // Geolocation APIs
  async getGeolocationData(bounds?: {
    north: number
    south: number
    east: number
    west: number
  }) {
    return this.request("/geolocation", { params: bounds })
  }

  async getZones() {
    return this.request("/zones")
  }

  // Settings APIs
  async getSettings(category?: string) {
    return this.request("/settings", { params: { category } })
  }

  async updateSettings(category: string, data: any) {
    return this.request(`/settings/${category}`, { method: "PUT", body: data })
  }

  // Export APIs
  async exportData(type: string, format: string, filters?: any) {
    return this.request("/export", {
      method: "POST",
      body: { type, format, filters },
    })
  }

  // Notifications APIs
  async getNotifications(params?: {
    page?: number
    limit?: number
    read?: boolean
    type?: string
  }) {
    return this.request("/notifications", { params })
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: "PUT" })
  }

  async markAllNotificationsAsRead() {
    return this.request("/notifications/read-all", { method: "PUT" })
  }

  // Authentication APIs
  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", { method: "POST", body: credentials })
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async refreshToken() {
    return this.request("/auth/refresh", { method: "POST" })
  }

  async getProfile() {
    return this.request("/auth/profile")
  }
}

export const apiClient = new ApiClient()

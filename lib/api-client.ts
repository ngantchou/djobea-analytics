"use client"

import { logger } from "@/lib/logger"
import { AuthService } from "@/lib/auth"

// API Configuration
const API_CONFIG = {
  // Environment-based base URLs
  baseUrls: {
    development: "",
    staging: "",
    production: "https://api.yourapp.com"
  },
  
  // Get current environment
  get currentBaseUrl() {
    const env = process.env.NODE_ENV || 'development'
    // Override with custom URL if provided
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }
    return this.baseUrls[env as keyof typeof this.baseUrls] || this.baseUrls.development
  },

  // Default settings
  defaults: {
    timeout: 3000000,
    retries: 1,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }
}

// API Endpoints Configuration
const ENDPOINTS = {
  // Authentication
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    profile: "/api/auth/profile",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    verifyEmail: "/api/auth/verify-email"
  },

  // Dashboard
  dashboard: {
    base: "/api/dashboard",
    stats: "/api/dashboard/stats",
    recent: "/api/dashboard/recent"
  },

  // Analytics
  analytics: {
    base: "/api/analytics",
    kpis: "/api/analytics/kpis",
    insights: "/api/analytics/insights",
    performance: "/api/analytics/performance",
    services: "/api/analytics/services",
    geographic: "/api/analytics/geographic",
    leaderboard: "/api/analytics/leaderboard"
  },

  // Providers
  providers: {
    base: "/api/providers",
    byId: (id: string) => `/api/providers/${id}`,
    status: (id: string) => `/api/providers/${id}/status`,
    available: "/api/providers/available",
    search: "/api/providers/search",
    count: "/api/providers/count",
    stats: "/api/providers/stats"
  },

  // Requests
  requests: {
    base: "/api/requests",
    byId: (id: string) => `/api/requests/${id}`,
    assign: (id: string) => `/api/requests/${id}/assign`,
    cancel: (id: string) => `/api/requests/${id}/cancel`,
    status: (id: string) => `/api/requests/${id}/status`
  },

  // Messages - Unified Conversations API
  messages: {
    base: "/api/messages",
    conversations: "/api/messages/conversations",
    conversationMessages: (id: string) => `/api/messages/conversations/${id}/messages`,
    send: "/api/messages/send",
    escalate: (id: string) => `/api/messages/conversations/${id}/escalate`,
    search: "/api/messages/search",
    unreadCount: "/api/messages/unread-count",
    stats: "/api/messages/stats",
    health: "/api/messages/health"
  },

  // Finances
  finances: {
    base: "/api/finances",
    transactions: "/api/finances/transactions",
    export: "/api/finances/export",
    share: "/api/finances/share",
    reports: "/api/finances/reports"
  },

  // AI
  ai: {
    predictions: "/api/ai/predictions",
    insights: "/api/ai/insights",
    recommendations: "/api/ai/recommendations"
  },

  // Settings
  settings: {
    base: "/api/settings",
    category: (category: string) => `/api/settings/${category}`,
    notifications: "/api/settings/notifications",
    security: "/api/settings/security",
    performance: "/api/settings/performance",
    testNotification: "/api/settings/notifications/test"
  },

  // System
  system: {
    health: "/api/health",
    metrics: "/api/metrics/system",
    status: "/api/system/status"
  },

  // Users
  users: {
    base: "/api/users",
    byId: (id: string) => `/api/users/${id}`,
    profile: (id: string) => `/api/users/${id}/profile`
  },

  // Roles
  roles: {
    base: "/api/roles",
    byId: (id: string) => `/api/roles/${id}`,
    permissions: (id: string) => `/api/roles/${id}/permissions`
  },

  // Notifications
  notifications: {
    base: "/api/notifications",
    read: (id: string) => `/api/notifications/${id}/read`,
    readAll: "/api/notifications/read-all",
    unsubscribe: (id: string) => `/api/notifications/${id}/unsubscribe`
  },

  // Search
  search: {
    base: "/api/search",
    suggestions: "/api/search/suggestions",
    filters: "/api/search/filters"
  },

  // Export
  export: {
    base: "/api/export",
    download: (id: string) => `/api/export/${id}/download`
  },

  // Zones
  zones: {
    base: "/api/zones",
    byId: (id: string) => `/api/zones/${id}`
  }
} as const

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number | boolean>
  timeout?: number
  retries?: number
  cache?: RequestCache
  requireAuth?: boolean
  signal?: AbortSignal
}

interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
  timestamp?: string
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number
  private maxRetries: number

  constructor() {
    this.baseUrl = "http://localhost:5000" //API_CONFIG.currentBaseUrl
    this.defaultHeaders = { ...API_CONFIG.defaults.headers }
    this.defaultTimeout = API_CONFIG.defaults.timeout
    this.maxRetries = API_CONFIG.defaults.retries

    // Log the configuration in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Client initialized with base URL: ${this.baseUrl}`)
    }
  }

  // Public method to update base URL (useful for testing or environment switching)
  public updateBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Client base URL updated to: ${this.baseUrl}`)
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Handle both absolute URLs and relative endpoints
    const url = endpoint.startsWith('http') 
      ? new URL(endpoint)
      : new URL(`${this.baseUrl}${endpoint}`)

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

    // Combine signals if one is already provided
    const combinedSignal = config.signal 
      ? this.combineSignals([controller.signal, config.signal])
      : controller.signal

    try {
      const response = await fetch(url, {
        ...config,
        signal: combinedSignal,
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

  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        break
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
    
    return controller.signal
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
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true
    }
    
    // Server errors and specific status codes
    if (error.status) {
      return error.status >= 500 || error.status === 408 || error.status === 429
    }
    
    return false
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private createApiError(response: Response, data?: any): ApiError {
    const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`) as ApiError
    error.status = response.status
    error.code = data?.code || response.status.toString()
    error.details = data?.details
    error.timestamp = new Date().toISOString()
    return error
  }

  private async handleAuthError(response: Response): Promise<boolean> {
    if (response.status === 401) {
      try {
        const refreshed = await AuthService.refreshToken()
        if (!refreshed) {
          AuthService.logout()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }
        return refreshed
      } catch (error) {
        logger.error("Failed to refresh token", error)
        return false
      }
    }
    return false
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
      requireAuth = true,
      signal
    } = options

    const url = this.buildUrl(endpoint, params)

    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      cache,
      signal
    }

    // Add authentication token if required and available
    if (requireAuth) {
      const token = AuthService.getStoredToken()
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      } else {
        const error = new Error("Authentication required but no token available") as ApiError
        error.code = "AUTH_TOKEN_MISSING"
        error.status = 401
        throw error
      }
    }

    if (body && method !== "GET") {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData, let browser set it with boundary
        delete (config.headers as any)['Content-Type']
      } else {
        config.body = JSON.stringify(body)
      }
    }

    const requestFn = async (): Promise<ApiResponse<T>> => {
      const startTime = Date.now()

      try {
        const response = await this.requestWithTimeout(url, config, timeout)
        const duration = Date.now() - startTime

        logger.logApiRequest(method, endpoint, response.status, duration)

        // Handle authentication errors with retry
        if (response.status === 401 && requireAuth) {
          const refreshed = await this.handleAuthError(response)
          if (refreshed) {
            const newToken = AuthService.getStoredToken()
            if (newToken) {
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              }
              return this.requestWithTimeout(url, config, timeout).then(async (retryResponse) => {
                let retryData
                const contentType = retryResponse.headers.get("content-type")
                
                if (contentType?.includes("application/json")) {
                  retryData = await retryResponse.json()
                } else {
                  retryData = await retryResponse.text()
                }

                if (!retryResponse.ok) {
                  throw this.createApiError(retryResponse, retryData)
                }

                return this.normalizeResponse(retryData)
              })
            }
          }
        }

        let data
        const contentType = response.headers.get("content-type")

        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else if (contentType?.includes("text/")) {
          data = await response.text()
        } else {
          data = await response.blob()
        }

        if (!response.ok) {
          throw this.createApiError(response, data)
        }

        return this.normalizeResponse(data)
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

  private normalizeResponse<T>(data: any): ApiResponse<T> {
    // If response is already in our expected format
    if (data && typeof data === "object" && data.hasOwnProperty("success")) {
      return data
    }

    // Wrap response in standard format
    return {
      success: true,
      data: data,
    }
  }

  // Authentication APIs
  async login(credentials: { username?: string; email?: string; password: string; rememberMe?: boolean }) {
    return this.request(ENDPOINTS.auth.login, {
      method: "POST",
      body: credentials,
      requireAuth: false,
    })
  }

  async register(userData: { email: string; password: string; name: string; role?: string }) {
    return this.request(ENDPOINTS.auth.register, {
      method: "POST",
      body: userData,
      requireAuth: false,
    })
  }

  async logout() {
    return this.request(ENDPOINTS.auth.logout, {
      method: "POST",
    })
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token")
    return this.request(ENDPOINTS.auth.refresh, {
      method: "POST",
      body: { refreshToken },
      requireAuth: false,
    })
  }

  async getProfile() {
    return this.request(ENDPOINTS.auth.profile)
  }

  async updateProfile(profileData: any) {
    return this.request(ENDPOINTS.auth.profile, { 
      method: "PUT", 
      body: profileData 
    })
  }

  async forgotPassword(email: string) {
    return this.request(ENDPOINTS.auth.forgotPassword, {
      method: "POST",
      body: { email },
      requireAuth: false,
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request(ENDPOINTS.auth.resetPassword, {
      method: "POST",
      body: { token, password },
      requireAuth: false,
    })
  }

  // Dashboard APIs
  async getDashboardData(period = "7d") {
    return this.request(ENDPOINTS.dashboard.base, {
      params: { period },
      cache: "default",
    })
  }

  async getDashboardStats() {
    return this.request(ENDPOINTS.dashboard.stats)
  }

  // Analytics APIs
  async getAnalyticsData(period = "7d") {
    return this.request(ENDPOINTS.analytics.base, { 
      params: { period } 
    })
  }

  async getKPIs(period = "7d") {
    return this.request(ENDPOINTS.analytics.kpis, { 
      params: { period } 
    })
  }

  async getInsights() {
    return this.request(ENDPOINTS.analytics.insights, { 
      cache: "force-cache" 
    })
  }

  async getPerformanceData(period = "7d") {
    return this.request(ENDPOINTS.analytics.performance, { 
      params: { period } 
    })
  }

  async getServicesData(period = "7d") {
    return this.request(ENDPOINTS.analytics.services, { 
      params: { period } 
    })
  }

  async getGeographicData(period = "7d") {
    return this.request(ENDPOINTS.analytics.geographic, { 
      params: { period } 
    })
  }

  async getLeaderboard() {
    return this.request(ENDPOINTS.analytics.leaderboard)
  }

  async getGeolocationData(period = "30d") {
    return this.request(ENDPOINTS.analytics.geographic, { 
      params: { period } 
    })
  }

  async getMapStats() {
    // Use working zones endpoint to calculate map statistics
    const zones = await this.request("/api/geolocation/zones", { requireAuth: false })
    if (!zones.success) {
      return {
        success: false,
        data: {providers: 0, requests: 0, pending: 0, zones: 0, activityRate: 0}
      }
    }
    
    const totalRequests = zones.data.reduce((sum: number, zone: any) => sum + zone.totalRequests, 0)
    const totalProviders = zones.data.reduce((sum: number, zone: any) => sum + zone.activeProviders, 0)
    const avgSuccessRate = zones.data.reduce((sum: number, zone: any) => sum + zone.successRate, 0) / zones.data.length
    
    return {
      success: true,
      data: {
        providers: totalProviders,
        requests: totalRequests,
        pending: Math.floor(totalRequests * 0.3), // Estimate 30% pending
        zones: zones.data.length,
        activityRate: Math.round(avgSuccessRate)
      }
    }
  }

  async getActiveCities() {
    // Use working zones endpoint and transform data to cities format
    const zones = await this.request("/api/geolocation/zones", { requireAuth: false })
    return {
      success: zones.success,
      data: zones.success ? zones.data.map((zone: any) => ({
        name: zone.name,
        requests: zone.totalRequests
      })) : []
    }
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
    return this.request(ENDPOINTS.providers.base, { params })
  }

  async getProvider(id: string) {
    return this.request(ENDPOINTS.providers.byId(id))
  }

  async createProvider(data: any) {
    return this.request(ENDPOINTS.providers.base, { 
      method: "POST", 
      body: data 
    })
  }

  async updateProvider(id: string, data: any) {
    return this.request(ENDPOINTS.providers.byId(id), { 
      method: "PUT", 
      body: data 
    })
  }

  async deleteProvider(id: string) {
    return this.request(ENDPOINTS.providers.byId(id), { 
      method: "DELETE" 
    })
  }

  async updateProviderStatus(id: string, status: string) {
    return this.request(ENDPOINTS.providers.status(id), { 
      method: "PUT", 
      body: { status } 
    })
  }

  async getAvailableProviders(params?: {
    serviceType?: string
    location?: string
    limit?: number
    radius?: number
    urgency?: boolean
    date?: string
  }) {
    return this.request(ENDPOINTS.providers.available, { 
      method: "GET", 
      params 
    })
  }

  async searchProviders(searchParams: any) {
    return this.request(ENDPOINTS.providers.search, { 
      params: searchParams 
    })
  }

  async getProvidersCount() {
    return this.request(ENDPOINTS.providers.count)
  }

  async getProvidersStats() {
    return this.request(ENDPOINTS.providers.stats)
  }

  // Continue with other API methods using ENDPOINTS configuration...
  // [Rest of the methods follow the same pattern using ENDPOINTS]

  // Utility methods
  async uploadFile(file: File, endpoint: string, additionalFields?: Record<string, any>) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    return this.request(endpoint, {
      method: "POST",
      body: formData,
    })
  }

  async downloadFile(url: string): Promise<Blob> {
    const response = await this.request<Blob>(url, {
      cache: "no-cache"
    })
    return response.data as Blob
  }

  // Health check
  async healthCheck() {
    return this.request(ENDPOINTS.system.health, {
      requireAuth: false,
      timeout: 5000,
      retries: 1
    })
  }
  // Add these methods to your ApiClient class

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
  return this.request(ENDPOINTS.requests.base, { 
    method: "GET",
    params 
  })
}

async getRequest(id: string) {
  return this.request(ENDPOINTS.requests.byId(id), {
    method: "GET"
  })
}

async createRequest(data: any) {
  return this.request(ENDPOINTS.requests.base, { 
    method: "POST", 
    body: data 
  })
}

async updateRequest(id: string, data: any) {
  return this.request(ENDPOINTS.requests.byId(id), { 
    method: "PUT", 
    body: data 
  })
}

async deleteRequest(id: string) {
  return this.request(ENDPOINTS.requests.byId(id), { 
    method: "DELETE" 
  })
}

async assignRequest(id: string, providerId: string) {
  return this.request(ENDPOINTS.requests.assign(id), { 
    method: "POST", 
    body: { providerId } 
  })
}

async cancelRequest(id: string, reason: string) {
  return this.request(ENDPOINTS.requests.cancel(id), { 
    method: "POST", 
    body: { reason } 
  })
}

async updateRequestStatus(id: string, status: string, notes?: string) {
  return this.request(ENDPOINTS.requests.status(id), { 
    method: "PUT", 
    body: { status, notes } 
  })
}

async getRequestsByProvider(providerId: string, params?: {
  status?: string
  dateRange?: string
  limit?: number
}) {
  return this.request(`/api/providers/${providerId}/requests`, {
    method: "GET",
    params
  })
}

async getRequestsByClient(clientId: string, params?: {
  status?: string
  dateRange?: string
  limit?: number
}) {
  return this.request(`/api/clients/${clientId}/requests`, {
    method: "GET",
    params
  })
}

async getRequestsStats(period = "7d") {
  return this.request("/api/requests/stats", {
    method: "GET",
    params: { period }
  })
}

async searchRequests(query: string, filters?: {
  serviceType?: string
  status?: string
  priority?: string
}) {
  return this.request("/api/requests/search", {
    method: "GET",
    params: { q: query, ...filters }
  })
}

async bulkUpdateRequests(requestIds: string[], updates: any) {
  return this.request("/api/requests/bulk", {
    method: "PUT",
    body: { requestIds, updates }
  })
}

async getRequestHistory(id: string) {
  return this.request(`/api/requests/${id}/history`, {
    method: "GET"
  })
}

async addRequestNote(id: string, note: string, isInternal = false) {
  return this.request(`/api/requests/${id}/notes`, {
    method: "POST",
    body: { note, isInternal }
  })
}

async uploadRequestAttachment(id: string, file: File, description?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }

  return this.request(`/api/requests/${id}/attachments`, {
    method: "POST",
    body: formData
  })
}

async deleteRequestAttachment(requestId: string, attachmentId: string) {
  return this.request(`/api/requests/${requestId}/attachments/${attachmentId}`, {
    method: "DELETE"
  })
}

async scheduleRequest(id: string, scheduledDate: string, notes?: string) {
  return this.request(`/api/requests/${id}/schedule`, {
    method: "POST",
    body: { scheduledDate, notes }
  })
}

async rescheduleRequest(id: string, newDate: string, reason?: string) {
  return this.request(`/api/requests/${id}/reschedule`, {
    method: "PUT",
    body: { newDate, reason }
  })
}

async completeRequest(id: string, completionData: {
  notes?: string
  rating?: number
  feedback?: string
  attachments?: string[]
}) {
  return this.request(`/api/requests/${id}/complete`, {
    method: "POST",
    body: completionData
  })
}

async estimateRequest(id: string, estimateData: {
  estimatedCost: number
  estimatedDuration: number
  materials?: string[]
  notes?: string
}) {
  return this.request(`/api/requests/${id}/estimate`, {
    method: "POST",
    body: estimateData
  })
}

async approveRequestEstimate(id: string, approved: boolean, notes?: string) {
  return this.request(`/api/requests/${id}/estimate/approve`, {
    method: "POST",
    body: { approved, notes }
  })
}

async getRequestQuotes(id: string) {
  return this.request(`/api/requests/${id}/quotes`, {
    method: "GET"
  })
}

async submitRequestQuote(id: string, quoteData: {
  amount: number
  description: string
  estimatedDuration: number
  materials?: string[]
  validUntil?: string
}) {
  return this.request(`/api/requests/${id}/quotes`, {
    method: "POST",
    body: quoteData
  })
}

async acceptRequestQuote(requestId: string, quoteId: string) {
  return this.request(`/api/requests/${requestId}/quotes/${quoteId}/accept`, {
    method: "POST"
  })
}

async rejectRequestQuote(requestId: string, quoteId: string, reason?: string) {
  return this.request(`/api/requests/${requestId}/quotes/${quoteId}/reject`, {
    method: "POST",
    body: { reason }
  })
}

async getRequestMetrics(params?: {
  period?: string
  groupBy?: string
  serviceType?: string
}) {
  return this.request("/api/requests/metrics", {
    method: "GET",
    params
  })
}

async exportRequests(filters?: any, format: string = "csv") {
  return this.request("/api/requests/export", {
    method: "POST",
    body: { filters, format }
  })
}

// Request Templates
async getRequestTemplates() {
  return this.request("/api/requests/templates", {
    method: "GET"
  })
}

async createRequestTemplate(templateData: {
  name: string
  serviceType: string
  description: string
  defaultPriority?: string
  estimatedDuration?: number
  requirements?: string[]
}) {
  return this.request("/api/requests/templates", {
    method: "POST",
    body: templateData
  })
}

async createRequestFromTemplate(templateId: string, customData?: any) {
  return this.request(`/api/requests/templates/${templateId}/create`, {
    method: "POST",
    body: customData
  })
}

// Messages/Conversations methods for unified API
async getConversations(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  const queryParams: Record<string, any> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit
  if (params?.status) queryParams.status = params.status
  if (params?.search) queryParams.search = params.search
  
  return this.request(ENDPOINTS.messages.conversations, {
    method: "GET",
    params: queryParams
  })
}

async getConversationMessages(conversationId: string, params?: {
  page?: number
  limit?: number
}) {
  const queryParams: Record<string, any> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.limit) queryParams.limit = params.limit
  
  return this.request(ENDPOINTS.messages.conversationMessages(conversationId), {
    method: "GET",
    params: queryParams
  })
}

async sendMessage(messageData: {
  conversationId?: string
  recipientId?: string
  content: string
  type?: string
  senderType?: string
  attachments?: File[]
  metadata?: any
}) {
  return this.request(ENDPOINTS.messages.send, {
    method: "POST",
    body: messageData
  })
}

async toggleEscalation(conversationId: string, data: {
  action: 'escalate' | 'deescalate'
  reason?: string
}) {
  return this.request(ENDPOINTS.messages.escalate(conversationId), {
    method: "POST",
    body: data
  })
}

async searchMessages(query: string, filters?: any) {
  return this.request(ENDPOINTS.messages.search, {
    method: "POST",
    body: { query, filters }
  })
}

async getUnreadCount() {
  return this.request(ENDPOINTS.messages.unreadCount, {
    method: "GET"
  })
}

async getMessagesStats() {
  return this.request(ENDPOINTS.messages.stats, {
    method: "GET"
  })
}

async getMessagesHealth() {
  return this.request(ENDPOINTS.messages.health, {
    method: "GET"
  })
}

// Legacy method for compatibility
async getMessages(params?: any) {
  // Map old getMessages calls to new getConversations
  return this.getConversations(params)
}
}

// Export singleton instance and configuration
export const apiClient = new ApiClient()
export { ENDPOINTS, API_CONFIG }

// Export types for use in other files
export type { ApiResponse, ApiRequestOptions, ApiError }
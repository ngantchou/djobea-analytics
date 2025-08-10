/**
 * API Configuration utility
 * Centralized configuration for API endpoints and base URLs
 */

// Get the API base URL from environment variables
export const getApiBaseUrl = (): string => {
  // Check environment variables in order of preference
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  // If we have a specific API URL, use it
  if (apiUrl) {
    // Remove trailing /api if present, we'll add it in the functions
    return apiUrl.replace(/\/api$/, '')
  }
  
  // If we have an app URL, use it
  if (appUrl) {
    return appUrl
  }
  
  // Fallback to localhost Flask server
  return "http://localhost:5000"
}

// API endpoint paths
export const API_PATHS = {
  SETTINGS: {
    GENERAL: "/api/admin/settings/general",
    ZONES: "/api/admin/settings/general/zones",
    SERVICES: "/api/admin/settings/general/services",
    ECONOMIC_MODEL: "/api/admin/settings/general/economic-model",
    NOTIFICATIONS: "/api/admin/settings/notifications",
    SECURITY: "/api/admin/settings/security",
    BUSINESS: "/api/admin/settings/business",
    BUSINESS_TEST: "/api/admin/settings/business/test",
    BUSINESS_EXPORT: "/api/admin/settings/business/export",
  },
  ANALYTICS: {
    DASHBOARD: "/api/analytics",
    KPI: "/api/analytics/kpis",
    PERFORMANCE: "/api/analytics/performance",
  }
} as const

// Utility function to build full API URLs
export const buildApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${path}`
}

// Default fetch options for API calls
export const getDefaultFetchOptions = (): RequestInit => ({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Enhanced fetch with proper error handling
export const apiRequest = async <T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> => {
  const url = buildApiUrl(path)
  const defaultOptions = getDefaultFetchOptions()
  
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        message: result.message,
      }
    }

    return result
  } catch (error) {
    console.error('API Request Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Log current configuration (for debugging)
export const logApiConfiguration = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 API Configuration:', {
      baseUrl: getApiBaseUrl(),
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
    })
  }
}
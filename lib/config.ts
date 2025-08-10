export const config = {
  // Backend API Configuration
  apiUrl: "",
  openApiUrl: "",

  // App Configuration
  app: {
    name: "Djobea Analytics",
    version: "1.0.0",
    description: "Plateforme d'analyse et de gestion des services Djobea",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Authentication
  auth: {
    tokenKey: "djobea_auth_token",
    refreshTokenKey: "djobea_refresh_token",
    userKey: "djobea_user",
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },

  // Real-time Configuration
  realtime: {
    enabled: true,
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
  },

  // Cache Configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // Maps Configuration
  maps: {
    defaultCenter: {
      lat: 4.0511, // Douala, Cameroon
      lng: 9.7679,
    },
    defaultZoom: 12,
  },

  // Feature Flags
  features: {
    enableAnalytics: true,
    enableAI: true,
    enableGeolocation: true,
    enableNotifications: true,
    enableExport: true,
    enableRealtime: true,
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
}

export default config

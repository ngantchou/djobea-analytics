export const config = {
  features: {
    realtime: process.env.ENABLE_REALTIME === "true",
    aiPredictions: process.env.ENABLE_AI_PREDICTIONS === "true",
    geolocation: process.env.ENABLE_GEOLOCATION === "true",
    whatsapp: process.env.ENABLE_WHATSAPP === "true",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    wsPort: process.env.NEXT_PUBLIC_WS_PORT || "3001",
  },
  maps: {
    googleApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  },
}

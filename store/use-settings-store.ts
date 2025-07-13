import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Zone {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "expansion"
  requestCount: number
}

interface Service {
  id: string
  name: string
  description: string
  active: boolean
  commission: number
}

interface GeneralSettings {
  appName: string
  slogan: string
  targetCity: string
  timezone: string
  defaultLanguage: string
  currency: string
  coverageRadius: number
  services: Service[]
  zones: Zone[]
  economicModel: {
    defaultCommission: number
    minMissionAmount: number
    maxMissionAmount: number
    paymentDelay: number
    serviceCommissions: Record<string, number>
  }
}

interface AISettings {
  model: string
  apiKey: string
  timeout: number
  maxTokens: number
  temperature: number
  contextMemory: boolean
  autoSuggestions: boolean
  responseDelay: number
  maxConversationLength: number
  profanityFilter: boolean
  emotionalTone: string
}

interface WhatsAppSettings {
  accountSid: string
  authToken: string
  whatsappNumber: string
  webhookUrl: string
  statusCallbackUrl: string
  connectionTimeout: number
  sendDelay: number
  dailyLimit: number
  retryAttempts: number
  queueSize: number
  failureNotifications: boolean
  detailedLogs: boolean
  devMode: boolean
}

interface SettingsState {
  general: GeneralSettings
  ai: AISettings
  whatsapp: WhatsAppSettings
  isLoading: boolean
  hasChanges: boolean

  // Actions
  updateGeneral: (settings: Partial<GeneralSettings>) => void
  updateAI: (settings: Partial<AISettings>) => void
  updateWhatsApp: (settings: Partial<WhatsAppSettings>) => void
  saveSettings: () => Promise<void>
  resetSettings: () => void
  setLoading: (loading: boolean) => void
  setHasChanges: (hasChanges: boolean) => void
}

const defaultGeneralSettings: GeneralSettings = {
  appName: "Djobea AI",
  slogan: "Services à domicile intelligents",
  targetCity: "douala",
  timezone: "Africa/Douala",
  defaultLanguage: "fr",
  currency: "XAF",
  coverageRadius: 15,
  services: [
    {
      id: "plomberie",
      name: "Plomberie",
      description: "Services de plomberie et réparations",
      active: true,
      commission: 15,
    },
    {
      id: "electricite",
      name: "Électricité",
      description: "Installation et réparation électrique",
      active: true,
      commission: 18,
    },
    {
      id: "electromenager",
      name: "Électroménager",
      description: "Réparation d'appareils électroménagers",
      active: true,
      commission: 12,
    },
    {
      id: "maintenance",
      name: "Maintenance",
      description: "Maintenance générale et petits travaux",
      active: true,
      commission: 14,
    },
    {
      id: "nettoyage",
      name: "Nettoyage",
      description: "Services de nettoyage et ménage",
      active: true,
      commission: 10,
    },
    {
      id: "jardinage",
      name: "Jardinage",
      description: "Entretien d'espaces verts et jardinage",
      active: true,
      commission: 12,
    },
  ],
  zones: [
    {
      id: "centre",
      name: "Bonamoussadi Centre",
      description: "Zone principale",
      status: "active",
      requestCount: 247,
    },
    {
      id: "nord",
      name: "Bonamoussadi Nord",
      description: "Zone active",
      status: "active",
      requestCount: 156,
    },
    {
      id: "sud",
      name: "Bonamoussadi Sud",
      description: "Zone active",
      status: "active",
      requestCount: 98,
    },
  ],
  economicModel: {
    defaultCommission: 15,
    minMissionAmount: 2500,
    maxMissionAmount: 50000,
    paymentDelay: 48,
    serviceCommissions: {
      plomberie: 15,
      electricite: 18,
      electromenager: 12,
      maintenance: 14,
      nettoyage: 10,
      jardinage: 12,
    },
  },
}

const defaultAISettings: AISettings = {
  model: "claude-sonnet-4-20250514",
  apiKey: "",
  timeout: 5,
  maxTokens: 4000,
  temperature: 0.7,
  contextMemory: true,
  autoSuggestions: true,
  responseDelay: 1,
  maxConversationLength: 50,
  profanityFilter: true,
  emotionalTone: "professional",
}

const defaultWhatsAppSettings: WhatsAppSettings = {
  accountSid: "",
  authToken: "",
  whatsappNumber: "+14155238886",
  webhookUrl: "https://api.djobea.ai/webhook/whatsapp",
  statusCallbackUrl: "https://api.djobea.ai/webhook/status",
  connectionTimeout: 10,
  sendDelay: 2,
  dailyLimit: 1000,
  retryAttempts: 3,
  queueSize: 100,
  failureNotifications: true,
  detailedLogs: true,
  devMode: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      general: defaultGeneralSettings,
      ai: defaultAISettings,
      whatsapp: defaultWhatsAppSettings,
      isLoading: false,
      hasChanges: false,

      updateGeneral: (settings) => {
        set((state) => ({
          general: { ...state.general, ...settings },
          hasChanges: true,
        }))
      },

      updateAI: (settings) => {
        set((state) => ({
          ai: { ...state.ai, ...settings },
          hasChanges: true,
        }))
      },

      updateWhatsApp: (settings) => {
        set((state) => ({
          whatsapp: { ...state.whatsapp, ...settings },
          hasChanges: true,
        }))
      },

      saveSettings: async () => {
        const { general, ai, whatsapp } = get()
        set({ isLoading: true })

        try {
          const response = await fetch("/api/settings/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ general, ai, whatsapp }),
          })

          if (!response.ok) {
            throw new Error("Erreur lors de la sauvegarde")
          }

          set({ hasChanges: false })
        } catch (error) {
          console.error("Erreur sauvegarde:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      resetSettings: () => {
        set({
          general: defaultGeneralSettings,
          ai: defaultAISettings,
          whatsapp: defaultWhatsAppSettings,
          hasChanges: true,
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setHasChanges: (hasChanges) => set({ hasChanges }),
    }),
    {
      name: "djobea-settings",
    },
  ),
)

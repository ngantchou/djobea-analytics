import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiRequest, API_PATHS } from "@/lib/api-config"

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
  loadSettings: () => Promise<void>
  updateGeneral: (settings: Partial<GeneralSettings>) => void
  updateAI: (settings: Partial<AISettings>) => void
  updateWhatsApp: (settings: Partial<WhatsAppSettings>) => void
  saveSettings: () => Promise<void>;
  resetSettings: () => void
  setLoading: (loading: boolean) => void
  setHasChanges: (hasChanges: boolean) => void
  
  // Zone management
  addZone: (zone: { name: string; description?: string }) => Promise<void>;
  updateZone: (zoneId: string, zone: { name: string; description?: string }) => Promise<void>;
  deleteZone: (zoneId: string) => Promise<void>;
  
  // Service management
  addService: (service: { name: string; description?: string; commission?: number }) => Promise<void>;
  updateService: (serviceId: string, service: { name: string; description?: string; commission?: number; active?: boolean }) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
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

      loadSettings: async () => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(API_PATHS.SETTINGS.GENERAL)
          
          if (result.success && result.data) {
            set({
              general: {
                appName: result.data.appName || "Djobea AI",
                slogan: result.data.slogan || "Services à domicile intelligents",
                targetCity: result.data.targetCity || "douala",
                timezone: result.data.timezone || "Africa/Douala",
                defaultLanguage: result.data.defaultLanguage || "fr",
                currency: result.data.currency || "XAF",
                coverageRadius: result.data.coverageRadius || 15,
                services: result.data.services || [],
                zones: result.data.zones || [],
                economicModel: result.data.economicModel || {
                  defaultCommission: 15,
                  minMissionAmount: 2500,
                  maxMissionAmount: 50000,
                  paymentDelay: 48,
                  serviceCommissions: {}
                }
              }
            })
          } else {
            console.error("Erreur chargement paramètres:", result.error)
          }
        } catch (error) {
          console.error("Erreur chargement paramètres:", error)
          // Keep default settings if API fails
        } finally {
          set({ isLoading: false })
        }
      },

      saveSettings: async () => {
        const { general } = get()
        set({ isLoading: true })

        try {
          const result = await apiRequest(API_PATHS.SETTINGS.GENERAL, {
            method: "POST",
            body: JSON.stringify(general),
          })

          if (result.success) {
            set({ hasChanges: false })
          } else {
            throw new Error(result.error || "Erreur lors de la sauvegarde")
          }
        } catch (error) {
          console.error("Erreur sauvegarde:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      addZone: async (zone: { name: string; description?: string }) => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(API_PATHS.SETTINGS.ZONES, {
            method: "POST",
            body: JSON.stringify(zone),
          })
          
          if (result.success && result.data) {
            set((state) => ({
              general: {
                ...state.general,
                zones: [...(state.general.zones || []), result.data]
              },
              hasChanges: true
            }))
          } else {
            throw new Error(result.error || "Erreur lors de l'ajout de la zone")
          }
        } catch (error) {
          console.error("Erreur ajout zone:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateZone: async (zoneId: string, zone: { name: string; description?: string }) => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(`${API_PATHS.SETTINGS.ZONES}/${zoneId}`, {
            method: "PUT",
            body: JSON.stringify(zone),
          })
          
          if (result.success && result.data) {
            set((state) => ({
              general: {
                ...state.general,
                zones: (state.general.zones || []).map(z => 
                  z.id === zoneId ? result.data : z
                )
              },
              hasChanges: true
            }))
          } else {
            throw new Error(result.error || "Erreur lors de la modification de la zone")
          }
        } catch (error) {
          console.error("Erreur modification zone:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      deleteZone: async (zoneId: string) => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(`${API_PATHS.SETTINGS.ZONES}/${zoneId}`, {
            method: "DELETE"
          })
          
          if (result.success) {
            set((state) => ({
              general: {
                ...state.general,
                zones: (state.general.zones || []).filter(z => z.id !== zoneId)
              },
              hasChanges: true
            }))
          } else {
            throw new Error(result.error || "Erreur lors de la suppression de la zone")
          }
        } catch (error) {
          console.error("Erreur suppression zone:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      addService: async (service: { name: string; description?: string; commission?: number }) => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(API_PATHS.SETTINGS.SERVICES, {
            method: "POST",
            body: JSON.stringify(service),
          })
          
          if (result.success && result.data) {
            set((state) => ({
              general: {
                ...state.general,
                services: [...(state.general.services || []), result.data],
                economicModel: {
                  ...state.general.economicModel,
                  serviceCommissions: {
                    ...state.general.economicModel.serviceCommissions,
                    [result.data.id]: result.data.commission
                  }
                }
              },
              hasChanges: true
            }))
          } else {
            throw new Error(result.error || "Erreur lors de l'ajout du service")
          }
        } catch (error) {
          console.error("Erreur ajout service:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateService: async (serviceId: string, service: { name: string; description?: string; commission?: number; active?: boolean }) => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(`${API_PATHS.SETTINGS.SERVICES}/${serviceId}`, {
            method: "PUT",
            body: JSON.stringify(service),
          })
          
          if (result.success && result.data) {
            set((state) => ({
              general: {
                ...state.general,
                services: (state.general.services || []).map(s => 
                  s.id === serviceId ? result.data : s
                ),
                economicModel: {
                  ...state.general.economicModel,
                  serviceCommissions: {
                    ...state.general.economicModel.serviceCommissions,
                    [serviceId]: result.data.commission
                  }
                }
              },
              hasChanges: true
            }))
          } else {
            throw new Error(result.error || "Erreur lors de la modification du service")
          }
        } catch (error) {
          console.error("Erreur modification service:", error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      deleteService: async (serviceId: string) => {
        set({ isLoading: true })
        
        try {
          const result = await apiRequest(`${API_PATHS.SETTINGS.SERVICES}/${serviceId}`, {
            method: "DELETE"
          })
          
          if (result.success) {
            set((state) => {
              const updatedCommissions = { ...state.general.economicModel.serviceCommissions }
              delete updatedCommissions[serviceId]
              
              return {
                general: {
                  ...state.general,
                  services: (state.general.services || []).filter(s => s.id !== serviceId),
                  economicModel: {
                    ...state.general.economicModel,
                    serviceCommissions: updatedCommissions
                  }
                },
                hasChanges: true
              }
            })
          } else {
            throw new Error(result.error || "Erreur lors de la suppression du service")
          }
        } catch (error) {
          console.error("Erreur suppression service:", error)
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

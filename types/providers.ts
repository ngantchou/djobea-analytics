export interface Provider {
  id: string
  name: string
  phone: string
  whatsapp?: string
  email?: string
  services: string[]
  coverageAreas: string[]
  hourlyRate?: number
  experience?: number
  description?: string
  rating: number
  reviewCount: number
  status: "active" | "inactive"
  availability: "available" | "busy"
  performanceStatus: "excellent" | "good" | "warning" | "danger"
  totalMissions: number
  successRate: number
  responseTime: number
  joinDate?: string
  acceptanceRate?: number
  specialty: string
  zone: string
  lastActivity: string
  completedJobs: number
  cancelledJobs: number
  averageRating: number
  profileImage?: string
}

export interface ProviderStats {
  totalProviders: number
  activeProviders: number
  newThisMonth: number
  averageRating: number
  topPerformers: Provider[]
}

export interface ProviderFilters {
  search?: string
  status?: string
  specialty?: string
  zone?: string
  minRating?: number
  sortBy?: "name" | "rating" | "missions" | "joinDate"
  sortOrder?: "asc" | "desc"
}

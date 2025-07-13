export interface Provider {
  id: string
  name: string
  phone: string
  email: string
  services: string[]
  coverageAreas: string[]
  rating: number
  reviewCount: number
  totalMissions: number
  successRate: number
  responseTime: number
  performanceStatus: "excellent" | "good" | "warning" | "danger"
  status: "active" | "inactive" | "suspended"
  specialty: string
  zone: string
  joinDate: string
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

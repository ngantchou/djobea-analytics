// Types TypeScript pour l'API Djobea Analytics

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  requestId?: string
  timestamp?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  startIndex?: number
  endIndex?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  token: string
  refreshToken: string
  user: UserInfo
  expiresAt: string
}

export interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  permissions?: string[]
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// Dashboard Types
export interface DashboardStats {
  totalRequests: number
  successRate: number
  pendingRequests: number
  activeProviders: number
}

export interface ChartData {
  labels: string[]
  values: number[]
}

export interface ActivityItem {
  id: string
  client: string
  service: string
  location: string
  time: string
  status: RequestStatus
  avatar: string
}

export interface AlertItem {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "warning" | "error" | "success"
  status: string
}

export interface DashboardData {
  stats: DashboardStats
  charts: {
    activity: ChartData
    services: ChartData
  }
  activity: {
    requests: ActivityItem[]
    alerts: AlertItem[]
  }
}

// Request Types
export type RequestStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
export type Priority = "low" | "normal" | "high" | "urgent"

export interface ClientInfo {
  name: string
  phone: string
  email?: string
  avatar: string
  address?: string
}

export interface ServiceInfo {
  type: string
  description: string
  category: string
  estimatedDuration?: string
}

export interface LocationInfo {
  address: string
  zone: string
  coordinates?: { lat: number; lng: number }
  accessInstructions?: string
}

export interface EstimatedCost {
  min: number
  max: number
  currency: string
}

export interface TimelineEvent {
  id: number
  title: string
  description: string
  timestamp: string
  status: "completed" | "current" | "pending"
}

export interface Request {
  id: string
  client: ClientInfo
  service: ServiceInfo
  location: LocationInfo
  status: RequestStatus
  priority: Priority
  createdAt: string
  updatedAt: string
  assignedProvider?: ProviderInfo
  estimatedCost?: EstimatedCost
  actualCost?: number
  images?: string[]
  notes?: string
  timeline?: TimelineEvent[]
}

export interface CreateRequestData {
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  description: string
  location: {
    address: string
    zone: string
    coordinates?: { lat: number; lng: number }
    accessInstructions?: string
  }
  priority: Priority
  scheduledDate?: string
  estimatedBudget?: number
  images?: string[]
}

export interface UpdateRequestData {
  status?: RequestStatus
  priority?: Priority
  notes?: string
  estimatedCost?: EstimatedCost
  actualCost?: number
}

export interface AssignProviderData {
  providerId: string
  notes?: string
  estimatedCost?: EstimatedCost
}

export interface CancelRequestData {
  reason: string
  comments?: string
}

// Provider Types
export type ProviderStatus = "active" | "inactive" | "suspended"
export type AvailabilityStatus = "available" | "busy" | "offline"
export type PerformanceStatus = "excellent" | "good" | "warning" | "danger"

export interface ProviderInfo {
  id: string
  name: string
  phone: string
  rating: number
  specialty?: string
}

export interface Provider {
  id: string
  name: string
  phone: string
  whatsapp: string
  email?: string
  rating: number
  reviewCount: number
  services: string[]
  coverageAreas: string[]
  totalMissions: number
  successRate: number
  responseTime: number
  acceptanceRate: number
  status: ProviderStatus
  availability: AvailabilityStatus
  performanceStatus: PerformanceStatus
  hourlyRate: number
  experience: number
  joinDate: string
  description: string
  avatar?: string
}

export interface CreateProviderData {
  name: string
  phone: string
  whatsapp?: string
  email?: string
  services: string[]
  coverageAreas: string[]
  hourlyRate: number
  experience: number
  description?: string
  documents?: {
    idCard?: string
    certificate?: string
    insurance?: string
  }
}

export interface ProviderDetails {
  id: string
  personalInfo: {
    name: string
    phone: string
    whatsapp: string
    email?: string
    address?: string
    dateOfBirth?: string
    idNumber?: string
  }
  services: {
    primary: string[]
    secondary: string[]
    hourlyRate: number
    experience: number
  }
  coverage: {
    areas: string[]
    radius: number
    preferredZones: string[]
  }
  performance: {
    rating: number
    reviewCount: number
    totalMissions: number
    successRate: number
    responseTime: number
    acceptanceRate: number
    earnings: number
  }
  availability: {
    status: AvailabilityStatus
    schedule: Record<string, { start: string; end: string; available: boolean }>
    nextAvailable?: string
  }
  reviews: Review[]
  missions: Mission[]
  documents: Record<string, { url: string; verified: boolean }>
  joinDate: string
  lastActive: string
  status: ProviderStatus
}

export interface Review {
  id: string
  client: string
  rating: number
  comment: string
  date: string
  requestId: string
}

export interface Mission {
  id: string
  client: string
  service: string
  date: string
  status: string
  rating?: number
  earnings: number
}

export interface AvailableProvider {
  id: string
  name: string
  rating: number
  distance: string
  responseTime: string
  score: number
  available: boolean
  hourlyRate: number
  services: string[]
  phone: string
  whatsapp: string
}

// Analytics Types
export interface AnalyticsStats {
  successRate: number
  responseTime: number
  totalRequests: number
  satisfaction: number
  revenue?: number
  activeProviders?: number
  trends: {
    successRate: number
    responseTime: number
    totalRequests: number
    satisfaction: number
    revenue?: number
    activeProviders?: number
  }
}

export interface PerformanceChart {
  labels: string[]
  successRate: number[]
  aiEfficiency: number[]
  satisfaction: number[]
}

export interface ServiceChart {
  labels: string[]
  data: number[]
}

export interface GeographicChart {
  labels: string[]
  data: number[]
}

export interface Insight {
  type: "positive" | "warning" | "info"
  icon: string
  title: string
  description: string
  confidence: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  missions: number
  rating: number
  responseTime: number
  score: number
}

export interface AnalyticsData {
  stats: AnalyticsStats
  charts: {
    performance: PerformanceChart
    services: ServiceChart
    geographic: GeographicChart
  }
  insights: Insight[]
  leaderboard: LeaderboardEntry[]
}

// Finance Types
export type TransactionType = "income" | "expense"
export type TransactionStatus = "pending" | "completed" | "failed"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  category: string
  description: string
  date: string
  status: TransactionStatus
  paymentMethod: string
  reference?: string
  relatedRequest?: string
  provider?: {
    id: string
    name: string
  }
  client?: {
    id: string
    name: string
  }
}

export interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  averageTransactionValue: number
  monthlyGrowth: number
  trends: {
    revenue: number
    expenses: number
    profit: number
  }
}

export interface RevenueChart {
  labels: string[]
  income: number[]
  expenses: number[]
}

export interface CashFlowChart {
  labels: string[]
  values: number[]
}

export interface ForecastScenario {
  revenue: number
  growth: number
}

export interface FinanceForecast {
  scenarios: {
    optimistic: ForecastScenario
    realistic: ForecastScenario
    pessimistic: ForecastScenario
  }
  insights: string[]
  recommendations: string[]
}

export interface FinanceData {
  stats: FinanceStats
  charts: {
    revenue: RevenueChart
    categories: ServiceChart
    cashFlow: CashFlowChart
  }
  forecast: FinanceForecast
}

export interface CreateTransactionData {
  type: TransactionType
  amount: number
  category: string
  description: string
  paymentMethod: string
  date?: string
  relatedRequest?: string
  providerId?: string
  clientId?: string
}

// Notification Types
export type NotificationType = "info" | "warning" | "error" | "success"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface CreateNotificationData {
  title: string
  message: string
  type: NotificationType
  recipients?: string[]
  broadcast?: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  scheduledFor?: string
}

// Settings Types
export interface GeneralSettings {
  appName: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  businessHours: {
    start: string
    end: string
    days: string[]
  }
  contactInfo: {
    phone: string
    email: string
    address: string
  }
}

export interface NotificationSettings {
  pushNotifications: {
    enabled: boolean
    newRequests: boolean
    statusUpdates: boolean
    providerAlerts: boolean
  }
  emailNotifications: {
    enabled: boolean
    dailyReports: boolean
    weeklyReports: boolean
    systemAlerts: boolean
  }
  smsNotifications: {
    enabled: boolean
    urgentOnly: boolean
    providerUpdates: boolean
  }
  templates: MessageTemplate[]
}

export interface MessageTemplate {
  id: string
  name: string
  type: "email" | "sms" | "push"
  subject?: string
  content: string
  variables: string[]
}

// User Management Types
export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin?: string
  createdAt: string
  permissions: string[]
  avatar?: string
}

export interface CreateUserData {
  name: string
  email: string
  role: string
  permissions: string[]
  sendWelcomeEmail?: boolean
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  avatar?: string
  preferences: {
    language: string
    timezone: string
    notifications: Record<string, any>
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginAlerts: boolean
  }
  activity: {
    lastLogin: string
    loginCount: number
    sessionsActive: number
  }
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  preferences?: Record<string, any>
  security?: Record<string, any>
}

// WhatsApp Types
export interface WhatsAppMessage {
  to: string
  type: "text" | "template" | "media"
  message?: string
  template?: {
    name: string
    language: string
    parameters?: Record<string, any>[]
  }
  media?: {
    type: "image" | "document" | "audio"
    url: string
    caption?: string
  }
}

export interface WhatsAppTemplate {
  id: string
  name: string
  category: string
  language: string
  status: "approved" | "pending" | "rejected"
  components: Record<string, any>[]
}

// Search Types
export interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  url: string
  highlight: string[]
}

export interface SearchResponse {
  requests: SearchResult[]
  providers: SearchResult[]
  total: number
  searchTime: number
}

// Error Types
export interface ApiError {
  error: string
  message: string
  code?: string
  details?: Record<string, any>
  requestId?: string
  timestamp?: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationErrorResponse extends ApiError {
  error: "VALIDATION_ERROR"
  details: ValidationError[]
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean
  url: string
  filename: string
  size: number
  mimeType: string
}

// Export Types
export interface ExportRequest {
  type: "requests" | "providers" | "analytics" | "finances"
  format: "csv" | "excel" | "pdf"
  dateRange: {
    from: string
    to: string
  }
  filters?: Record<string, any>
}

export interface ExportResponse {
  success: boolean
  downloadUrl: string
  expiresAt: string
  fileSize: number
}

// Report Types
export interface ReportRequest {
  type: "daily" | "weekly" | "monthly" | "custom"
  format: "json" | "pdf" | "excel"
  dateFrom: string
  dateTo: string
  modules?: string[]
}

export interface ReportInfo {
  id: string
  name: string
  type: string
  format: string
  status: "generating" | "ready" | "failed"
  createdAt: string
  downloadUrl?: string
  expiresAt?: string
}

// Webhook Types
export interface WebhookPayload {
  event: string
  data: Record<string, any>
  timestamp: string
  signature: string
}

// System Types
export interface SystemHealth {
  status: "healthy" | "degraded" | "down"
  services: {
    database: "up" | "down"
    redis: "up" | "down"
    whatsapp: "up" | "down"
    email: "up" | "down"
  }
  metrics: {
    responseTime: number
    uptime: number
    memoryUsage: number
    cpuUsage: number
  }
}

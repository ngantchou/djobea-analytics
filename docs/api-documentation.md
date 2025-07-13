# 📚 API Documentation - Djobea Analytics Backend

## 🔐 Authentication
Toutes les requêtes API nécessitent une authentification JWT via l'en-tête `Authorization: Bearer <token>`.

### **POST /api/auth/login**
Authentification utilisateur
\`\`\`typescript
Body: {
  email: string
  password: string
  rememberMe?: boolean
}
Response: {
  success: boolean
  token: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
  }
  expiresAt: string
}
\`\`\`

### **POST /api/auth/refresh**
Renouvellement du token
\`\`\`typescript
Body: {
  refreshToken: string
}
Response: {
  success: boolean
  token: string
  expiresAt: string
}
\`\`\`

### **POST /api/auth/logout**
Déconnexion
\`\`\`typescript
Response: {
  success: boolean
  message: string
}
\`\`\`

---

## 📊 **1. DASHBOARD MODULE**

### **GET /api/dashboard**
Récupère les données principales du tableau de bord
\`\`\`typescript
Response: {
  stats: {
    totalRequests: number
    successRate: number
    pendingRequests: number
    activeProviders: number
  }
  charts: {
    activity: {
      labels: string[]
      values: number[]
    }
    services: {
      labels: string[]
      values: number[]
    }
  }
  activity: {
    requests: {
      id: string
      client: string
      service: string
      location: string
      time: string
      status: 'pending' | 'active' | 'completed' | 'cancelled'
      avatar: string
    }[]
    alerts: {
      id: string
      title: string
      description: string
      time: string
      type: 'info' | 'warning' | 'error' | 'success'
      status: string
    }[]
  }
}
\`\`\`

### **GET /api/dashboard/stats**
Statistiques en temps réel
\`\`\`typescript
Query: ?period=24h|7d|30d
Response: {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  satisfaction: number
  trends: {
    requests: number
    successRate: number
    responseTime: number
  }
}
\`\`\`

---

## 📋 **2. REQUESTS MODULE**

### **GET /api/requests**
Liste des demandes avec filtres et pagination
\`\`\`typescript
Query: {
  page?: number (default: 1)
  limit?: number (default: 10)
  search?: string
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  service?: string
  location?: string
  dateFrom?: string (ISO date)
  dateTo?: string (ISO date)
  sortBy?: 'createdAt' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}
Response: {
  requests: {
    id: string
    client: {
      name: string
      phone: string
      email?: string
      avatar: string
    }
    service: {
      type: string
      description: string
      category: string
    }
    location: {
      address: string
      zone: string
      coordinates?: { lat: number, lng: number }
    }
    status: RequestStatus
    priority: Priority
    createdAt: string
    updatedAt: string
    assignedProvider?: {
      id: string
      name: string
      phone: string
      rating: number
    }
    estimatedCost?: {
      min: number
      max: number
      currency: string
    }
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  stats: {
    pending: number
    assigned: number
    completed: number
    cancelled: number
  }
}
\`\`\`

### **POST /api/requests**
Créer une nouvelle demande
\`\`\`typescript
Body: {
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceType: string
  description: string
  location: {
    address: string
    zone: string
    coordinates?: { lat: number, lng: number }
    accessInstructions?: string
  }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduledDate?: string (ISO date)
  estimatedBudget?: number
  images?: string[] (URLs)
}
Response: {
  success: boolean
  requestId: string
  message: string
  data: RequestObject
}
\`\`\`

### **GET /api/requests/:id**
Détails d'une demande
\`\`\`typescript
Response: {
  id: string
  client: {
    name: string
    phone: string
    email?: string
    address: string
    avatar: string
  }
  service: {
    type: string
    description: string
    category: string
    estimatedDuration: string
  }
  location: {
    address: string
    zone: string
    coordinates?: { lat: number, lng: number }
    accessInstructions?: string
  }
  status: RequestStatus
  priority: Priority
  createdAt: string
  assignedAt?: string
  completedAt?: string
  provider?: {
    id: string
    name: string
    phone: string
    rating: number
    specialty: string
  }
  timeline: {
    id: number
    title: string
    description: string
    timestamp: string
    status: 'completed' | 'current' | 'pending'
  }[]
  estimatedCost?: {
    min: number
    max: number
    currency: string
  }
  actualCost?: number
  images?: string[]
  notes?: string
}
\`\`\`

### **PUT /api/requests/:id**
Mettre à jour une demande
\`\`\`typescript
Body: {
  status?: RequestStatus
  priority?: Priority
  notes?: string
  estimatedCost?: { min: number, max: number }
  actualCost?: number
}
Response: {
  success: boolean
  message: string
  data: RequestObject
}
\`\`\`

### **POST /api/requests/:id/assign**
Assigner un prestataire
\`\`\`typescript
Body: {
  providerId: string
  notes?: string
  estimatedCost?: { min: number, max: number }
}
Response: {
  success: boolean
  message: string
  assignedProvider: {
    id: string
    name: string
    phone: string
    rating: number
  }
}
\`\`\`

### **POST /api/requests/:id/cancel**
Annuler une demande
\`\`\`typescript
Body: {
  reason: string
  comments?: string
}
Response: {
  success: boolean
  message: string
  data: {
    requestId: string
    reason: string
    cancelledAt: string
  }
}
\`\`\`

---

## 👥 **3. PROVIDERS MODULE**

### **GET /api/providers**
Liste des prestataires avec filtres
\`\`\`typescript
Query: {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  availability?: 'available' | 'busy' | 'offline'
  service?: string
  zone?: string
  minRating?: number
  sortBy?: 'name' | 'rating' | 'missions' | 'joinDate'
  sortOrder?: 'asc' | 'desc'
}
Response: {
  providers: {
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
    status: 'active' | 'inactive' | 'suspended'
    availability: 'available' | 'busy' | 'offline'
    performanceStatus: 'excellent' | 'good' | 'warning' | 'danger'
    hourlyRate: number
    experience: number
    joinDate: string
    description: string
    avatar?: string
  }[]
  pagination: PaginationInfo
  stats: {
    total: number
    active: number
    available: number
    averageRating: number
  }
}
\`\`\`

### **POST /api/providers**
Ajouter un prestataire
\`\`\`typescript
Body: {
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
Response: {
  success: boolean
  providerId: string
  message: string
  data: ProviderObject
}
\`\`\`

### **GET /api/providers/:id**
Détails d'un prestataire
\`\`\`typescript
Response: {
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
    status: 'available' | 'busy' | 'offline'
    schedule: {
      monday: { start: string, end: string, available: boolean }
      tuesday: { start: string, end: string, available: boolean }
      // ... autres jours
    }
    nextAvailable?: string
  }
  reviews: {
    id: string
    client: string
    rating: number
    comment: string
    date: string
    requestId: string
  }[]
  missions: {
    id: string
    client: string
    service: string
    date: string
    status: string
    rating?: number
    earnings: number
  }[]
  documents: {
    idCard?: { url: string, verified: boolean }
    certificate?: { url: string, verified: boolean }
    insurance?: { url: string, verified: boolean }
  }
  joinDate: string
  lastActive: string
  status: 'active' | 'inactive' | 'suspended'
}
\`\`\`

### **PUT /api/providers/:id**
Mettre à jour un prestataire
\`\`\`typescript
Body: Partial<ProviderUpdateData>
Response: {
  success: boolean
  message: string
  data: ProviderObject
}
\`\`\`

### **POST /api/providers/:id/suspend**
Suspendre un prestataire
\`\`\`typescript
Body: {
  reason: string
  duration?: number (jours)
  comments?: string
}
Response: {
  success: boolean
  message: string
  suspendedUntil?: string
}
\`\`\`

### **GET /api/providers/available**
Prestataires disponibles pour une demande
\`\`\`typescript
Query: {
  service?: string
  location?: string
  urgency?: 'low' | 'normal' | 'high' | 'urgent'
  budget?: number
}
Response: {
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
}[]
\`\`\`

---

## 📈 **4. ANALYTICS MODULE**

### **GET /api/analytics**
Données analytiques globales
\`\`\`typescript
Query: ?period=24h|7d|30d|90d|1y
Response: {
  stats: {
    successRate: number
    responseTime: number
    totalRequests: number
    satisfaction: number
    trends: {
      successRate: number
      responseTime: number
      totalRequests: number
      satisfaction: number
    }
  }
  charts: {
    performance: {
      labels: string[]
      successRate: number[]
      aiEfficiency: number[]
      satisfaction: number[]
    }
    services: {
      labels: string[]
      data: number[]
    }
    geographic: {
      labels: string[]
      data: number[]
    }
  }
  insights: {
    type: 'positive' | 'warning' | 'info'
    icon: string
    title: string
    description: string
    confidence: number
  }[]
  leaderboard: {
    id: string
    name: string
    avatar: string
    missions: number
    rating: number
    responseTime: number
    score: number
  }[]
}
\`\`\`

### **GET /api/analytics/kpis**
Indicateurs clés de performance
\`\`\`typescript
Query: ?period=7d|30d|90d
Response: {
  successRate: number
  responseTime: number
  totalRequests: number
  satisfaction: number
  revenue: number
  activeProviders: number
  trends: {
    successRate: number
    responseTime: number
    totalRequests: number
    satisfaction: number
    revenue: number
    activeProviders: number
  }
}
\`\`\`

### **GET /api/analytics/reports**
Rapports personnalisés
\`\`\`typescript
Query: {
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  format: 'json' | 'pdf' | 'excel'
  dateFrom: string
  dateTo: string
  modules?: string[] // ['requests', 'providers', 'finances']
}
Response: ReportData | File
\`\`\`

### **POST /api/analytics/export**
Exporter les données
\`\`\`typescript
Body: {
  type: 'requests' | 'providers' | 'analytics' | 'finances'
  format: 'csv' | 'excel' | 'pdf'
  dateRange: {
    from: string
    to: string
  }
  filters?: object
}
Response: {
  success: boolean
  downloadUrl: string
  expiresAt: string
  fileSize: number
}
\`\`\`

---

## 💰 **5. FINANCES MODULE**

### **GET /api/finances**
Données financières
\`\`\`typescript
Query: {
  period?: '24h' | '7d' | '30d' | '90d' | '1y'
  category?: string
  type?: 'income' | 'expense'
}
Response: {
  stats: {
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
  charts: {
    revenue: {
      labels: string[]
      income: number[]
      expenses: number[]
    }
    categories: {
      labels: string[]
      data: number[]
    }
    cashFlow: {
      labels: string[]
      values: number[]
    }
  }
  forecast: {
    scenarios: {
      optimistic: { revenue: number, growth: number }
      realistic: { revenue: number, growth: number }
      pessimistic: { revenue: number, growth: number }
    }
    insights: string[]
    recommendations: string[]
  }
}
\`\`\`

### **GET /api/finances/transactions**
Liste des transactions
\`\`\`typescript
Query: {
  page?: number
  limit?: number
  search?: string
  type?: 'income' | 'expense'
  category?: string
  status?: 'pending' | 'completed' | 'failed'
  dateFrom?: string
  dateTo?: string
}
Response: {
  transactions: {
    id: string
    type: 'income' | 'expense'
    amount: number
    currency: string
    category: string
    description: string
    date: string
    status: 'pending' | 'completed' | 'failed'
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
  }[]
  pagination: PaginationInfo
  summary: {
    totalIncome: number
    totalExpenses: number
    netAmount: number
  }
}
\`\`\`

### **POST /api/finances/transactions**
Créer une transaction
\`\`\`typescript
Body: {
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  paymentMethod: string
  date?: string
  relatedRequest?: string
  providerId?: string
  clientId?: string
}
Response: {
  success: boolean
  transactionId: string
  message: string
  data: TransactionObject
}
\`\`\`

---

## ⚙️ **6. SETTINGS MODULE**

### **GET /api/settings/general**
Paramètres généraux
\`\`\`typescript
Response: {
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
\`\`\`

### **POST /api/settings/general**
Mettre à jour les paramètres généraux
\`\`\`typescript
Body: GeneralSettingsData
Response: {
  success: boolean
  message: string
}
\`\`\`

### **GET /api/settings/notifications**
Paramètres de notifications
\`\`\`typescript
Response: {
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
  templates: {
    id: string
    name: string
    type: 'email' | 'sms' | 'push'
    subject?: string
    content: string
    variables: string[]
  }[]
}
\`\`\`

### **POST /api/settings/notifications/test**
Tester les notifications
\`\`\`typescript
Body: {
  type: 'push' | 'email' | 'sms'
  recipient: string
  template?: string
}
Response: {
  success: boolean
  message: string
  details: {
    sentAt: string
    deliveryStatus: string
  }
}
\`\`\`

---

## 🔔 **7. NOTIFICATIONS MODULE**

### **GET /api/notifications**
Liste des notifications
\`\`\`typescript
Query: {
  page?: number
  limit?: number
  type?: 'info' | 'warning' | 'error' | 'success'
  read?: boolean
  dateFrom?: string
  dateTo?: string
}
Response: {
  notifications: {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    read: boolean
    createdAt: string
    actionUrl?: string
    metadata?: object
  }[]
  pagination: PaginationInfo
  unreadCount: number
}
\`\`\`

### **POST /api/notifications**
Créer une notification
\`\`\`typescript
Body: {
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  recipients?: string[] // user IDs
  broadcast?: boolean
  actionUrl?: string
  metadata?: object
  scheduledFor?: string
}
Response: {
  success: boolean
  notificationId: string
  message: string
}
\`\`\`

### **PUT /api/notifications/:id/read**
Marquer comme lue
\`\`\`typescript
Response: {
  success: boolean
  message: string
}
\`\`\`

### **PUT /api/notifications/mark-all-read**
Marquer toutes comme lues
\`\`\`typescript
Response: {
  success: boolean
  message: string
  markedCount: number
}
\`\`\`

---

## 👤 **8. USER MANAGEMENT MODULE**

### **GET /api/users**
Liste des utilisateurs
\`\`\`typescript
Query: {
  page?: number
  limit?: number
  role?: string
  status?: 'active' | 'inactive'
  search?: string
}
Response: {
  users: {
    id: string
    name: string
    email: string
    role: string
    status: 'active' | 'inactive'
    lastLogin?: string
    createdAt: string
    permissions: string[]
    avatar?: string
  }[]
  pagination: PaginationInfo
}
\`\`\`

### **POST /api/users**
Créer un utilisateur
\`\`\`typescript
Body: {
  name: string
  email: string
  role: string
  permissions: string[]
  sendWelcomeEmail?: boolean
}
Response: {
  success: boolean
  userId: string
  temporaryPassword: string
  message: string
}
\`\`\`

### **GET /api/users/profile**
Profil utilisateur connecté
\`\`\`typescript
Response: {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  avatar?: string
  preferences: {
    language: string
    timezone: string
    notifications: object
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
\`\`\`

### **PUT /api/users/profile**
Mettre à jour le profil
\`\`\`typescript
Body: {
  name?: string
  phone?: string
  preferences?: object
  security?: object
}
Response: {
  success: boolean
  message: string
  data: UserProfile
}
\`\`\`

---

## 📱 **9. WHATSAPP INTEGRATION MODULE**

### **POST /api/whatsapp/webhook**
Webhook WhatsApp (Meta Business API)
\`\`\`typescript
Body: WhatsAppWebhookPayload
Response: {
  success: boolean
}
\`\`\`

### **POST /api/whatsapp/send**
Envoyer un message WhatsApp
\`\`\`typescript
Body: {
  to: string
  type: 'text' | 'template' | 'media'
  message?: string
  template?: {
    name: string
    language: string
    parameters?: object[]
  }
  media?: {
    type: 'image' | 'document' | 'audio'
    url: string
    caption?: string
  }
}
Response: {
  success: boolean
  messageId: string
  status: string
}
\`\`\`

### **GET /api/whatsapp/templates**
Templates de messages WhatsApp
\`\`\`typescript
Response: {
  templates: {
    id: string
    name: string
    category: string
    language: string
    status: 'approved' | 'pending' | 'rejected'
    components: object[]
  }[]
}
\`\`\`

---

## 🔍 **10. SEARCH MODULE**

### **GET /api/search**
Recherche globale
\`\`\`typescript
Query: {
  q: string
  type?: 'requests' | 'providers' | 'all'
  limit?: number
  filters?: object
}
Response: {
  requests: {
    id: string
    client: string
    service: string
    status: string
    createdAt: string
    highlight: string[]
  }[]
  providers: {
    id: string
    name: string
    services: string[]
    rating: number
    highlight: string[]
  }[]
  total: number
  searchTime: number
}
\`\`\`

### **GET /api/search/suggestions**
Suggestions de recherche
\`\`\`typescript
Query: {
  q: string
  type?: string
}
Response: {
  suggestions: string[]
  popular: string[]
}
\`\`\`

---

## 🚨 **Error Responses**

Tous les endpoints peuvent retourner ces erreurs standardisées :

\`\`\`typescript
// 400 Bad Request
{
  error: "VALIDATION_ERROR"
  message: "Données invalides"
  details: {
    field: string
    message: string
    code: string
  }[]
}

// 401 Unauthorized
{
  error: "UNAUTHORIZED"
  message: "Token invalide ou expiré"
  code: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "TOKEN_MISSING"
}

// 403 Forbidden
{
  error: "FORBIDDEN"
  message: "Permissions insuffisantes"
  requiredPermission: string
}

// 404 Not Found
{
  error: "NOT_FOUND"
  message: "Ressource introuvable"
  resource: string
}

// 409 Conflict
{
  error: "CONFLICT"
  message: "Conflit de données"
  details: string
}

// 422 Unprocessable Entity
{
  error: "VALIDATION_FAILED"
  message: "Validation échouée"
  violations: {
    field: string
    message: string
  }[]
}

// 429 Too Many Requests
{
  error: "RATE_LIMIT_EXCEEDED"
  message: "Trop de requêtes"
  retryAfter: number
  limit: number
  remaining: number
}

// 500 Internal Server Error
{
  error: "INTERNAL_ERROR"
  message: "Erreur serveur interne"
  requestId: string
  timestamp: string
}

// 503 Service Unavailable
{
  error: "SERVICE_UNAVAILABLE"
  message: "Service temporairement indisponible"
  retryAfter: number
}
\`\`\`

---

## 🔒 **Rate Limiting**

| Endpoint Category | Limite | Fenêtre | Scope |
|------------------|--------|---------|-------|
| Authentication | 5 req/min | Par IP | Strict |
| Dashboard | 60 req/min | Par utilisateur | Normal |
| CRUD Operations | 100 req/min | Par utilisateur | Normal |
| Analytics | 30 req/min | Par utilisateur | Normal |
| Settings | 20 req/min | Par utilisateur | Strict |
| Search | 50 req/min | Par utilisateur | Normal |
| WhatsApp Webhook | 1000 req/min | Global | Loose |
| File Upload | 10 req/min | Par utilisateur | Strict |

---

## 📝 **Request/Response Headers**

### **Required Headers**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-API-Version: v1
User-Agent: DjobeaApp/1.0

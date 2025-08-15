"use client"

import { Notification, NotificationPreferences, NotificationTemplate } from "@/lib/services/notifications-service"

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouvelle demande de service",
    message: "Une nouvelle demande de plomberie a été reçue dans la zone Bonamoussadi",
    type: "info",
    priority: "normal",
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    userId: "user1",
    category: "requests",
    source: "System",
    data: {
      requestId: "req123",
      serviceType: "plomberie",
      location: "Bonamoussadi"
    },
    actions: [
      { label: "Voir détails", action: "view_request", style: "primary" },
      { label: "Assigner", action: "assign_request", style: "secondary" }
    ]
  },
  {
    id: "2",
    title: "Prestataire validé",
    message: "Jean Dupont a été validé comme prestataire électricien",
    type: "success",
    priority: "normal",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    userId: "user1",
    category: "providers",
    source: "Admin",
    data: {
      providerId: "prov456",
      serviceType: "électricité",
      providerName: "Jean Dupont"
    }
  },
  {
    id: "3",
    title: "Objectif mensuel atteint",
    message: "Félicitations ! L'objectif de 500 demandes ce mois a été atteint",
    type: "success",
    priority: "high",
    read: true,
    readAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    userId: "user1",
    category: "achievements",
    source: "Analytics"
  },
  {
    id: "4",
    title: "Maintenance programmée",
    message: "Maintenance du système prévue demain à 02h00 (durée estimée: 30 minutes)",
    type: "warning",
    priority: "high",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: "user1",
    category: "system",
    source: "System",
    data: {
      maintenanceDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 30
    }
  },
  {
    id: "5",
    title: "Évaluation reçue",
    message: "Marie Kameni a donné une note de 5/5 pour le service de ménage",
    type: "info",
    priority: "normal",
    read: true,
    readAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userId: "user1",
    category: "reviews",
    source: "Customer",
    data: {
      rating: 5,
      customerId: "cust789",
      serviceType: "ménage",
      customerName: "Marie Kameni"
    }
  }
]

export const mockNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  sms: false,
  inApp: true,
  categories: {
    requests: true,
    providers: true,
    achievements: true,
    system: true,
    reviews: true,
    payments: false
  },
  quietHours: {
    enabled: true,
    start: "22:00",
    end: "07:00"
  },
  frequency: "immediate"
}

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: "1",
    name: "Nouvelle demande",
    subject: "Nouvelle demande de {{serviceType}}",
    content: "Une nouvelle demande de {{serviceType}} a été reçue dans la zone {{location}}. Cliquez ici pour voir les détails.",
    type: "email",
    variables: ["serviceType", "location", "requestId"],
    isActive: true
  },
  {
    id: "2",
    name: "Prestataire validé",
    subject: "Nouveau prestataire validé",
    content: "{{providerName}} a été validé comme prestataire {{serviceType}}",
    type: "push",
    variables: ["providerName", "serviceType"],
    isActive: true
  },
  {
    id: "3",
    name: "Objectif atteint",
    subject: "Objectif mensuel atteint !",
    content: "Félicitations ! L'objectif de {{targetCount}} demandes ce mois a été atteint.",
    type: "email",
    variables: ["targetCount", "achievement"],
    isActive: true
  }
]

// Mock API responses
export const getMockNotifications = (params?: {
  page?: number
  limit?: number
  read?: boolean
  type?: string
  category?: string
}) => {
  let filtered = [...mockNotifications]
  
  // Apply filters
  if (params?.read !== undefined) {
    filtered = filtered.filter(n => n.read === params.read)
  }
  
  if (params?.type) {
    filtered = filtered.filter(n => n.type === params.type)
  }
  
  if (params?.category) {
    filtered = filtered.filter(n => n.category === params.category)
  }
  
  // Apply pagination
  const page = params?.page || 1
  const limit = params?.limit || 20
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedNotifications = filtered.slice(startIndex, endIndex)
  
  const unreadCount = mockNotifications.filter(n => !n.read).length
  
  return {
    notifications: paginatedNotifications,
    unreadCount,
    total: filtered.length,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    }
  }
}

// Simule une API response avec délai
export const simulateNotificationApiDelay = (data: any, delay: number = 500): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
        message: "Notifications loaded successfully"
      })
    }, delay)
  })
}
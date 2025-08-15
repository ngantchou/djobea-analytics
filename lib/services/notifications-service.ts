"use client"

import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "normal" | "high" | "urgent"
  read: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
  userId: string
  data?: Record<string, any>
  actions?: Array<{
    label: string
    action: string
    style?: "primary" | "secondary" | "destructive"
  }>
  expiresAt?: string
  category?: string
  source?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  categories: Record<string, boolean>
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  frequency: "immediate" | "hourly" | "daily" | "weekly"
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: "email" | "push" | "sms"
  variables: string[]
  isActive: boolean
}

class NotificationsService {
  private realTimeSubscription: ((notification: Notification) => void) | null = null
  private webPushSubscription: PushSubscription | null = null

  async getNotifications(params?: {
    page?: number
    limit?: number
    read?: boolean
    type?: string
    category?: string
  }): Promise<{
    notifications: Notification[]
    unreadCount: number
    total: number
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
  }> {
    try {
      logger.info("Fetching notifications", { params })

      const response = await apiClient.getNotifications(params)

      if (response.success && response.data) {
        logger.info("Notifications fetched successfully", {
          count: response.data.notifications.length,
          unreadCount: response.data.unreadCount,
        })
        return response.data
      }

      throw new Error(response.error || "Failed to fetch notifications")
    } catch (error) {
      logger.error("Failed to fetch notifications", { error, params })
      throw error
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      logger.info("Marking notification as read", { id })

      const response = await apiClient.markNotificationAsRead(id)

      if (response.success) {
        logger.info("Notification marked as read", { id })
        return
      }

      throw new Error(response.error || "Failed to mark notification as read")
    } catch (error) {
      logger.error("Failed to mark notification as read", { error, id })
      throw error
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      logger.info("Marking all notifications as read")

      const response = await apiClient.markAllNotificationsAsRead()

      if (response.success) {
        logger.info("All notifications marked as read")
        return
      }

      throw new Error(response.error || "Failed to mark all notifications as read")
    } catch (error) {
      logger.error("Failed to mark all notifications as read", { error })
      throw error
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      logger.info("Deleting notification", { id })

      const response = await apiClient.deleteNotification(id)

      if (response.success) {
        logger.info("Notification deleted", { id })
        return
      }

      throw new Error(response.error || "Failed to delete notification")
    } catch (error) {
      logger.error("Failed to delete notification", { error, id })
      throw error
    }
  }

  async clearAll(): Promise<void> {
    try {
      logger.info("Clearing all notifications")

      const response = await fetch("/api/notifications/clear", {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to clear notifications")
      }

      if (result.success) {
        logger.info("All notifications cleared")
        return
      }

      throw new Error(result.error || "Failed to clear notifications")
    } catch (error) {
      logger.error("Failed to clear all notifications", { error })
      throw error
    }
  }

  async sendNotification(notification: {
    userId: string
    title: string
    message: string
    type?: string
    priority?: string
    data?: Record<string, any>
    channels?: string[]
  }): Promise<void> {
    try {
      logger.info("Sending notification", {
        userId: notification.userId,
        title: notification.title,
        type: notification.type,
      })

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to send notification")
      }

      if (result.success) {
        logger.info("Notification sent successfully", { userId: notification.userId })
        return
      }

      throw new Error(result.error || "Failed to send notification")
    } catch (error) {
      logger.error("Failed to send notification", { error, notification })
      throw error
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      logger.info("Fetching notification preferences")

      const result = await apiClient.getNotificationPreferences()

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch preferences")
    } catch (error) {
      logger.error("Failed to fetch notification preferences", { error })
      throw error
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      logger.info("Updating notification preferences", { preferences })

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update preferences")
      }

      if (result.success) {
        logger.info("Notification preferences updated")
        return
      }

      throw new Error(result.error || "Failed to update preferences")
    } catch (error) {
      logger.error("Failed to update notification preferences", { error })
      throw error
    }
  }

  async subscribeToWebPush(): Promise<void> {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications not supported")
      }

      logger.info("Subscribing to web push notifications")

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      this.webPushSubscription = subscription

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to subscribe to push notifications")
      }

      if (result.success) {
        logger.info("Subscribed to web push notifications")
        return
      }

      throw new Error(result.error || "Failed to subscribe to push notifications")
    } catch (error) {
      logger.error("Failed to subscribe to web push notifications", { error })
      throw error
    }
  }

  async unsubscribeFromWebPush(): Promise<void> {
    try {
      if (this.webPushSubscription) {
        await this.webPushSubscription.unsubscribe()
        this.webPushSubscription = null
      }

      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to unsubscribe from push notifications")
      }

      if (result.success) {
        logger.info("Unsubscribed from web push notifications")
        return
      }

      throw new Error(result.error || "Failed to unsubscribe from push notifications")
    } catch (error) {
      logger.error("Failed to unsubscribe from web push notifications", { error })
      throw error
    }
  }

  subscribeToRealTime(callback: (notification: Notification) => void): void {
    this.realTimeSubscription = callback

    // In a real implementation, this would connect to WebSocket or SSE
    logger.info("Subscribed to real-time notifications")
  }

  unsubscribeFromRealTime(): void {
    this.realTimeSubscription = null
    logger.info("Unsubscribed from real-time notifications")
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      logger.info("Fetching notification templates")

      const response = await fetch("/api/notifications/templates")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch templates")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch templates")
    } catch (error) {
      logger.error("Failed to fetch notification templates", { error })
      throw error
    }
  }

  async createTemplate(template: Omit<NotificationTemplate, "id">): Promise<NotificationTemplate> {
    try {
      logger.info("Creating notification template", { name: template.name })

      const response = await fetch("/api/notifications/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to create template")
      }

      if (result.success && result.data) {
        logger.info("Notification template created", { id: result.data.id })
        return result.data
      }

      throw new Error(result.error || "Failed to create template")
    } catch (error) {
      logger.error("Failed to create notification template", { error })
      throw error
    }
  }

  async testNotification(type: "email" | "push" | "sms", data: Record<string, any>): Promise<void> {
    try {
      logger.info("Testing notification", { type, data })

      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to test notification")
      }

      if (result.success) {
        logger.info("Test notification sent", { type })
        return
      }

      throw new Error(result.error || "Failed to test notification")
    } catch (error) {
      logger.error("Failed to test notification", { error, type })
      throw error
    }
  }
}

export const notificationsService = new NotificationsService()
export default notificationsService

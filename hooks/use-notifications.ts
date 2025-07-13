"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationsService, type Notification } from "@/lib/services/notifications-service"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: (params?: { page?: number; limit?: number; read?: boolean; type?: string }) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchNotifications = useCallback(
    async (params?: {
      page?: number
      limit?: number
      read?: boolean
      type?: string
    }) => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await notificationsService.getNotifications(params)
        setNotifications(result.notifications)
        setUnreadCount(result.unreadCount)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement des notifications"
        setError(message)
        logger.error("Failed to fetch notifications", { error: err })
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationsService.markAsRead(id)

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true, readAt: new Date().toISOString() } : notification,
          ),
        )

        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du marquage"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        logger.error("Failed to mark notification as read", { error: err, id })
      }
    },
    [toast],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead()

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        })),
      )

      setUnreadCount(0)

      toast({
        title: "Notifications marquées",
        description: "Toutes les notifications ont été marquées comme lues.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du marquage"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      logger.error("Failed to mark all notifications as read", { error: err })
    }
  }, [toast])

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await notificationsService.deleteNotification(id)

        const deletedNotification = notifications.find((n) => n.id === id)
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))

        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }

        toast({
          title: "Notification supprimée",
          description: "La notification a été supprimée avec succès.",
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la suppression"
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        logger.error("Failed to delete notification", { error: err, id })
      }
    },
    [notifications, toast],
  )

  const clearAll = useCallback(async () => {
    try {
      await notificationsService.clearAll()

      setNotifications([])
      setUnreadCount(0)

      toast({
        title: "Notifications supprimées",
        description: "Toutes les notifications ont été supprimées.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      logger.error("Failed to clear all notifications", { error: err })
    }
  }, [toast])

  const subscribe = useCallback(async () => {
    try {
      await notificationsService.subscribeToWebPush()

      toast({
        title: "Notifications activées",
        description: "Vous recevrez maintenant des notifications push.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur d'activation"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      logger.error("Failed to subscribe to notifications", { error: err })
    }
  }, [toast])

  const unsubscribe = useCallback(async () => {
    try {
      await notificationsService.unsubscribeFromWebPush()

      toast({
        title: "Notifications désactivées",
        description: "Vous ne recevrez plus de notifications push.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de désactivation"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
      logger.error("Failed to unsubscribe from notifications", { error: err })
    }
  }, [toast])

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications({ limit: 20 })
  }, [fetchNotifications])

  // Set up real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1)
      }

      // Show toast for new notifications
      toast({
        title: notification.title,
        description: notification.message,
      })
    }

    // Subscribe to real-time notifications
    notificationsService.subscribeToRealTime(handleNewNotification)

    return () => {
      notificationsService.unsubscribeFromRealTime()
    }
  }, [toast])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    subscribe,
    unsubscribe,
  }
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationsService, type Notification, type NotificationPreferences } from "@/lib/services/notifications-service"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchNotifications = useCallback(async (params?: {
    page?: number
    limit?: number
    read?: boolean
    type?: string
    category?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching notifications...")
      
      const result = await notificationsService.getNotifications(params)
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
      console.log("✅ Notifications loaded successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des notifications"
      setError(message)
      console.error("❌ Failed to fetch notifications:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      console.log("✅ Notification marked as read:", id)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du marquage comme lu"
      console.error("❌ Failed to mark notification as read:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead()
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          readAt: new Date().toISOString() 
        }))
      )
      setUnreadCount(0)
      
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      })
      
      console.log("✅ All notifications marked as read")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du marquage global"
      console.error("❌ Failed to mark all notifications as read:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationsService.deleteNotification(id)
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast({
        title: "Succès",
        description: "Notification supprimée",
      })
      
      console.log("✅ Notification deleted:", id)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression"
      console.error("❌ Failed to delete notification:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [notifications, toast])

  const clearAll = useCallback(async () => {
    try {
      await notificationsService.clearAll()
      
      setNotifications([])
      setUnreadCount(0)
      
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été supprimées",
      })
      
      console.log("✅ All notifications cleared")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression globale"
      console.error("❌ Failed to clear all notifications:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  const sendNotification = useCallback(async (notification: {
    userId: string
    title: string
    message: string
    type?: string
    priority?: string
    data?: Record<string, any>
    channels?: string[]
  }) => {
    try {
      await notificationsService.sendNotification(notification)
      
      toast({
        title: "Succès",
        description: "Notification envoyée",
      })
      
      // Refresh notifications
      await fetchNotifications()
      
      console.log("✅ Notification sent successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'envoi"
      console.error("❌ Failed to send notification:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [fetchNotifications, toast])

  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await notificationsService.getPreferences()
      setPreferences(prefs)
      console.log("✅ Notification preferences loaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des préférences"
      console.error("❌ Failed to fetch preferences:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      await notificationsService.updatePreferences(prefs)
      setPreferences(prev => prev ? { ...prev, ...prefs } : null)
      
      toast({
        title: "Succès",
        description: "Préférences mises à jour",
      })
      
      console.log("✅ Notification preferences updated")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour des préférences"
      console.error("❌ Failed to update preferences:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  const subscribeToWebPush = useCallback(async () => {
    try {
      await notificationsService.subscribeToWebPush()
      
      toast({
        title: "Succès",
        description: "Notifications push activées",
      })
      
      console.log("✅ Subscribed to web push")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'activation des notifications push"
      console.error("❌ Failed to subscribe to web push:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  const testNotification = useCallback(async (type: "email" | "push" | "sms", data: Record<string, any>) => {
    try {
      await notificationsService.testNotification(type, data)
      
      toast({
        title: "Succès",
        description: `Test de notification ${type} envoyé`,
      })
      
      console.log("✅ Test notification sent:", type)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du test de notification"
      console.error("❌ Failed to test notification:", err)
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    }
  }, [toast])

  // Auto-fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
    fetchPreferences()
  }, [fetchNotifications, fetchPreferences])

  // Real-time subscription
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      if (!notification.read) {
        setUnreadCount(prev => prev + 1)
      }
      
      // Show toast for new notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === "error" ? "destructive" : "default",
      })
    }

    notificationsService.subscribeToRealTime(handleNewNotification)

    return () => {
      notificationsService.unsubscribeFromRealTime()
    }
  }, [toast])

  return {
    // Data
    notifications,
    unreadCount,
    preferences,
    
    // State
    loading,
    error,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendNotification,
    fetchPreferences,
    updatePreferences,
    subscribeToWebPush,
    testNotification,
  }
}
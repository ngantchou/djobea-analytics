"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem("djobea_notifications")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    } else {
      // Add some sample notifications
      const sampleNotifications: Notification[] = [
        {
          id: "1",
          title: "Nouvelle demande reçue",
          message: "Une nouvelle demande de plomberie a été soumise",
          type: "info",
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
        },
        {
          id: "2",
          title: "Prestataire approuvé",
          message: "Jean Dupont a été approuvé comme prestataire",
          type: "success",
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          read: false,
        },
        {
          id: "3",
          title: "Paiement en attente",
          message: "Facture #1234 en attente de paiement",
          type: "warning",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: true,
        },
      ]
      setNotifications(sampleNotifications)
      localStorage.setItem("djobea_notifications", JSON.stringify(sampleNotifications))
    }
  }, [])

  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem("djobea_notifications", JSON.stringify(newNotifications))
  }

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => {
      const updated = [newNotification, ...prev]
      saveNotifications(updated)
      return updated
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      saveNotifications(updated)
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      saveNotifications(updated)
      return updated
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

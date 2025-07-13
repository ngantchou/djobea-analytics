"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/store/use-notification-store"

interface Notification {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
  timestamp: Date
  read: boolean
  autoClose?: boolean
  duration?: number
}

export function NotificationSystem() {
  const { notifications, removeNotification, markAsRead } = useNotificationStore()
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Afficher seulement les notifications non lues et récentes
    const recent = notifications.filter((n) => !n.read).slice(0, 5) // Limiter à 5 notifications visibles

    setVisibleNotifications(recent)
  }, [notifications])

  useEffect(() => {
    // Auto-close des notifications après un délai
    visibleNotifications.forEach((notification) => {
      if (notification.autoClose !== false) {
        const duration = notification.duration || 5000
        setTimeout(() => {
          removeNotification(notification.id)
        }, duration)
      }
    })
  }, [visibleNotifications, removeNotification])

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "error":
        return AlertCircle
      case "warning":
        return AlertTriangle
      case "info":
        return Info
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500 bg-green-500/10"
      case "error":
        return "border-red-500 bg-red-500/10"
      case "warning":
        return "border-yellow-500 bg-yellow-500/10"
      case "info":
        return "border-blue-500 bg-blue-500/10"
      default:
        return "border-gray-500 bg-gray-500/10"
    }
  }

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  const handleClose = (id: string) => {
    markAsRead(id)
    removeNotification(id)
  }

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type)
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              layout
            >
              <Card className={`${getNotificationColor(notification.type)} border backdrop-blur-sm shadow-2xl`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${getIconColor(notification.type)} flex-shrink-0 mt-0.5`} />

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-relaxed">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {notification.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleClose(notification.id)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700/50 w-6 h-6 p-0 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Barre de progression pour l'auto-close */}
                {notification.autoClose !== false && (
                  <motion.div
                    className={`h-1 ${
                      notification.type === "success"
                        ? "bg-green-500"
                        : notification.type === "error"
                          ? "bg-red-500"
                          : notification.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                    }`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
                  />
                )}
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

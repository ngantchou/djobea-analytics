"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bell, CheckCircle, AlertTriangle } from "lucide-react"
import styled from "styled-components"
import { useNotificationStore } from "@/store/use-notification-store"

const NotificationContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
`

const NotificationCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== "type",
})<{ type: string }>`
  background: rgba(26, 31, 46, 0.95);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${(props) => {
    switch (props.type) {
      case "success":
        return "#28a745"
      case "warning":
        return "#ffc107"
      case "error":
        return "#dc3545"
      default:
        return "#677eea"
    }
  }};
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
`

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const IconWrapper = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const CloseIconWrapper = styled.div`
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

export function NotificationSystem() {
  const { notifications, removeNotification, addNotification } = useNotificationStore()

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const notificationMessages = [
        "Nouvelle demande de plomberie reçue",
        "Prestataire Jean-Baptiste a accepté une mission",
        "Service terminé avec succès - Note: 5/5",
        "Nouveau prestataire en attente de validation",
      ]

      if (Math.random() < 0.3) {
        // 30% chance every 15 seconds
        const randomMessage = notificationMessages[Math.floor(Math.random() * notificationMessages.length)]
        addNotification({
          id: Date.now().toString(),
          message: randomMessage,
          type: "info",
          timestamp: new Date(),
          read: false,
        })
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [addNotification])

  useEffect(() => {
    // Auto-remove notifications after 4 seconds
    notifications.forEach((notification) => {
      if (!notification.read) {
        setTimeout(() => {
          removeNotification(notification.id)
        }, 4000)
      }
    })
  }, [notifications, removeNotification])

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle />
      case "warning":
        return <AlertTriangle />
      case "error":
        return <AlertTriangle />
      default:
        return <Bell />
    }
  }

  return (
    <NotificationContainer>
      <AnimatePresence>
        {notifications.slice(0, 5).map((notification) => (
          <NotificationCard
            key={notification.id}
            type={notification.type}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <NotificationContent>
              <IconWrapper>{getIcon(notification.type)}</IconWrapper>
              <span>{notification.message}</span>
            </NotificationContent>
            <CloseButton onClick={() => removeNotification(notification.id)}>
              <CloseIconWrapper>
                <X />
              </CloseIconWrapper>
            </CloseButton>
          </NotificationCard>
        ))}
      </AnimatePresence>
    </NotificationContainer>
  )
}

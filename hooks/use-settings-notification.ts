"use client"

import { useState, useCallback } from "react"

interface Notification {
  type: "success" | "error" | "warning" | "info"
  message: string
  visible: boolean
}

export function useSettingsNotification() {
  const [notification, setNotification] = useState<Notification>({
    type: "info",
    message: "",
    visible: false,
  })

  const showNotification = useCallback((type: Notification["type"], message: string) => {
    setNotification({ type, message, visible: true })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }))
  }, [])

  return {
    notification,
    showNotification,
    hideNotification,
  }
}

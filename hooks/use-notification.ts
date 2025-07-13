import { create } from "zustand"

interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

interface NotificationStore {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotification = create<NotificationStore>((set, get) => ({
  notifications: [],

  showNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto remove after duration (default 5 seconds)
    const duration = notification.duration || 5000
    setTimeout(() => {
      get().removeNotification(id)
    }, duration)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },
}))

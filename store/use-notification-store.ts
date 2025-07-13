import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: any
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  loadNotifications: (notifications: Notification[]) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: "1",
          title: "Nouvelle demande",
          message: "Une nouvelle demande de plomberie a été reçue",
          type: "info",
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: "/requests",
          actionLabel: "Voir la demande",
        },
        {
          id: "2",
          title: "Prestataire approuvé",
          message: "Jean Plomberie a été approuvé et ajouté à la plateforme",
          type: "success",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: "/providers",
          actionLabel: "Voir le prestataire",
        },
        {
          id: "3",
          title: "Paiement en retard",
          message: "Le paiement de la facture #INV-001 est en retard",
          type: "warning",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: "/finances",
          actionLabel: "Voir la facture",
        },
      ],
      unreadCount: 2,

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
          }
          const notifications = [newNotification, ...state.notifications]
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        }),

      markAsRead: (id) =>
        set((state) => {
          const notifications = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id)
          const unreadCount = notifications.filter((n) => !n.read).length
          return { notifications, unreadCount }
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      loadNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),
    }),
    {
      name: "djobea-notifications",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    },
  ),
)

"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  activeProviders: number
  completedRequests: number
  revenue: number
  averageRating: number
}

interface DashboardWidget {
  id: string
  type: "stats" | "chart" | "table" | "map"
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  visible: boolean
  config?: Record<string, any>
}

interface DashboardStore {
  // Stats
  stats: DashboardStats
  updateStats: (updates: Partial<DashboardStats>) => void
  resetStats: () => void

  // Widgets
  widgets: DashboardWidget[]
  addWidget: (widget: Omit<DashboardWidget, "id">) => void
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void
  removeWidget: (id: string) => void
  toggleWidget: (id: string) => void

  // Layout
  layout: "grid" | "list" | "custom"
  setLayout: (layout: "grid" | "list" | "custom") => void

  // Filters
  dateRange: { start: Date; end: Date }
  setDateRange: (range: { start: Date; end: Date }) => void

  // Real-time updates
  isRealTimeEnabled: boolean
  toggleRealTime: () => void
  lastUpdate: Date | null
  setLastUpdate: (date: Date) => void
}

const defaultStats: DashboardStats = {
  totalRequests: 1247,
  pendingRequests: 23,
  activeProviders: 156,
  completedRequests: 1224,
  revenue: 45678.9,
  averageRating: 4.7,
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: "stats-overview",
    type: "stats",
    title: "Vue d'ensemble",
    position: { x: 0, y: 0 },
    size: { width: 12, height: 2 },
    visible: true,
  },
  {
    id: "requests-chart",
    type: "chart",
    title: "Évolution des demandes",
    position: { x: 0, y: 2 },
    size: { width: 8, height: 4 },
    visible: true,
  },
  {
    id: "providers-map",
    type: "map",
    title: "Prestataires actifs",
    position: { x: 8, y: 2 },
    size: { width: 4, height: 4 },
    visible: true,
  },
]

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Stats
      stats: defaultStats,
      updateStats: (updates) =>
        set((state) => ({
          stats: {
            ...state.stats,
            ...updates,
          },
          lastUpdate: new Date(),
        })),
      resetStats: () => set({ stats: defaultStats }),

      // Widgets
      widgets: defaultWidgets,
      addWidget: (widget) =>
        set((state) => ({
          widgets: [
            ...state.widgets,
            {
              ...widget,
              id: `widget-${Date.now()}`,
            },
          ],
        })),
      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((widget) => (widget.id === id ? { ...widget, ...updates } : widget)),
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
        })),
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((widget) => (widget.id === id ? { ...widget, visible: !widget.visible } : widget)),
        })),

      // Layout
      layout: "grid",
      setLayout: (layout) => set({ layout }),

      // Filters
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        end: new Date(),
      },
      setDateRange: (range) => set({ dateRange: range }),

      // Real-time updates
      isRealTimeEnabled: true,
      toggleRealTime: () => set((state) => ({ isRealTimeEnabled: !state.isRealTimeEnabled })),
      lastUpdate: null,
      setLastUpdate: (date) => set({ lastUpdate: date }),
    }),
    {
      name: "dashboard-store",
      partialize: (state) => ({
        widgets: state.widgets,
        layout: state.layout,
        isRealTimeEnabled: state.isRealTimeEnabled,
        dateRange: state.dateRange,
      }),
    },
  ),
)

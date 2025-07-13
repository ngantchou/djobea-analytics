"use client"

import { useState, useCallback } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Settings, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DashboardWidget } from "./dashboard-widget"
import { WidgetSelector } from "./widget-selector"
import { useDashboardStore } from "@/store/use-dashboard-store"
import { useNotificationStore } from "@/store/use-notification-store"

export interface Widget {
  id: string
  type: "stats" | "chart" | "table" | "map" | "ai" | "notifications"
  title: string
  size: "small" | "medium" | "large" | "full"
  position: { x: number; y: number }
  visible: boolean
  config: Record<string, any>
}

export function CustomizableDashboard() {
  const { widgets, updateWidgets, isEditMode, setEditMode, saveLayout, resetLayout } = useDashboardStore()
  const { addNotification } = useNotificationStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showWidgetSelector, setShowWidgetSelector] = useState(false)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (active.id !== over?.id) {
        const oldIndex = widgets.findIndex((widget) => widget.id === active.id)
        const newIndex = widgets.findIndex((widget) => widget.id === over?.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newWidgets = arrayMove(widgets, oldIndex, newIndex)
          updateWidgets(newWidgets)
        }
      }

      setActiveId(null)
    },
    [widgets, updateWidgets],
  )

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget,
    )
    updateWidgets(updatedWidgets)
  }

  const addWidget = (widgetType: Widget["type"]) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: getWidgetTitle(widgetType),
      size: "medium",
      position: { x: 0, y: 0 },
      visible: true,
      config: {},
    }

    updateWidgets([...widgets, newWidget])
    setShowWidgetSelector(false)

    addNotification({
      id: Date.now().toString(),
      message: `Widget ${newWidget.title} ajouté au dashboard`,
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((widget) => widget.id !== widgetId)
    updateWidgets(updatedWidgets)

    addNotification({
      id: Date.now().toString(),
      message: "Widget supprimé du dashboard",
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleSaveLayout = () => {
    saveLayout()
    setEditMode(false)

    addNotification({
      id: Date.now().toString(),
      message: "Configuration du dashboard sauvegardée",
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleResetLayout = () => {
    resetLayout()

    addNotification({
      id: Date.now().toString(),
      message: "Dashboard réinitialisé à la configuration par défaut",
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const getWidgetTitle = (type: Widget["type"]) => {
    const titles = {
      stats: "Statistiques",
      chart: "Graphiques",
      table: "Tableau de données",
      map: "Carte géographique",
      ai: "Prédictions IA",
      notifications: "Notifications",
    }
    return titles[type]
  }

  const visibleWidgets = widgets.filter((widget) => widget.visible)

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Personnalisable</h2>
          <p className="text-gray-400">Organisez vos widgets selon vos besoins</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isEditMode} onCheckedChange={setEditMode} id="edit-mode" />
            <label htmlFor="edit-mode" className="text-sm text-gray-300">
              Mode édition
            </label>
          </div>

          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetSelector(true)}
                className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter Widget
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
                className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>

              <Button size="sm" onClick={handleSaveLayout} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Gestion des widgets en mode édition */}
      {isEditMode && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestion des Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch checked={widget.visible} onCheckedChange={() => toggleWidgetVisibility(widget.id)} />
                    <div>
                      <div className="text-white font-medium">{widget.title}</div>
                      <div className="text-sm text-gray-400">Taille: {widget.size}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {widget.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeWidget(widget.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard avec widgets */}
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
            {visibleWidgets.map((widget) => (
              <DashboardWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onRemove={() => removeWidget(widget.id)}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-50">
              <DashboardWidget
                widget={visibleWidgets.find((w) => w.id === activeId)!}
                isEditMode={false}
                onRemove={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Message si aucun widget */}
      {visibleWidgets.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun widget affiché</h3>
            <p className="text-gray-400 mb-4">
              Activez le mode édition et ajoutez des widgets pour personnaliser votre dashboard
            </p>
            <Button onClick={() => setEditMode(true)} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Activer le mode édition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sélecteur de widgets */}
      <WidgetSelector
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onAddWidget={addWidget}
      />
    </div>
  )
}

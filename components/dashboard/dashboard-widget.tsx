"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { GripVertical, X, Settings, BarChart3, Map, Brain, Bell, Table } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Widget } from "./customizable-dashboard"

interface DashboardWidgetProps {
  widget: Widget
  isEditMode: boolean
  onRemove: () => void
}

export function DashboardWidget({ widget, isEditMode, onRemove }: DashboardWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getWidgetIcon = (type: Widget["type"]) => {
    const icons = {
      stats: BarChart3,
      chart: BarChart3,
      table: Table,
      map: Map,
      ai: Brain,
      notifications: Bell,
    }
    return icons[type]
  }

  const getWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case "stats":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">247</div>
              <div className="text-sm text-gray-400">Demandes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">89%</div>
              <div className="text-sm text-gray-400">Réussite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">15</div>
              <div className="text-sm text-gray-400">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">23</div>
              <div className="text-sm text-gray-400">Actifs</div>
            </div>
          </div>
        )

      case "chart":
        return (
          <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-blue-400" />
          </div>
        )

      case "table":
        return (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                <span className="text-white">Demande #{i}</span>
                <Badge className="bg-green-500">Terminé</Badge>
              </div>
            ))}
          </div>
        )

      case "map":
        return (
          <div className="h-32 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <Map className="w-12 h-12 text-green-400" />
          </div>
        )

      case "ai":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Prédiction demande</span>
              <span className="text-green-400">+23%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Confiance IA</span>
              <span className="text-blue-400">87%</span>
            </div>
            <div className="h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-2">
            {[
              { text: "Nouvelle demande reçue", time: "Il y a 2min", type: "info" },
              { text: "Prestataire assigné", time: "Il y a 5min", type: "success" },
              { text: "Paiement en attente", time: "Il y a 10min", type: "warning" },
            ].map((notif, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-700/30 rounded">
                <div
                  className={`w-2 h-2 rounded-full ${
                    notif.type === "success"
                      ? "bg-green-400"
                      : notif.type === "warning"
                        ? "bg-yellow-400"
                        : "bg-blue-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{notif.text}</div>
                  <div className="text-gray-400 text-xs">{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div className="h-32 bg-gray-700/30 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Widget {widget.type}</span>
          </div>
        )
    }
  }

  const getSizeClass = (size: Widget["size"]) => {
    switch (size) {
      case "small":
        return "col-span-1"
      case "medium":
        return "col-span-1 md:col-span-2"
      case "large":
        return "col-span-1 md:col-span-2 lg:col-span-3"
      case "full":
        return "col-span-full"
      default:
        return "col-span-1"
    }
  }

  const Icon = getWidgetIcon(widget.type)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${getSizeClass(widget.size)} ${isDragging ? "opacity-50" : ""}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-blue-400" />}
              <CardTitle className="text-white text-lg">{widget.title}</CardTitle>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRemove}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>{getWidgetContent(widget)}</CardContent>
      </Card>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { BarChart3, Map, Brain, Bell, Table, X, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Widget } from "./customizable-dashboard"

interface WidgetSelectorProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (type: Widget["type"]) => void
}

export function WidgetSelector({ isOpen, onClose, onAddWidget }: WidgetSelectorProps) {
  const widgetTypes = [
    {
      type: "stats" as const,
      title: "Statistiques",
      description: "KPIs et métriques principales",
      icon: BarChart3,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      type: "chart" as const,
      title: "Graphiques",
      description: "Visualisations et tendances",
      icon: BarChart3,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      type: "table" as const,
      title: "Tableau",
      description: "Données tabulaires détaillées",
      icon: Table,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      type: "map" as const,
      title: "Carte",
      description: "Géolocalisation et zones",
      icon: Map,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
    {
      type: "ai" as const,
      title: "Prédictions IA",
      description: "Intelligence artificielle",
      icon: Brain,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
    },
    {
      type: "notifications" as const,
      title: "Notifications",
      description: "Alertes et messages",
      icon: Bell,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-400" />
              Ajouter un Widget
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {widgetTypes.map((widget, index) => {
            const Icon = widget.icon
            return (
              <motion.div
                key={widget.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 cursor-pointer group"
                  onClick={() => onAddWidget(widget.type)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${widget.bgColor}`}>
                        <Icon className={`w-6 h-6 ${widget.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                          {widget.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">{widget.description}</CardDescription>
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

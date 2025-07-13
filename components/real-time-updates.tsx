"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Clock, MapPin, User, CheckCircle, AlertCircle, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/components/realtime/websocket-provider"

interface RealTimeUpdate {
  id: string
  type: "new_request" | "request_completed" | "provider_online" | "provider_offline" | "system_alert"
  title: string
  description: string
  timestamp: Date
  location?: string
  priority?: "low" | "medium" | "high"
  metadata?: Record<string, any>
}

export function RealTimeUpdates() {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([])
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const { isConnected, lastMessage } = useWebSocket()

  // Données initiales
  useEffect(() => {
    const initialUpdates: RealTimeUpdate[] = [
      {
        id: "1",
        type: "new_request",
        title: "Nouvelle demande reçue",
        description: "Réparation fuite d'eau - Mme Ngo, Bonamoussadi",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        location: "Bonamoussadi",
        priority: "high",
        metadata: { client: "Mme Ngo", service: "Plomberie" },
      },
      {
        id: "2",
        type: "provider_online",
        title: "Prestataire disponible",
        description: "Jean-Baptiste Électricité est maintenant en ligne",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        location: "Akwa",
        priority: "medium",
        metadata: { provider: "Jean-Baptiste", service: "Électricité" },
      },
      {
        id: "3",
        type: "request_completed",
        title: "Intervention terminée",
        description: "Installation électrique complétée avec succès",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        location: "Bonapriso",
        priority: "low",
        metadata: { provider: "Paul Électricité", rating: 5 },
      },
    ]

    setUpdates(initialUpdates)
  }, [])

  // Écouter les nouveaux messages WebSocket
  useEffect(() => {
    if (lastMessage) {
      const newUpdate: RealTimeUpdate = {
        id: Date.now().toString(),
        type: lastMessage.type as any,
        title: getUpdateTitle(lastMessage.type),
        description: getUpdateDescription(lastMessage),
        timestamp: new Date(),
        location: lastMessage.data.location || lastMessage.data.zone,
        priority: lastMessage.data.priority || "medium",
        metadata: lastMessage.data,
      }

      setUpdates((prev) => [newUpdate, ...prev.slice(0, 19)]) // Garder seulement les 20 dernières
    }
  }, [lastMessage])

  const getUpdateTitle = (type: string) => {
    switch (type) {
      case "new_request":
        return "Nouvelle demande reçue"
      case "request_completed":
        return "Intervention terminée"
      case "provider_status":
        return "Statut prestataire mis à jour"
      case "system_alert":
        return "Alerte système"
      default:
        return "Mise à jour"
    }
  }

  const getUpdateDescription = (message: any) => {
    switch (message.type) {
      case "new_request":
        return `${message.data.service} - ${message.data.client}, ${message.data.location}`
      case "request_completed":
        return `Intervention complétée avec ${message.data.rating}⭐`
      case "provider_status":
        return `${message.data.name} est ${message.data.status === "available" ? "disponible" : "occupé"}`
      case "system_alert":
        return message.data.message
      default:
        return "Nouvelle activité détectée"
    }
  }

  const getUpdateIcon = (type: RealTimeUpdate["type"]) => {
    switch (type) {
      case "new_request":
        return MapPin
      case "request_completed":
        return CheckCircle
      case "provider_online":
        return User
      case "provider_offline":
        return User
      case "system_alert":
        return AlertCircle
      default:
        return Activity
    }
  }

  const getUpdateColor = (type: RealTimeUpdate["type"]) => {
    switch (type) {
      case "new_request":
        return "from-blue-500 to-cyan-500"
      case "request_completed":
        return "from-green-500 to-emerald-500"
      case "provider_online":
        return "from-purple-500 to-pink-500"
      case "provider_offline":
        return "from-gray-500 to-gray-600"
      case "system_alert":
        return "from-red-500 to-orange-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "À l'instant"
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays}j`
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl">Activité Temps Réel</span>
              <p className="text-sm text-gray-400 font-normal">Mises à jour en direct</p>
            </div>
          </CardTitle>

          <div className="flex items-center gap-3">
            {/* Indicateur de connexion */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              <span className="text-xs text-gray-400">{isConnected ? "En ligne" : "Hors ligne"}</span>
            </div>

            {/* Contrôle auto-scroll */}
            <Button
              size="sm"
              variant={isAutoScroll ? "default" : "outline"}
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`text-xs ${
                isAutoScroll
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "border-gray-600 text-gray-300 hover:text-white bg-transparent"
              }`}
            >
              <Zap className="w-3 h-3 mr-1" />
              Auto
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {updates.map((update, index) => {
              const Icon = getUpdateIcon(update.type)
              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                >
                  {/* Icône */}
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${getUpdateColor(update.type)} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm truncate">{update.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {update.priority && (
                          <Badge className={`${getPriorityColor(update.priority)} text-white text-xs px-1 py-0`}>
                            {update.priority}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">{formatTimeAgo(update.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{update.description}</p>

                    {/* Métadonnées */}
                    <div className="flex items-center gap-3 text-xs">
                      {update.location && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{update.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {update.timestamp.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {updates.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune activité récente</p>
              <p className="text-sm mt-1">Les mises à jour apparaîtront ici en temps réel</p>
            </div>
          )}
        </div>

        {/* Statistiques des mises à jour */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {updates.filter((u) => u.type === "new_request").length}
              </div>
              <div className="text-sm text-gray-400">Nouvelles demandes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {updates.filter((u) => u.type === "request_completed").length}
              </div>
              <div className="text-sm text-gray-400">Terminées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {updates.filter((u) => u.type === "provider_online").length}
              </div>
              <div className="text-sm text-gray-400">Prestataires actifs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {updates.filter((u) => u.type === "system_alert").length}
              </div>
              <div className="text-sm text-gray-400">Alertes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

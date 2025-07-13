"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, Settings, Zap, Activity, Wifi, WifiOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useWebSocket } from "@/components/realtime/websocket-provider"

export function RealtimeControls() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [refreshRate, setRefreshRate] = useState([5])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showNotifications, setShowNotifications] = useState(true)
  const { isConnected, connectionStatus } = useWebSocket()

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setRefreshRate([5])
    setAutoRefresh(true)
    setShowNotifications(true)
    setIsPlaying(true)
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-400"
      case "connecting":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connecté"
      case "connecting":
        return "Connexion..."
      case "error":
        return "Erreur"
      default:
        return "Déconnecté"
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl">Contrôles Temps Réel</span>
            <p className="text-sm text-gray-400 font-normal">Gestion des mises à jour automatiques</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statut de connexion */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              Statut de Connexion
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">État:</span>
                <Badge className={`${isConnected ? "bg-green-500" : "bg-red-500"} text-white`}>
                  {getConnectionStatusText()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">WebSocket:</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Latence:</span>
                <span className="text-white">45ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Messages/min:</span>
                <span className="text-blue-400">12.3</span>
              </div>
            </div>
          </div>

          {/* Contrôles de lecture */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Contrôles de Lecture
            </h3>

            <div className="space-y-4">
              {/* Boutons de contrôle */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handlePlayPause}
                  className={`${isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Taux de rafraîchissement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Taux de rafraîchissement</label>
                  <span className="text-sm text-white">{refreshRate[0]}s</span>
                </div>
                <Slider
                  value={refreshRate}
                  onValueChange={setRefreshRate}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4">Options</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-300">Actualisation auto</label>
                  <p className="text-xs text-gray-500">Mise à jour automatique des données</p>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-300">Notifications push</label>
                  <p className="text-xs text-gray-500">Alertes en temps réel</p>
                </div>
                <Switch checked={showNotifications} onCheckedChange={setShowNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-300">Mode performance</label>
                  <p className="text-xs text-gray-500">Optimisation pour les appareils lents</p>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-gray-300">Sons d'alerte</label>
                  <p className="text-xs text-gray-500">Notifications sonores</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="text-center"
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
            >
              <div className="text-2xl font-bold text-blue-400">247</div>
              <div className="text-sm text-gray-400">Connexions actives</div>
            </motion.div>

            <motion.div
              className="text-center"
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, delay: 0.5, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
            >
              <div className="text-2xl font-bold text-green-400">12.3</div>
              <div className="text-sm text-gray-400">Messages/sec</div>
            </motion.div>

            <motion.div
              className="text-center"
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, delay: 1, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
            >
              <div className="text-2xl font-bold text-purple-400">45ms</div>
              <div className="text-sm text-gray-400">Latence moyenne</div>
            </motion.div>

            <motion.div
              className="text-center"
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, delay: 1.5, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
            >
              <div className="text-2xl font-bold text-yellow-400">99.8%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

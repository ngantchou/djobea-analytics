"use client"

import { useWebSocket } from "./websocket-provider"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected, connectionStatus } = useWebSocket()

  if (connectionStatus === "disconnected") {
    return null // Don't show anything when not attempting to connect
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
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

  const getIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3" />
      case "connecting":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "error":
        return <WifiOff className="h-3 w-3" />
      default:
        return <WifiOff className="h-3 w-3" />
    }
  }

  return (
    <Badge variant="outline" className={`${getStatusColor()} text-white border-0`}>
      {getIcon()}
      <span className="ml-1 text-xs">{getStatusText()}</span>
    </Badge>
  )
}

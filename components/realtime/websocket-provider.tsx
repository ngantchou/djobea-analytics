"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface WebSocketContextType {
  isConnected: boolean
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  lastMessage: any
  sendMessage: (message: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [lastMessage, setLastMessage] = useState<any>(null)

  useEffect(() => {
    // Mock WebSocket connection for development
    setConnectionStatus("connecting")

    const timer = setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus("connected")

      // Simulate receiving messages
      const messageInterval = setInterval(() => {
        setLastMessage({
          type: "update",
          data: { timestamp: new Date().toISOString() },
        })
      }, 30000) // Every 30 seconds

      return () => clearInterval(messageInterval)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const sendMessage = (message: any) => {
    if (isConnected) {
      console.log("Sending message:", message)
      // In production, send via actual WebSocket
    }
  }

  const value: WebSocketContextType = {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

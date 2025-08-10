"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { logger } from "@/lib/logger"

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  id?: string
}

export interface UseWebSocketOptions {
  url?: string
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  autoConnect?: boolean
  protocols?: string[]
}

export interface UseWebSocketReturn {
  isConnected: boolean
  connectionStatus: ConnectionStatus
  lastMessage: WebSocketMessage | null
  sendMessage: (message: WebSocketMessage) => void
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  error: string | null
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    autoConnect = true,
    protocols = [],
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  const isManuallyDisconnectedRef = useRef(false)

  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "ping",
            timestamp: new Date().toISOString(),
          }))
          startHeartbeat() // Schedule next heartbeat
        }
      }, heartbeatInterval)
    }
  }, [heartbeatInterval])

  const handleOpen = useCallback(() => {
    logger.info("WebSocket connected")
    setIsConnected(true)
    setConnectionStatus("connected")
    setError(null)
    reconnectCountRef.current = 0
    startHeartbeat()
  }, [startHeartbeat])

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      // Handle pong responses
      if (message.type === "pong") {
        logger.debug("Received pong")
        return
      }

      logger.debug("WebSocket message received:", message)
      setLastMessage(message)
    } catch (err) {
      logger.error("Failed to parse WebSocket message:", err)
    }
  }, [])

  const handleError = useCallback((event: Event) => {
    logger.error("WebSocket error:", event)
    setError("Connection error occurred")
    setConnectionStatus("error")
  }, [])

  const handleClose = useCallback(() => {
    logger.info("WebSocket disconnected")
    setIsConnected(false)
    clearTimeouts()

    if (!isManuallyDisconnectedRef.current) {
      setConnectionStatus("disconnected")
      
      // Attempt to reconnect if not manually disconnected
      if (reconnectCountRef.current < reconnectAttempts) {
        const delay = reconnectInterval * Math.pow(1.5, reconnectCountRef.current) // Exponential backoff
        logger.info(`Attempting to reconnect in ${delay}ms (attempt ${reconnectCountRef.current + 1}/${reconnectAttempts})`)
        
        setConnectionStatus("connecting")
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectCountRef.current += 1
          connect()
        }, delay)
      } else {
        logger.warn("Max reconnection attempts reached")
        setConnectionStatus("error")
        setError("Failed to reconnect after maximum attempts")
      }
    } else {
      setConnectionStatus("disconnected")
    }
  }, [reconnectAttempts, reconnectInterval])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logger.warn("WebSocket is already connected")
      return
    }

    try {
      logger.info("Connecting to WebSocket:", url)
      setConnectionStatus("connecting")
      setError(null)
      isManuallyDisconnectedRef.current = false

      wsRef.current = new WebSocket(url, protocols)

      wsRef.current.onopen = handleOpen
      wsRef.current.onmessage = handleMessage
      wsRef.current.onerror = handleError
      wsRef.current.onclose = handleClose

    } catch (err) {
      logger.error("Failed to create WebSocket connection:", err)
      setError("Failed to connect")
      setConnectionStatus("error")
    }
  }, [url, protocols, handleOpen, handleMessage, handleError, handleClose])

  const disconnect = useCallback(() => {
    logger.info("Manually disconnecting WebSocket")
    isManuallyDisconnectedRef.current = true
    clearTimeouts()
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus("disconnected")
    setError(null)
  }, [clearTimeouts])

  const reconnect = useCallback(() => {
    logger.info("Manual reconnection requested")
    reconnectCountRef.current = 0
    disconnect()
    setTimeout(() => {
      connect()
    }, 100)
  }, [disconnect, connect])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: new Date().toISOString(),
          id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }
        
        wsRef.current.send(JSON.stringify(messageWithTimestamp))
        logger.debug("Message sent:", messageWithTimestamp)
      } catch (err) {
        logger.error("Failed to send message:", err)
        setError("Failed to send message")
      }
    } else {
      logger.warn("Cannot send message: WebSocket is not connected")
      setError("Not connected")
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      clearTimeouts()
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [autoConnect, connect, clearTimeouts])

  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected && !isManuallyDisconnectedRef.current) {
        logger.info("Tab became visible, attempting to reconnect")
        reconnect()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isConnected, reconnect])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      logger.info("Network back online, attempting to reconnect")
      if (!isConnected && !isManuallyDisconnectedRef.current) {
        reconnect()
      }
    }

    const handleOffline = () => {
      logger.info("Network went offline")
      setError("Network offline")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isConnected, reconnect])

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnect,
    error,
  }
}
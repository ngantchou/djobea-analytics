"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

interface Contact {
  id: string
  name: string
  avatar: string
  role: "client" | "provider" | "admin"
  status: "online" | "offline" | "away"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  phone?: string
  email?: string
  location?: {
    lat: number
    lng: number
    address: string
  }
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: "user" | "ai_agent" | "human_agent"
  content: string
  timestamp: string
  type: "text" | "image" | "file" | "system" | "location" | "contact" | "emoji"
  status: "sent" | "delivered" | "read"
  attachments?: Array<{
    type: string
    url: string
    name: string
    size?: string
    thumbnail?: string
  }>
  location?: {
    lat: number
    lng: number
    address: string
  }
  contact?: {
    name: string
    phone: string
    email?: string
    avatar?: string
  }
  metadata?: {
    agentId?: string
    confidence?: number
    processingTime?: number
  }
}

interface MessagesStats {
  totalContacts: number
  unreadCount: number
  onlineCount: number
  clientsCount: number
  providersCount: number
  totalMessages: number
}

interface UseMessagesReturn {
  data: any[]
  pagination: any
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  sendMessage: (messageData: {
    conversationId: string
    content: string
    type?: string
    attachments?: any[]
    location?: any
    contact?: any
    senderType?: string
    metadata?: any
  }) => Promise<any>
}

export function useMessages(params?: {
  type?: string
  search?: string
  status?: string // 'active', 'escalated', 'resolved', 'ai_active'
  conversationId?: string
  page?: number
  limit?: number
}): UseMessagesReturn {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>({})
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the new conversation API for conversation lists
      if (params?.conversationId) {
        // Fetch messages for a specific conversation
        const result = await apiClient.getConversationMessages(params.conversationId, {
          page: params.page || 1,
          limit: params.limit || 50
        })

        if (result.success) {
          setData(result.data.messages || [])
          setPagination(result.data.pagination || {})
        } else {
          throw new Error(result.error || "Failed to fetch conversation messages")
        }
      } else {
        // Fetch conversation list
        const result = await apiClient.getConversations({
          page: params?.page || 1,
          limit: params?.limit || 20,
          status: params?.status,
          search: params?.search
        })

        if (result.success) {
          setData(result.data.conversations || [])
          setPagination(result.data.pagination || {})
        } else {
          throw new Error(result.error || "Failed to fetch conversations")
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des messages"
      setError(message)
      logger.error("Failed to fetch messages", { error: err, params })

      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [params, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sendMessage = useCallback(
    async (messageData: {
      conversationId: string
      content: string
      type?: string
      attachments?: any[]
      location?: any
      contact?: any
      senderType?: string
      metadata?: any
    }) => {
      try {
        const result = await apiClient.sendMessage({
          conversationId: messageData.conversationId,
          content: messageData.content,
          type: messageData.type,
          senderType: messageData.senderType || "admin",
          attachments: messageData.attachments,
          metadata: messageData.metadata
        })

        if (result.success) {
          await fetchData()
          toast({
            title: "Succès",
            description: "Message envoyé avec succès",
            variant: "default",
          })
          return result.data
        } else {
          throw new Error(result.error || "Failed to send message")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de l'envoi"
        logger.error("Failed to send message", { error: err, messageData })

        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchData, toast],
  )

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    pagination,
    loading,
    error,
    refetch,
    sendMessage,
  }
}

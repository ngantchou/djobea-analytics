"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

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
  contacts: Contact[]
  messages: Message[]
  stats: MessagesStats | null
  loading: boolean
  error: string | null
  sendMessage: (
    conversationId: string,
    content: string,
    type?: string,
    attachments?: any[],
    location?: any,
    contact?: any,
    senderType?: string,
  ) => Promise<void>
  sendFile: (conversationId: string, file: File) => Promise<void>
  sendLocation: (conversationId: string, lat: number, lng: number, address: string) => Promise<void>
  sendContact: (conversationId: string, contact: any) => Promise<void>
  fetchContacts: (filters?: { search?: string; role?: string; status?: string }) => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  fetchStats: () => Promise<void>
  updateContact: (contactId: string, action: string) => Promise<void>
  updateMessageStatus: (messageId: string, status: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
}

export function useMessages(): UseMessagesReturn {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<MessagesStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleError = useCallback(
    (error: any, defaultMessage: string) => {
      const message = error?.message || defaultMessage
      setError(message)
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    },
    [toast],
  )

  const fetchContacts = useCallback(
    async (filters?: { search?: string; role?: string; status?: string }) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({ type: "contacts" })
        if (filters?.search) params.append("search", filters.search)
        if (filters?.role) params.append("role", filters.role)
        if (filters?.status) params.append("status", filters.status)

        const response = await fetch(`/api/messages?${params}`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch contacts")
        }

        setContacts(data.data)
      } catch (error) {
        handleError(error, "Erreur lors du chargement des contacts")
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/messages?type=messages&conversationId=${conversationId}`)
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch messages")
        }

        setMessages(data.data)
      } catch (error) {
        handleError(error, "Erreur lors du chargement des messages")
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/messages?type=stats")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch stats")
      }

      setStats(data.data)
    } catch (error) {
      handleError(error, "Erreur lors du chargement des statistiques")
    }
  }, [handleError])

  const sendMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      type = "text",
      attachments: any[] = [],
      location?: any,
      contact?: any,
      senderType = "user",
    ) => {
      try {
        setError(null)

        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId,
            content,
            type,
            attachments,
            location,
            contact,
            senderType,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to send message")
        }

        // Add message to local state
        setMessages((prev) => [...prev, data.data])

        toast({
          title: "Message envoyé",
          description: "Votre message a été envoyé avec succès",
        })

        // Simulate status updates
        setTimeout(() => {
          setMessages((prev) => prev.map((msg) => (msg.id === data.data.id ? { ...msg, status: "delivered" } : msg)))
        }, 1000)

        setTimeout(() => {
          setMessages((prev) => prev.map((msg) => (msg.id === data.data.id ? { ...msg, status: "read" } : msg)))
        }, 3000)
      } catch (error) {
        handleError(error, "Erreur lors de l'envoi du message")
      }
    },
    [handleError, toast],
  )

  const sendFile = useCallback(
    async (conversationId: string, file: File) => {
      try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append("file", file)
        formData.append("conversationId", conversationId)

        // In a real app, you'd upload to a file storage service
        const fileUrl = URL.createObjectURL(file)

        const attachments = [
          {
            type: file.type.startsWith("image/") ? "image" : "file",
            url: fileUrl,
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            thumbnail: file.type.startsWith("image/") ? fileUrl : undefined,
          },
        ]

        await sendMessage(
          conversationId,
          `Fichier partagé: ${file.name}`,
          file.type.startsWith("image/") ? "image" : "file",
          attachments,
        )
      } catch (error) {
        handleError(error, "Erreur lors de l'envoi du fichier")
      }
    },
    [sendMessage, handleError],
  )

  const sendLocation = useCallback(
    async (conversationId: string, lat: number, lng: number, address: string) => {
      try {
        const location = { lat, lng, address }

        await sendMessage(conversationId, "", "location", [], location)
      } catch (error) {
        handleError(error, "Erreur lors de l'envoi de la position")
      }
    },
    [sendMessage, handleError],
  )

  const sendContact = useCallback(
    async (conversationId: string, contact: any) => {
      try {
        await sendMessage(conversationId, "", "contact", [], undefined, contact)
      } catch (error) {
        handleError(error, "Erreur lors de l'envoi du contact")
      }
    },
    [sendMessage, handleError],
  )

  const updateContact = useCallback(
    async (contactId: string, action: string) => {
      try {
        setError(null)

        const response = await fetch("/api/messages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId,
            action,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to update contact")
        }

        // Update contact in local state
        setContacts((prev) =>
          prev.map((contact) => (contact.id === contactId ? { ...contact, ...data.data } : contact)),
        )

        const actionMessages = {
          pin: "Conversation épinglée",
          mute: "Notifications désactivées",
          mark_read: "Marqué comme lu",
          archive: "Conversation archivée",
          delete: "Conversation supprimée",
        }

        toast({
          title: "Action effectuée",
          description: actionMessages[action as keyof typeof actionMessages] || "Action effectuée",
        })
      } catch (error) {
        handleError(error, "Erreur lors de la mise à jour du contact")
      }
    },
    [handleError, toast],
  )

  const updateMessageStatus = useCallback(
    async (messageId: string, status: string) => {
      try {
        setError(null)

        const response = await fetch("/api/messages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            status,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to update message status")
        }

        // Update message in local state
        setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, status } : message)))
      } catch (error) {
        handleError(error, "Erreur lors de la mise à jour du statut du message")
      }
    },
    [handleError],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        setError(null)

        const response = await fetch(`/api/messages?messageId=${messageId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to delete message")
        }

        // Remove message from local state
        setMessages((prev) => prev.filter((message) => message.id !== messageId))

        toast({
          title: "Message supprimé",
          description: "Le message a été supprimé avec succès",
        })
      } catch (error) {
        handleError(error, "Erreur lors de la suppression du message")
      }
    },
    [handleError, toast],
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        setError(null)

        const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to delete conversation")
        }

        // Clear messages and update contacts
        setMessages([])
        setContacts((prev) => prev.filter((contact) => contact.id !== conversationId))

        toast({
          title: "Conversation supprimée",
          description: "La conversation a été supprimée avec succès",
        })
      } catch (error) {
        handleError(error, "Erreur lors de la suppression de la conversation")
      }
    },
    [handleError, toast],
  )

  // Load initial data
  useEffect(() => {
    fetchContacts()
    fetchStats()
  }, [fetchContacts, fetchStats])

  return {
    contacts,
    messages,
    stats,
    loading,
    error,
    sendMessage,
    sendFile,
    sendLocation,
    sendContact,
    fetchContacts,
    fetchMessages,
    fetchStats,
    updateContact,
    updateMessageStatus,
    deleteMessage,
    deleteConversation,
  }
}

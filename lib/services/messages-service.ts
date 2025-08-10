import { ApiClient } from "@/lib/api-client"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  recipientId: string
  recipientName: string
  content: string
  type: "text" | "image" | "file" | "audio" | "video" | "system"
  attachments?: MessageAttachment[]
  status: "sent" | "delivered" | "read" | "failed"
  replyTo?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnailUrl?: string
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  lastMessage?: Message
  unreadCount: number
  type: "direct" | "group" | "support"
  title?: string
  avatar?: string
  status: "active" | "archived" | "blocked"
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "member" | "guest"
  joinedAt: string
  lastSeenAt?: string
}

export interface MessageFilters {
  conversationId?: string
  senderId?: string
  type?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
  status?: string[]
}

export interface SendMessageData {
  conversationId?: string
  recipientId?: string
  content: string
  type?: "text" | "image" | "file" | "audio" | "video"
  attachments?: File[]
  replyTo?: string
  metadata?: Record<string, any>
}

export interface CreateConversationData {
  participantIds: string[]
  type: "direct" | "group" | "support"
  title?: string
  initialMessage?: string
}

export class MessagesService {
  static async getConversations(
    page = 1,
    limit = 20,
    filters?: { status?: string; search?: string }
  ): Promise<{
    conversations: Conversation[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const response = await ApiClient.getConversations({
        page,
        limit,
        status: filters?.status,
        search: filters?.search
      })
      
      if (response.success) {
        return {
          conversations: response.data.conversations || [],
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || page,
          totalPages: response.data.pagination?.totalPages || 1
        }
      } else {
        throw new Error(response.error || "Failed to fetch conversations")
      }
    } catch (error) {
      console.error("Get conversations error:", error)
      throw new Error("Erreur lors de la récupération des conversations")
    }
  }

  static async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await ApiClient.get<Conversation>(`/api/messages/conversations/${id}`)
      return response
    } catch (error) {
      console.error("Get conversation error:", error)
      throw new Error("Erreur lors de la récupération de la conversation")
    }
  }

  static async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      const response = await ApiClient.post<Conversation>("/api/messages/conversations", data)
      return response
    } catch (error) {
      console.error("Create conversation error:", error)
      throw new Error("Erreur lors de la création de la conversation")
    }
  }

  static async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<{
    messages: Message[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const response = await ApiClient.getConversationMessages(conversationId, {
        page,
        limit
      })
      
      if (response.success) {
        return {
          messages: response.data.messages || [],
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || page,
          totalPages: Math.ceil((response.data.pagination?.total || 0) / limit)
        }
      } else {
        throw new Error(response.error || "Failed to fetch messages")
      }
    } catch (error) {
      console.error("Get messages error:", error)
      throw new Error("Erreur lors de la récupération des messages")
    }
  }

  static async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      const response = await ApiClient.sendMessage({
        conversationId: data.conversationId,
        recipientId: data.recipientId,
        content: data.content,
        type: data.type || "text",
        senderType: "admin", // Default to admin for manual messages
        attachments: data.attachments,
        metadata: data.metadata
      })
      
      if (response.success) {
        // Transform response to match expected Message format
        return {
          id: response.data.conversation_id || Date.now().toString(),
          conversationId: data.conversationId || "",
          senderId: "admin",
          senderName: "Administrateur",
          senderAvatar: "",
          recipientId: data.recipientId || "",
          recipientName: "",
          content: data.content,
          type: data.type || "text",
          attachments: data.attachments ? data.attachments.map(file => ({
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file)
          })) : undefined,
          status: "sent",
          replyTo: data.replyTo,
          metadata: data.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else {
        throw new Error(response.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Send message error:", error)
      throw new Error("Erreur lors de l'envoi du message")
    }
  }

  static async markAsRead(messageIds: string[]): Promise<void> {
    try {
      await ApiClient.post("/api/messages/mark-read", { messageIds })
    } catch (error) {
      console.error("Mark as read error:", error)
      throw new Error("Erreur lors du marquage comme lu")
    }
  }

  static async deleteMessage(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/messages/${id}`)
    } catch (error) {
      console.error("Delete message error:", error)
      throw new Error("Erreur lors de la suppression du message")
    }
  }

  static async searchMessages(query: string, filters?: MessageFilters): Promise<Message[]> {
    try {
      const response = await ApiClient.post<Message[]>("/api/messages/search", {
        query,
        filters,
      })
      return response
    } catch (error) {
      console.error("Search messages error:", error)
      throw new Error("Erreur lors de la recherche de messages")
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const response = await ApiClient.getUnreadCount()
      if (response.success) {
        return response.count || 0
      } else {
        return 0
      }
    } catch (error) {
      console.error("Get unread count error:", error)
      return 0
    }
  }

  static async toggleEscalation(conversationId: string, action: 'escalate' | 'deescalate', reason?: string): Promise<void> {
    try {
      const response = await ApiClient.toggleEscalation(conversationId, {
        action,
        reason: reason || (action === 'escalate' ? 'Manual escalation by admin' : 'Escalation resolved')
      })
      
      if (!response.success) {
        throw new Error(response.error || "Failed to toggle escalation")
      }
    } catch (error) {
      console.error("Toggle escalation error:", error)
      throw new Error("Erreur lors du changement d'escalade")
    }
  }

  static async archiveConversation(id: string): Promise<void> {
    try {
      await ApiClient.post(`/api/messages/conversations/${id}/archive`)
    } catch (error) {
      console.error("Archive conversation error:", error)
      throw new Error("Erreur lors de l'archivage de la conversation")
    }
  }

  static async blockUser(userId: string): Promise<void> {
    try {
      await ApiClient.post(`/api/messages/block/${userId}`)
    } catch (error) {
      console.error("Block user error:", error)
      throw new Error("Erreur lors du blocage de l'utilisateur")
    }
  }

  static async unblockUser(userId: string): Promise<void> {
    try {
      await ApiClient.post(`/api/messages/unblock/${userId}`)
    } catch (error) {
      console.error("Unblock user error:", error)
      throw new Error("Erreur lors du déblocage de l'utilisateur")
    }
  }

  static async uploadAttachment(file: File): Promise<MessageAttachment> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await ApiClient.post<MessageAttachment>("/api/messages/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response
    } catch (error) {
      console.error("Upload attachment error:", error)
      throw new Error("Erreur lors du téléchargement de la pièce jointe")
    }
  }

  static async getMessageStatus(id: string): Promise<{ status: string; deliveredAt?: string; readAt?: string }> {
    try {
      const response = await ApiClient.get<{ status: string; deliveredAt?: string; readAt?: string }>(
        `/api/messages/${id}/status`,
      )
      return response
    } catch (error) {
      console.error("Get message status error:", error)
      throw new Error("Erreur lors de la récupération du statut du message")
    }
  }
}

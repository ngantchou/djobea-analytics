import { type NextRequest, NextResponse } from "next/server"

// Mock data
const mockContacts = [
  {
    id: "1",
    name: "Marie Dubois",
    avatar: "/placeholder.svg?height=40&width=40&text=MD",
    role: "client",
    status: "online",
    lastMessage: "Merci pour votre aide, le problème est résolu !",
    lastMessageTime: "Il y a 2 min",
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    phone: "+237 6 12 34 56 78",
    email: "marie.dubois@email.com",
    location: {
      lat: 4.0511,
      lng: 9.7679,
      address: "Douala, Cameroun",
    },
  },
  {
    id: "2",
    name: "Jean Plombier",
    avatar: "/placeholder.svg?height=40&width=40&text=JP",
    role: "provider",
    status: "online",
    lastMessage: "Je peux venir demain matin vers 9h",
    lastMessageTime: "Il y a 5 min",
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    phone: "+237 6 98 76 54 32",
    email: "jean.plombier@email.com",
  },
  {
    id: "3",
    name: "Sophie Martin",
    avatar: "/placeholder.svg?height=40&width=40&text=SM",
    role: "client",
    status: "away",
    lastMessage: "D'accord, à bientôt",
    lastMessageTime: "Il y a 1h",
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    phone: "+237 6 11 22 33 44",
    email: "sophie.martin@email.com",
  },
]

const mockMessages: Record<string, any[]> = {
  "1": [
    {
      id: "1",
      conversationId: "1",
      senderId: "1",
      senderName: "Marie Dubois",
      senderType: "user",
      content: "Bonjour, j'ai un problème avec ma plomberie",
      timestamp: "2024-01-15T10:30:00Z",
      type: "text",
      status: "read",
      attachments: [],
    },
    {
      id: "2",
      conversationId: "1",
      senderId: "ai_agent_1",
      senderName: "Assistant IA Djobea",
      senderType: "ai_agent",
      content:
        "Bonjour Marie ! Je comprends votre problème de plomberie. Pouvez-vous me décrire plus précisément le problème ?",
      timestamp: "2024-01-15T10:31:00Z",
      type: "text",
      status: "read",
      attachments: [],
      metadata: {
        agentId: "ai_agent_1",
        confidence: 0.95,
        processingTime: 1.2,
      },
    },
    {
      id: "3",
      conversationId: "1",
      senderId: "1",
      senderName: "Marie Dubois",
      senderType: "user",
      content: "Voici une photo du problème",
      timestamp: "2024-01-15T10:35:00Z",
      type: "image",
      status: "read",
      attachments: [
        {
          type: "image",
          url: "/placeholder.svg?height=200&width=300&text=Problème+Plomberie",
          name: "probleme_plomberie.jpg",
          size: "2.5 MB",
          thumbnail: "/placeholder.svg?height=100&width=150&text=Thumb",
        },
      ],
    },
    {
      id: "4",
      conversationId: "1",
      senderId: "human_agent_1",
      senderName: "Agent Paul",
      senderType: "human_agent",
      content:
        "Je vois le problème sur la photo. Je vais vous mettre en contact avec Jean, notre meilleur plombier de votre secteur.",
      timestamp: "2024-01-15T10:40:00Z",
      type: "text",
      status: "read",
      attachments: [],
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const conversationId = searchParams.get("conversationId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    switch (type) {
      case "contacts": {
        let filteredContacts = [...mockContacts]

        // Apply filters
        if (search) {
          filteredContacts = filteredContacts.filter(
            (contact) =>
              contact.name.toLowerCase().includes(search.toLowerCase()) ||
              contact.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
              contact.email?.toLowerCase().includes(search.toLowerCase()) ||
              contact.phone?.includes(search),
          )
        }

        if (role) {
          filteredContacts = filteredContacts.filter((contact) => contact.role === role)
        }

        if (status) {
          switch (status) {
            case "online":
            case "offline":
            case "away":
              filteredContacts = filteredContacts.filter((contact) => contact.status === status)
              break
            case "unread":
              filteredContacts = filteredContacts.filter((contact) => contact.unreadCount > 0)
              break
            case "pinned":
              filteredContacts = filteredContacts.filter((contact) => contact.isPinned)
              break
            case "muted":
              filteredContacts = filteredContacts.filter((contact) => contact.isMuted)
              break
          }
        }

        // Sort: pinned first, then by last message time
        filteredContacts.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return 0
        })

        // Pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedContacts = filteredContacts.slice(startIndex, endIndex)

        return NextResponse.json({
          success: true,
          data: paginatedContacts,
          pagination: {
            page,
            limit,
            total: filteredContacts.length,
            totalPages: Math.ceil(filteredContacts.length / limit),
            hasNextPage: endIndex < filteredContacts.length,
            hasPrevPage: page > 1,
          },
        })
      }

      case "messages": {
        if (!conversationId) {
          return NextResponse.json(
            {
              success: false,
              error: "MISSING_CONVERSATION_ID",
              message: "conversationId is required for messages",
            },
            { status: 400 },
          )
        }

        const messages = mockMessages[conversationId] || []

        // Pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedMessages = messages.slice(startIndex, endIndex)

        return NextResponse.json({
          success: true,
          data: paginatedMessages,
          pagination: {
            page,
            limit,
            total: messages.length,
            totalPages: Math.ceil(messages.length / limit),
            hasNextPage: endIndex < messages.length,
            hasPrevPage: page > 1,
          },
        })
      }

      case "stats": {
        const totalContacts = mockContacts.length
        const unreadCount = mockContacts.reduce((sum, contact) => sum + contact.unreadCount, 0)
        const onlineCount = mockContacts.filter((contact) => contact.status === "online").length
        const clientsCount = mockContacts.filter((contact) => contact.role === "client").length
        const providersCount = mockContacts.filter((contact) => contact.role === "provider").length
        const totalMessages = Object.values(mockMessages).reduce((sum, messages) => sum + messages.length, 0)

        return NextResponse.json({
          success: true,
          data: {
            totalContacts,
            unreadCount,
            onlineCount,
            clientsCount,
            providersCount,
            totalMessages,
          },
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "INVALID_TYPE",
            message: "type parameter must be one of: contacts, messages, stats",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Messages API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "An internal error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      conversationId,
      content,
      type = "text",
      attachments = [],
      location,
      contact,
      senderType = "user",
      metadata,
    } = body

    // Validation
    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "conversationId is required",
          details: [{ field: "conversationId", message: "This field is required", code: "REQUIRED" }],
        },
        { status: 400 },
      )
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      conversationId,
      senderId: senderType === "ai_agent" ? "ai_agent_1" : senderType === "human_agent" ? "human_agent_1" : "admin",
      senderName:
        senderType === "ai_agent" ? "Assistant IA Djobea" : senderType === "human_agent" ? "Agent Paul" : "Admin",
      senderType,
      content: content || "",
      timestamp: new Date().toISOString(),
      type,
      status: "sent",
      attachments,
      location,
      contact,
      metadata,
    }

    // Add to mock data (in real app, save to database)
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = []
    }
    mockMessages[conversationId].push(newMessage)

    // Simulate AI response if needed
    if (senderType === "user" && content && (content.includes("problème") || content.includes("aide"))) {
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          conversationId,
          senderId: "ai_agent_1",
          senderName: "Assistant IA Djobea",
          senderType: "ai_agent",
          content: getAIResponse(content),
          timestamp: new Date().toISOString(),
          type: "text",
          status: "sent",
          attachments: [],
          metadata: {
            agentId: "ai_agent_1",
            confidence: Math.random() * 0.3 + 0.7,
            processingTime: Math.random() * 2 + 1,
          },
        }
        mockMessages[conversationId].push(aiResponse)
      }, 2000)
    }

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
        message: "Message sent successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to send message",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, status, contactId, action } = body

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (messageId && status) {
      // Update message status
      for (const conversationMessages of Object.values(mockMessages)) {
        const message = conversationMessages.find((m) => m.id === messageId)
        if (message) {
          message.status = status
          return NextResponse.json({
            success: true,
            data: message,
            message: "Message status updated successfully",
          })
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "MESSAGE_NOT_FOUND",
          message: "Message not found",
        },
        { status: 404 },
      )
    }

    if (contactId && action) {
      // Update contact
      const contactIndex = mockContacts.findIndex((c) => c.id === contactId)
      if (contactIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: "CONTACT_NOT_FOUND",
            message: "Contact not found",
          },
          { status: 404 },
        )
      }

      const contact = mockContacts[contactIndex]

      switch (action) {
        case "pin":
          contact.isPinned = !contact.isPinned
          break
        case "mute":
          contact.isMuted = !contact.isMuted
          break
        case "mark_read":
          contact.unreadCount = 0
          break
        case "archive":
          // In real app, move to archived list
          break
        case "delete":
          // In real app, remove from list
          break
        default:
          return NextResponse.json(
            {
              success: false,
              error: "INVALID_ACTION",
              message: "Invalid action. Must be one of: pin, mute, mark_read, archive, delete",
            },
            { status: 400 },
          )
      }

      return NextResponse.json({
        success: true,
        data: contact,
        message: `Contact ${action} action completed successfully`,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "INVALID_REQUEST",
        message: "Either (messageId and status) or (contactId and action) are required",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to update",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    const conversationId = searchParams.get("conversationId")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (messageId) {
      // Delete specific message
      for (const [convId, messages] of Object.entries(mockMessages)) {
        const messageIndex = messages.findIndex((m) => m.id === messageId)
        if (messageIndex !== -1) {
          messages.splice(messageIndex, 1)
          return NextResponse.json({
            success: true,
            message: "Message deleted successfully",
          })
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "MESSAGE_NOT_FOUND",
          message: "Message not found",
        },
        { status: 404 },
      )
    }

    if (conversationId) {
      // Delete entire conversation
      if (mockMessages[conversationId]) {
        delete mockMessages[conversationId]
        return NextResponse.json({
          success: true,
          message: "Conversation deleted successfully",
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "CONVERSATION_NOT_FOUND",
          message: "Conversation not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "MISSING_PARAMETER",
        message: "Either messageId or conversationId is required",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to delete",
      },
      { status: 500 },
    )
  }
}

function getAIResponse(userInput: string): string {
  const input = userInput.toLowerCase()

  if (input.includes("problème") || input.includes("panne")) {
    return "Je comprends votre problème. Pouvez-vous me donner plus de détails ? Une photo pourrait m'aider à mieux diagnostiquer la situation."
  }

  if (input.includes("urgent") || input.includes("emergency")) {
    return "Je vois que c'est urgent ! Je vais immédiatement vous mettre en contact avec un prestataire disponible dans votre zone."
  }

  if (input.includes("prix") || input.includes("coût") || input.includes("tarif")) {
    return "Les tarifs varient selon la complexité de l'intervention. Je peux vous donner une estimation après avoir analysé votre demande. Voulez-vous que je vous mette en contact avec un prestataire pour un devis ?"
  }

  if (input.includes("merci") || input.includes("parfait")) {
    return "Je suis ravi d'avoir pu vous aider ! N'hésitez pas à me recontacter si vous avez d'autres questions. 😊"
  }

  return "Je suis là pour vous aider ! Pouvez-vous me donner plus de détails sur votre demande ?"
}

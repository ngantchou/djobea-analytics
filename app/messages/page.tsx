"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Pin,
  VolumeX,
  Archive,
  Trash2,
  Filter,
  Users,
  MessageCircle,
  MapPin,
  User,
  Bot,
  ImageIcon,
  FileText,
  Download,
  Settings,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import EmojiPicker from "emoji-picker-react"

// Types
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

interface ConversationMode {
  type: "ai" | "human" | "hybrid"
  aiEnabled: boolean
  humanAgent?: {
    id: string
    name: string
    avatar: string
    status: "online" | "offline"
  }
}

// Mock data
const mockContacts: Contact[] = [
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

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      senderName: "Marie Dubois",
      senderType: "user",
      content: "Bonjour, j'ai un problème avec ma plomberie",
      timestamp: "2024-01-15T10:30:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "2",
      senderId: "ai_agent_1",
      senderName: "Assistant IA Djobea",
      senderType: "ai_agent",
      content:
        "Bonjour Marie ! Je comprends votre problème de plomberie. Pouvez-vous me décrire plus précisément le problème ?",
      timestamp: "2024-01-15T10:31:00Z",
      type: "text",
      status: "read",
      metadata: {
        agentId: "ai_agent_1",
        confidence: 0.95,
        processingTime: 1.2,
      },
    },
    {
      id: "3",
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
      senderId: "human_agent_1",
      senderName: "Agent Paul",
      senderType: "human_agent",
      content:
        "Je vois le problème sur la photo. Je vais vous mettre en contact avec Jean, notre meilleur plombier de votre secteur.",
      timestamp: "2024-01-15T10:40:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "5",
      senderId: "human_agent_1",
      senderName: "Agent Paul",
      senderType: "human_agent",
      content: "",
      timestamp: "2024-01-15T10:41:00Z",
      type: "contact",
      status: "read",
      contact: {
        name: "Jean Plombier",
        phone: "+237 6 98 76 54 32",
        email: "jean.plombier@email.com",
        avatar: "/placeholder.svg?height=40&width=40&text=JP",
      },
    },
    {
      id: "6",
      senderId: "1",
      senderName: "Marie Dubois",
      senderType: "user",
      content: "",
      timestamp: "2024-01-15T10:45:00Z",
      type: "location",
      status: "read",
      location: {
        lat: 4.0511,
        lng: 9.7679,
        address: "123 Rue de la Paix, Douala, Cameroun",
      },
    },
    {
      id: "7",
      senderId: "1",
      senderName: "Marie Dubois",
      senderType: "user",
      content: "😊 Merci beaucoup !",
      timestamp: "2024-01-15T14:25:00Z",
      type: "emoji",
      status: "read",
    },
  ],
}

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(mockContacts[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [contacts, setContacts] = useState(mockContacts)
  const [messages, setMessages] = useState<Message[]>(mockMessages["1"] || [])
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [conversationMode, setConversationMode] = useState<ConversationMode>({
    type: "hybrid",
    aiEnabled: true,
    humanAgent: {
      id: "human_agent_1",
      name: "Agent Paul",
      avatar: "/placeholder.svg?height=40&width=40&text=AP",
      status: "online",
    },
  })
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter contacts based on search and active tab
  const filteredContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())

      switch (activeTab) {
        case "clients":
          return matchesSearch && contact.role === "client"
        case "providers":
          return matchesSearch && contact.role === "provider"
        case "unread":
          return matchesSearch && contact.unreadCount > 0
        case "pinned":
          return matchesSearch && contact.isPinned
        default:
          return matchesSearch
      }
    })
    .sort((a, b) => {
      // Sort pinned contacts first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setMessages(mockMessages[contact.id] || [])

    // Mark as read
    if (contact.unreadCount > 0) {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c)))
    }
  }

  const handleSendMessage = async (
    type = "text",
    content?: string,
    attachments?: any[],
    location?: any,
    contact?: any,
  ) => {
    const messageContent = content || messageInput
    if (!messageContent.trim() && !attachments && !location && !contact) return
    if (!selectedContact) return

    // Determine sender based on conversation mode
    let senderType: "user" | "ai_agent" | "human_agent" = "user"
    let senderName = "Admin"
    let senderId = "admin"

    if (conversationMode.type === "ai" || (conversationMode.type === "hybrid" && conversationMode.aiEnabled)) {
      // Simulate AI response for certain keywords
      if (messageContent.toLowerCase().includes("problème") || messageContent.toLowerCase().includes("aide")) {
        senderType = "ai_agent"
        senderName = "Assistant IA Djobea"
        senderId = "ai_agent_1"
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      senderType,
      content: messageContent,
      timestamp: new Date().toISOString(),
      type,
      status: "sent",
      attachments,
      location,
      contact,
      metadata:
        senderType === "ai_agent"
          ? {
              agentId: "ai_agent_1",
              confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
              processingTime: Math.random() * 2 + 0.5, // 0.5-2.5s
            }
          : undefined,
    }

    setMessages((prev) => [...prev, newMessage])
    setMessageInput("")

    // Simulate message delivery and read status
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "read" } : msg)))
    }, 3000)

    // Simulate AI or human response
    if (senderType === "user" && conversationMode.aiEnabled) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          senderId: "ai_agent_1",
          senderName: "Assistant IA Djobea",
          senderType: "ai_agent",
          content: getAIResponse(messageContent),
          timestamp: new Date().toISOString(),
          type: "text",
          status: "sent",
          metadata: {
            agentId: "ai_agent_1",
            confidence: Math.random() * 0.3 + 0.7,
            processingTime: Math.random() * 2 + 1,
          },
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 2000)
    }

    toast({
      title: "Message envoyé",
      description: `Message envoyé à ${selectedContact.name}`,
    })
  }

  const getAIResponse = (userInput: string): string => {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const attachments = [
      {
        type: file.type.startsWith("image/") ? "image" : "file",
        url: URL.createObjectURL(file),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      },
    ]

    handleSendMessage(file.type.startsWith("image/") ? "image" : "file", `Fichier partagé: ${file.name}`, attachments)
  }

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Position actuelle",
          }
          handleSendMessage("location", "", undefined, location)
        },
        (error) => {
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible d'obtenir votre position",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      })
    }
  }

  const handleContactShare = () => {
    if (!selectedContact) return

    const contactData = {
      name: selectedContact.name,
      phone: selectedContact.phone || "",
      email: selectedContact.email || "",
      avatar: selectedContact.avatar,
    }

    handleSendMessage("contact", "", undefined, undefined, contactData)
  }

  const handleEmojiSelect = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleContactAction = (contactId: string, action: string) => {
    setContacts((prev) =>
      prev.map((contact) => {
        if (contact.id !== contactId) return contact

        switch (action) {
          case "pin":
            return { ...contact, isPinned: !contact.isPinned }
          case "mute":
            return { ...contact, isMuted: !contact.isMuted }
          case "mark_read":
            return { ...contact, unreadCount: 0 }
          case "archive":
            return contact
          case "delete":
            return contact
          default:
            return contact
        }
      }),
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
      description: actionMessages[action as keyof typeof actionMessages],
    })
  }

  const toggleConversationMode = () => {
    setConversationMode((prev) => ({
      ...prev,
      aiEnabled: !prev.aiEnabled,
    }))

    toast({
      title: conversationMode.aiEnabled ? "Mode humain activé" : "Mode IA activé",
      description: conversationMode.aiEnabled
        ? "Les messages seront traités par un agent humain"
        : "Les messages seront traités par l'IA",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "client":
        return "bg-blue-500"
      case "provider":
        return "bg-green-500"
      case "admin":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return "✓"
      case "delivered":
        return "✓✓"
      case "read":
        return "✓✓"
      default:
        return ""
    }
  }

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case "ai_agent":
        return <Bot className="h-4 w-4 text-blue-400" />
      case "human_agent":
        return <User className="h-4 w-4 text-green-400" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getSenderBadge = (senderType: string) => {
    switch (senderType) {
      case "ai_agent":
        return (
          <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
            IA
          </Badge>
        )
      case "human_agent":
        return (
          <Badge variant="secondary" className="text-xs bg-green-500 text-white">
            Humain
          </Badge>
        )
      default:
        return null
    }
  }

  const totalUnread = contacts.reduce((sum, contact) => sum + contact.unreadCount, 0)

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case "image":
        return (
          <div className="space-y-2">
            {message.attachments?.[0] && (
              <div className="relative group">
                <img
                  src={message.attachments[0].url || "/placeholder.svg"}
                  alt={message.attachments[0].name}
                  className="rounded-lg max-w-full h-auto max-h-64 cursor-pointer"
                  onClick={() => window.open(message.attachments?.[0].url, "_blank")}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        )

      case "file":
        return (
          <div className="space-y-2">
            {message.attachments?.[0] && (
              <div className="flex items-center space-x-3 p-3 bg-gray-600 rounded-lg">
                <FileText className="h-8 w-8 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{message.attachments[0].name}</p>
                  <p className="text-xs text-gray-400">{message.attachments[0].size}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        )

      case "location":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-3 bg-gray-600 rounded-lg">
              <MapPin className="h-6 w-6 text-red-400" />
              <div>
                <p className="text-sm font-medium">Position partagée</p>
                <p className="text-xs text-gray-400">{message.location?.address}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              Voir sur la carte
            </Button>
          </div>
        )

      case "contact":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-gray-600 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={message.contact?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {message.contact?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{message.contact?.name}</p>
                <p className="text-xs text-gray-400">{message.contact?.phone}</p>
                {message.contact?.email && <p className="text-xs text-gray-400">{message.contact.email}</p>}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                <Phone className="h-4 w-4 mr-1" />
                Appeler
              </Button>
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        )

      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Contacts Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                  {totalUnread > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {totalUnread}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                  <TabsTrigger value="all" className="text-xs">
                    Tous
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="text-xs">
                    Clients
                  </TabsTrigger>
                  <TabsTrigger value="providers" className="text-xs">
                    Prestataires
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Non lus
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-1 p-4">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors group",
                        selectedContact?.id === contact.id ? "bg-blue-600" : "hover:bg-gray-700",
                      )}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-800",
                            getStatusColor(contact.status),
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-white truncate">{contact.name}</p>
                            {contact.isPinned && <Pin className="h-3 w-3 text-yellow-400" />}
                            {contact.isMuted && <VolumeX className="h-3 w-3 text-gray-400" />}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="secondary" className={cn("text-xs", getRoleColor(contact.role))}>
                              {contact.role}
                            </Badge>
                            {contact.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{contact.lastMessage}</p>
                        <p className="text-xs text-gray-500">{contact.lastMessageTime}</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleContactAction(contact.id, "pin")}>
                            <Pin className="h-4 w-4 mr-2" />
                            {contact.isPinned ? "Désépingler" : "Épingler"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleContactAction(contact.id, "mute")}>
                            <VolumeX className="h-4 w-4 mr-2" />
                            {contact.isMuted ? "Réactiver" : "Couper le son"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleContactAction(contact.id, "mark_read")}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Marquer comme lu
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleContactAction(contact.id, "archive")}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archiver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleContactAction(contact.id, "delete")}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <Card className="h-full bg-gray-800 border-gray-700 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
                        <AvatarFallback>
                          {selectedContact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-800",
                          getStatusColor(selectedContact.status),
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{selectedContact.name}</h3>
                      <p className="text-sm text-gray-400">
                        {selectedContact.status === "online"
                          ? "En ligne"
                          : selectedContact.status === "away"
                            ? "Absent"
                            : "Hors ligne"}
                        {isTyping && selectedContact.status === "online" && " • En train d'écrire..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Conversation Mode Toggle */}
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-1">
                        {conversationMode.aiEnabled ? (
                          <Bot className="h-4 w-4 text-blue-400" />
                        ) : (
                          <User className="h-4 w-4 text-green-400" />
                        )}
                        <span className="text-xs text-gray-300">{conversationMode.aiEnabled ? "IA" : "Humain"}</span>
                      </div>
                      <Switch checked={conversationMode.aiEnabled} onCheckedChange={toggleConversationMode} size="sm" />
                    </div>

                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Paramètres de conversation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archiver la conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer la conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-20rem)] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex", message.senderType === "user" ? "justify-end" : "justify-start")}
                      >
                        <div className="flex items-start space-x-2 max-w-[80%]">
                          {message.senderType !== "user" && (
                            <div className="flex flex-col items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>{getSenderIcon(message.senderType)}</AvatarFallback>
                              </Avatar>
                              {getSenderBadge(message.senderType)}
                            </div>
                          )}

                          <div
                            className={cn(
                              "rounded-lg p-3",
                              message.senderType === "user"
                                ? "bg-blue-600 text-white"
                                : message.type === "system"
                                  ? "bg-gray-700 text-gray-300 text-center"
                                  : "bg-gray-700 text-white",
                            )}
                          >
                            {message.senderType !== "user" && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-300">{message.senderName}</span>
                                {message.metadata?.confidence && (
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(message.metadata.confidence * 100)}%
                                  </Badge>
                                )}
                              </div>
                            )}

                            {renderMessageContent(message)}

                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {message.senderType === "user" && (
                                <span className={cn(message.status === "read" ? "text-blue-300" : "text-gray-300")}>
                                  {getMessageStatusIcon(message.status)}
                                </span>
                              )}
                              {message.metadata?.processingTime && (
                                <span className="text-xs text-gray-400">
                                  {message.metadata.processingTime.toFixed(1)}s
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  {/* File Upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Photo/Fichier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLocationShare}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Position
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleContactShare}>
                        <Users className="h-4 w-4 mr-2" />
                        Contact
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex-1 relative">
                    <Input
                      placeholder="Tapez votre message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="bg-gray-700 border-gray-600 text-white pr-20"
                    />

                    {/* Emoji Picker */}
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-12 top-1/2 transform -translate-y-1/2"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <EmojiPicker onEmojiClick={handleEmojiSelect} theme="dark" width={300} height={400} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!messageInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Agent Status */}
                {conversationMode.humanAgent && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          conversationMode.aiEnabled ? "bg-blue-400" : "bg-green-400",
                        )}
                      />
                      <span>
                        {conversationMode.aiEnabled
                          ? "Assistant IA actif"
                          : `${conversationMode.humanAgent.name} en ligne`}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={toggleConversationMode} className="h-6 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Changer de mode
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full bg-gray-800 border-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

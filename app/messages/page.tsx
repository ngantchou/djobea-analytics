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
import { apiClient } from "@/lib/api-client"

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
  is_escalated?: boolean
  metadata?: any
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

// Empty initial state - all data comes from API

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load conversations from API with retry mechanism
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await apiClient.getConversations({
          page: 1,
          limit: 50,
          status: activeTab === "all" ? undefined : activeTab,
          search: searchQuery || undefined
        })
        
        if (result.success) {
          const conversations = result.data.conversations || []
          setContacts(conversations.map(conv => ({
            id: conv.id,
            name: conv.name,
            avatar: conv.avatar,
            role: conv.role,
            status: conv.status,
            lastMessage: conv.lastMessage,
            lastMessageTime: conv.time_relative,
            unreadCount: conv.unreadCount,
            isPinned: conv.isPinned,
            isMuted: conv.isMuted,
            phone: conv.phone,
            email: conv.email || "",
            is_escalated: conv.is_escalated,
            metadata: conv.metadata
          })))
          
          // Auto-select first conversation if none selected
          if (!selectedContact && conversations.length > 0) {
            const firstContact = conversations[0]
            setSelectedContact({
              id: firstContact.id,
              name: firstContact.name,
              avatar: firstContact.avatar,
              role: firstContact.role,
              status: firstContact.status,
              lastMessage: firstContact.lastMessage,
              lastMessageTime: firstContact.time_relative,
              unreadCount: firstContact.unreadCount,
              isPinned: firstContact.isPinned,
              isMuted: firstContact.isMuted,
              phone: firstContact.phone,
              email: firstContact.email || "",
              is_escalated: firstContact.is_escalated,
              metadata: firstContact.metadata
            })
            
            // Set conversation mode based on escalation status
            setConversationMode(prev => ({
              ...prev,
              aiEnabled: !firstContact.is_escalated
            }))
          }
          
          // Reset retry attempts on success
          setRetryAttempts(0)
        } else {
          throw new Error(result.error || "Failed to load conversations")
        }
      } catch (error) {
        console.error('Failed to load conversations:', error)
        const errorMessage = error instanceof Error ? error.message : "Erreur de connexion"
        setError(errorMessage)
        
        toast({
          title: "Erreur",
          description: `Impossible de charger les conversations: ${errorMessage}`,
          variant: "destructive",
          action: retryAttempts < 3 ? {
            label: "Réessayer",
            onClick: () => {
              setRetryAttempts(prev => prev + 1)
              loadConversations()
            }
          } : undefined
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadConversations()
  }, [activeTab, searchQuery, retryAttempts])

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

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact)
    
    try {
      // Load messages for the selected conversation
      const result = await apiClient.getConversationMessages(contact.id, {
        page: 1,
        limit: 50
      })
      
      if (result.success) {
        setMessages(result.data.messages || [])
      }
      
      // Set conversation mode based on escalation status
      setConversationMode(prev => ({
        ...prev,
        aiEnabled: !(contact as any).is_escalated
      }))
      
      // Mark as read
      if (contact.unreadCount > 0) {
        setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c)))
      }
    } catch (error) {
      console.error('Failed to load messages for conversation:', error)
      toast({
        title: "Erreur", 
        description: "Impossible de charger les messages",
        variant: "destructive"
      })
      // Fallback to empty messages
      setMessages([])
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

    try {
      setMessageInput("")
      
      // Send message through the API
      const senderType = conversationMode.aiEnabled ? "ai" : "admin"
      
      await apiClient.sendMessage({
        conversationId: selectedContact.id,
        content: messageContent,
        type,
        senderType,
        attachments,
        metadata: {
          location,
          contact,
          manual_send: true
        }
      })

      // Refresh messages to get the latest state
      if (selectedContact) {
        const messagesResult = await apiClient.getConversationMessages(selectedContact.id)
        if (messagesResult.success) {
          setMessages(messagesResult.data.messages || [])
        }
      }

      toast({
        title: "Message envoyé",
        description: conversationMode.aiEnabled 
          ? "L'IA va traiter votre message et répondre automatiquement"
          : `Message envoyé à ${selectedContact.name}`,
      })
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      })
      console.error('Failed to send message:', error)
      // Restore the message input on error
      setMessageInput(messageContent)
    }
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

  const toggleConversationMode = async () => {
    if (!selectedContact) return
    
    try {
      // Call the backend escalation API
      const action = conversationMode.aiEnabled ? 'escalate' : 'deescalate'
      const reason = conversationMode.aiEnabled 
        ? 'Manual escalation to human agent' 
        : 'Returning to AI agent'
        
      await apiClient.toggleEscalation(selectedContact.id, { action, reason })
      
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
      
      // Update contact to reflect escalation status
      setContacts((prev) => prev.map(contact => 
        contact.id === selectedContact.id 
          ? { ...contact, is_escalated: !conversationMode.aiEnabled }
          : contact
      ))
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le mode de conversation",
        variant: "destructive"
      })
      console.error('Failed to toggle conversation mode:', error)
    }
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
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-400 mt-4">Chargement des conversations...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-400 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">Erreur de connexion</p>
                      <p className="text-sm text-gray-400 mb-4">{error}</p>
                      {retryAttempts < 3 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setRetryAttempts(prev => prev + 1)}
                          className="bg-transparent border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                        >
                          Réessayer
                        </Button>
                      )}
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune conversation trouvée</p>
                      {searchQuery && (
                        <p className="text-sm text-gray-500 mt-2">
                          Essayez de modifier votre recherche
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
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
                            {(contact as any).is_escalated && (
                              <User className="h-3 w-3 text-orange-400" title="Escaladé vers un agent humain" />
                            )}
                            {!(contact as any).is_escalated && (
                              <Bot className="h-3 w-3 text-blue-400" title="Géré par l'IA" />
                            )}
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
                    ))
                  )}
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

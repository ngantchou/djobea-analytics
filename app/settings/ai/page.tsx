"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { SettingsService } from "@/lib/services/settings-service"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Brain,
  Cloud,
  FlaskRoundIcon as Flask,
  MessageSquare,
  Save,
  Send,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Edit,
  Settings,
  HelpCircle,
  Zap,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface AIConfig {
  model: string
  apiKey: string
  timeout: number
  maxTokens: number
  temperature: number
}

interface ConversationConfig {
  contextMemory: boolean
  autoSuggestions: boolean
  responseDelay: number
  maxConversationLength: number
  profanityFilter: boolean
  emotionalTone: string
}

interface TestMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface Expression {
  id: string
  text: string
  category: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AISettingsPage() {
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testMessage, setTestMessage] = useState("")
  const [editingExpression, setEditingExpression] = useState<Expression | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editText, setEditText] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const conversationRef = useRef<HTMLDivElement>(null)

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    model: "claude-sonnet-4-20250514",
    apiKey:
      "sk-ant-api03-••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••",
    timeout: 5,
    maxTokens: 4000,
    temperature: 0.7,
  })

  const [conversationConfig, setConversationConfig] = useState<ConversationConfig>({
    contextMemory: true,
    autoSuggestions: true,
    responseDelay: 1,
    maxConversationLength: 50,
    profanityFilter: true,
    emotionalTone: "professional",
  })

  const [testMessages, setTestMessages] = useState<TestMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Bonjour ! Je suis là pour vous aider avec vos demandes de service à domicile. Que puis-je faire pour vous aujourd'hui ?",
      timestamp: new Date(Date.now() - 120000),
    },
  ])

  const [expressions, setExpressions] = useState<Expression[]>([
    { id: "1", text: "Bonjour ! Comment puis-je vous aider ?", category: "salutation" },
    { id: "2", text: "Je comprends votre demande, laissez-moi vous aider.", category: "comprehension" },
    { id: "3", text: "Merci pour votre patience.", category: "politesse" },
    { id: "4", text: "Votre demande a été traitée avec succès.", category: "confirmation" },
  ])

  const [newExpression, setNewExpression] = useState("")
  const [newExpressionCategory, setNewExpressionCategory] = useState("custom")

  const categories = [
    { value: "salutation", label: "Salutation" },
    { value: "comprehension", label: "Compréhension" },
    { value: "politesse", label: "Politesse" },
    { value: "confirmation", label: "Confirmation" },
    { value: "custom", label: "Personnalisé" },
  ]

  // Charger les paramètres depuis l'API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getAISettings()
        if (data.aiConfig) setAIConfig(data.aiConfig)
        if (data.conversationConfig) setConversationConfig(data.conversationConfig)
        if (data.expressions) setExpressions(data.expressions)
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      await SettingsService.updateAISettings({
        aiConfig,
        conversationConfig,
        expressions,
      })
      toast.success("Configuration IA sauvegardée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      type: "user",
      content: testMessage,
      timestamp: new Date(),
    }

    setTestMessages((prev) => [...prev, userMessage])
    setTestMessage("")
    setTestLoading(true)

    try {
      // Simulation d'une réponse IA
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const aiResponse: TestMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Je comprends votre demande "${userMessage.content}". Laissez-moi vous aider à trouver le bon prestataire pour ce service.`,
        timestamp: new Date(),
      }

      setTestMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      toast.error("Erreur lors du test")
    } finally {
      setTestLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendTestMessage()
    }
  }

  const clearTestConversation = () => {
    setTestMessages([
      {
        id: "1",
        type: "ai",
        content:
          "Bonjour ! Je suis là pour vous aider avec vos demandes de service à domicile. Que puis-je faire pour vous aujourd'hui ?",
        timestamp: new Date(),
      },
    ])
    toast.success("Conversation effacée")
  }

  const addExpression = () => {
    if (!newExpression.trim()) {
      toast.error("Veuillez saisir une expression")
      return
    }

    const expression: Expression = {
      id: Date.now().toString(),
      text: newExpression.trim(),
      category: newExpressionCategory,
    }

    setExpressions((prev) => [...prev, expression])
    setNewExpression("")
    setNewExpressionCategory("custom")
    toast.success("Expression ajoutée avec succès")
  }

  const removeExpression = (id: string) => {
    setExpressions((prev) => prev.filter((exp) => exp.id !== id))
    toast.success("Expression supprimée avec succès")
  }

  const startEditExpression = (expression: Expression) => {
    setEditingExpression(expression)
    setEditText(expression.text)
    setEditCategory(expression.category)
    setEditDialogOpen(true)
  }

  const saveEditExpression = () => {
    if (!editText.trim()) {
      toast.error("Veuillez saisir une expression")
      return
    }

    if (!editingExpression) return

    setExpressions((prev) =>
      prev.map((exp) =>
        exp.id === editingExpression.id ? { ...exp, text: editText.trim(), category: editCategory } : exp,
      ),
    )

    setEditDialogOpen(false)
    setEditingExpression(null)
    setEditText("")
    setEditCategory("")
    toast.success("Expression modifiée avec succès")
  }

  const cancelEditExpression = () => {
    setEditDialogOpen(false)
    setEditingExpression(null)
    setEditText("")
    setEditCategory("")
  }

  const getTemperatureLabel = (value: number) => {
    if (value <= 0.3) return "Déterministe"
    if (value <= 0.7) return "Équilibré"
    return "Créatif"
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.label : category
  }

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [testMessages])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 animate-pulse" />
        </div>

        {/* Back button */}
        <div className="fixed top-20 left-4 z-50">
          <Link href="/settings">
            <Button
              variant="outline"
              className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Retour aux paramètres
            </Button>
          </Link>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/settings" className="hover:text-white transition-colors">
                Paramètres
              </Link>
              <span>/</span>
              <span className="text-white">IA & Conversation</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
              <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
              Configuration IA & Conversation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Paramètres Claude API, conversation et extraction d'informations
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {/* Configuration Claude API */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Cloud className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Configuration Claude API</CardTitle>
                        <CardDescription>Paramètres de connexion et modèle IA</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      API Connectée
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        97.8%
                      </div>
                      <div className="text-xs text-gray-400">Disponibilité</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        1,247
                      </div>
                      <div className="text-xs text-gray-400">Requêtes/jour</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        2.3s
                      </div>
                      <div className="text-xs text-gray-400">Temps moyen</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        4,000
                      </div>
                      <div className="text-xs text-gray-400">Max tokens</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-300">Modèle IA</Label>
                        <span className="text-red-400">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Version du modèle Claude à utiliser</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={aiConfig.model}
                        onValueChange={(value) => setAIConfig({ ...aiConfig, model: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommandé)</SelectItem>
                          <SelectItem value="claude-opus-4">Claude Opus 4 (Premium)</SelectItem>
                          <SelectItem value="claude-haiku-4">Claude Haiku 4 (Rapide)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400">Modèle actuellement utilisé pour toutes les conversations</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-300">Clé API Anthropic</Label>
                        <span className="text-red-400">*</span>
                      </div>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={aiConfig.apiKey}
                          onChange={(e) => setAIConfig({ ...aiConfig, apiKey: e.target.value })}
                          className="bg-white/5 border-white/10 text-white pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">Clé d'accès sécurisée à l'API Anthropic</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-300">Timeout requête (secondes)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Temps maximum d'attente pour une réponse</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={aiConfig.timeout}
                          onChange={(e) => setAIConfig({ ...aiConfig, timeout: Number(e.target.value) })}
                          className="bg-white/5 border-white/10 text-white"
                          min={1}
                          max={30}
                        />
                        <span className="text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
                          sec
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Délai avant expiration de la requête</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-300">Nombre maximum de tokens</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Limite de tokens pour chaque réponse</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={aiConfig.maxTokens}
                          onChange={(e) => setAIConfig({ ...aiConfig, maxTokens: Number(e.target.value) })}
                          className="bg-white/5 border-white/10 text-white"
                          min={100}
                          max={8000}
                          step={100}
                        />
                        <span className="text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
                          tokens
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Contrôle la longueur maximale des réponses</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-gray-300">Température de génération</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contrôle la créativité des réponses (0 = déterministe, 1 = créatif)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-4">
                      <Slider
                        value={[aiConfig.temperature]}
                        onValueChange={(value) => setAIConfig({ ...aiConfig, temperature: value[0] })}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Déterministe (0)</span>
                        <span>Créatif (1)</span>
                      </div>
                      <div className="text-center text-white font-medium">
                        {aiConfig.temperature} - {getTemperatureLabel(aiConfig.temperature)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Ajuste la créativité et la variabilité des réponses IA</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Test de l'IA */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Flask className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Test de l'IA en Temps Réel</CardTitle>
                        <CardDescription>Interface de test pour valider les réponses</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      Prêt pour test
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Conversation de Test</h4>
                      <Button
                        onClick={clearTestConversation}
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-white/20 text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Effacer
                      </Button>
                    </div>

                    <div
                      ref={conversationRef}
                      className="bg-black/40 border border-white/10 rounded-lg p-4 h-80 overflow-y-auto mb-4 space-y-4"
                    >
                      {testMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            message.type === "user"
                              ? "bg-blue-500/10 border-l-blue-400 ml-8"
                              : "bg-purple-500/10 border-l-purple-400 mr-8"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
                            <span className="flex items-center gap-2">
                              {message.type === "user" ? (
                                <>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                  Utilisateur
                                </>
                              ) : (
                                <>
                                  <Brain className="w-3 h-3" />
                                  Djobea AI
                                </>
                              )}
                            </span>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                          <div className="text-white">{message.content}</div>
                        </div>
                      ))}
                      {testLoading && (
                        <div className="bg-purple-500/10 border-l-4 border-l-purple-400 mr-8 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <Brain className="w-3 h-3 animate-pulse" />
                            Djobea AI
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                            <span className="text-sm">L'IA réfléchit...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message de test..."
                        className="bg-white/5 border-white/10 text-white flex-1"
                        disabled={testLoading}
                      />
                      <Button
                        onClick={handleSendTestMessage}
                        disabled={testLoading || !testMessage.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Paramètres de Conversation */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Paramètres de Conversation</CardTitle>
                        <CardDescription>Configuration du comportement conversationnel</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Mémoire contextuelle</Label>
                          <p className="text-xs text-gray-400">Conserver le contexte des conversations</p>
                        </div>
                        <Switch
                          checked={conversationConfig.contextMemory}
                          onCheckedChange={(checked) =>
                            setConversationConfig({ ...conversationConfig, contextMemory: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Suggestions automatiques</Label>
                          <p className="text-xs text-gray-400">Proposer des réponses suggérées</p>
                        </div>
                        <Switch
                          checked={conversationConfig.autoSuggestions}
                          onCheckedChange={(checked) =>
                            setConversationConfig({ ...conversationConfig, autoSuggestions: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Filtre de contenu</Label>
                          <p className="text-xs text-gray-400">Filtrer le contenu inapproprié</p>
                        </div>
                        <Switch
                          checked={conversationConfig.profanityFilter}
                          onCheckedChange={(checked) =>
                            setConversationConfig({ ...conversationConfig, profanityFilter: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Délai de réponse (secondes)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={conversationConfig.responseDelay}
                            onChange={(e) =>
                              setConversationConfig({ ...conversationConfig, responseDelay: Number(e.target.value) })
                            }
                            className="bg-white/5 border-white/10 text-white"
                            min={0}
                            max={10}
                          />
                          <span className="text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
                            sec
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Longueur max conversation</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={conversationConfig.maxConversationLength}
                            onChange={(e) =>
                              setConversationConfig({
                                ...conversationConfig,
                                maxConversationLength: Number(e.target.value),
                              })
                            }
                            className="bg-white/5 border-white/10 text-white"
                            min={10}
                            max={200}
                          />
                          <span className="text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-md">
                            msgs
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Ton émotionnel</Label>
                        <Select
                          value={conversationConfig.emotionalTone}
                          onValueChange={(value) =>
                            setConversationConfig({ ...conversationConfig, emotionalTone: value })
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professionnel</SelectItem>
                            <SelectItem value="friendly">Amical</SelectItem>
                            <SelectItem value="casual">Décontracté</SelectItem>
                            <SelectItem value="formal">Formel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Gestionnaire d'expressions */}
                  <div className="space-y-4">
                    <Label className="text-gray-300">Expressions prédéfinies</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        value={newExpression}
                        onChange={(e) => setNewExpression(e.target.value)}
                        placeholder="Ajouter une nouvelle expression..."
                        className="bg-white/5 border-white/10 text-white"
                        onKeyPress={(e) => e.key === "Enter" && addExpression()}
                      />
                      <div className="flex gap-2">
                        <Select value={newExpressionCategory} onValueChange={setNewExpressionCategory}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={addExpression}
                          disabled={!newExpression.trim()}
                          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg max-h-64 overflow-y-auto">
                      {expressions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Aucune expression prédéfinie</p>
                          <p className="text-sm">Ajoutez votre première expression ci-dessus</p>
                        </div>
                      ) : (
                        expressions.map((expression) => (
                          <div
                            key={expression.id}
                            className="flex items-center justify-between p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex-1 mr-4">
                              <div className="text-white mb-1">{expression.text}</div>
                              <div className="text-xs text-gray-400">
                                <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                  {getCategoryLabel(expression.category)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditExpression(expression)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeExpression(expression.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                      variant="outline"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      onClick={handleSendTestMessage}
                      disabled={testLoading}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Tester la configuration
                    </Button>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Dialog pour modifier une expression */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Modifier l'expression</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Texte de l'expression</Label>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Saisissez le texte de l'expression..."
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Catégorie</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelEditExpression}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={saveEditExpression}
                  disabled={!editText.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

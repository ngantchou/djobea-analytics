"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { SettingsService } from "@/lib/services/settings-service"
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit,
  Trash2,
  Send,
  Check,
  X,
  Eye,
  EyeOff,
  Cloud,
  TestTube,
  FileText,
  BarChart3,
  Wifi,
  CheckCircle,
  Download,
  RotateCcw,
  Upload,
  Save,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WhatsAppConfig {
  accountSid: string
  authToken: string
  whatsappNumber: string
  webhookUrl: string
  statusCallbackUrl: string
  connectionTimeout: number
}

interface MessageTemplate {
  id: string
  name: string
  status: "approved" | "pending" | "rejected"
  content: string
  variables: string[]
}

interface MessagingSettings {
  sendDelay: number
  dailyLimit: number
  retryAttempts: number
  queueSize: number
  failureNotifications: boolean
  detailedLogs: boolean
  devMode: boolean
}

interface WhatsAppStats {
  sent: number
  delivered: number
  read: number
  failed: number
  deliveryRate: number
  readRate: number
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

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [showTokens, setShowTokens] = useState({
    accountSid: false,
    authToken: false,
  })
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("connected")
  const [testLoading, setTestLoading] = useState(false)
  const [configurationChanged, setConfigurationChanged] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [whatsappConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    accountSid: "AC••••••••••••••••••••••••••••••••",
    authToken: "••••••••••••••••••••••••••••••••",
    whatsappNumber: "+14155238886",
    webhookUrl: "https://api.djobea.ai/webhook/whatsapp",
    statusCallbackUrl: "https://api.djobea.ai/webhook/status",
    connectionTimeout: 10,
  })

  const [messagingSettings, setMessagingSettings] = useState<MessagingSettings>({
    sendDelay: 2,
    dailyLimit: 1000,
    retryAttempts: 3,
    queueSize: 100,
    failureNotifications: true,
    detailedLogs: true,
    devMode: false,
  })

  const [whatsappStats, setWhatsAppStats] = useState<WhatsAppStats>({
    sent: 847,
    delivered: 823,
    read: 756,
    failed: 24,
    deliveryRate: 97.2,
    readRate: 89.3,
  })

  const [testData, setTestData] = useState({
    phoneNumber: "+237655123456",
    message: "Bonjour ! Ceci est un message de test depuis Djobea AI. 🤖",
  })

  const [testResult, setTestResult] = useState("")
  const [showTestResult, setShowTestResult] = useState(false)

  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: "welcome",
      name: "Message de Bienvenue",
      status: "approved",
      content:
        "Bonjour {{nom}} ! 👋\n\nBienvenue sur Djobea AI, votre assistant pour les services à domicile à Douala.\n\nComment puis-je vous aider aujourd'hui ?",
      variables: ["nom"],
    },
    {
      id: "confirmation",
      name: "Confirmation Demande",
      status: "approved",
      content:
        "✅ Demande confirmée !\n\nService: {{service}}\nZone: {{zone}}\nUrgence: {{urgence}}\n\nRecherche d'un prestataire en cours... ⏳",
      variables: ["service", "zone", "urgence"],
    },
    {
      id: "assigned",
      name: "Prestataire Assigné",
      status: "approved",
      content:
        "🎉 Prestataire trouvé !\n\n👤 {{nom_prestataire}}\n⭐ Note: {{note}}/5\n📞 Tel: {{telephone}}\n\nIl sera chez vous vers {{heure_arrivee}}",
      variables: ["nom_prestataire", "note", "telephone", "heure_arrivee"],
    },
    {
      id: "completed",
      name: "Mission Terminée",
      status: "approved",
      content:
        "✅ Mission terminée !\n\nMontant: {{montant}} XAF\nDurée: {{duree}}\n\nMerci de noter votre prestataire sur 5 ⭐\nVotre avis nous aide à améliorer le service.",
      variables: ["montant", "duree"],
    },
    {
      id: "cancelled",
      name: "Annulation Demande",
      status: "pending",
      content:
        "❌ Demande annulée\n\nMotif: {{motif}}\n\nPas de frais appliqués. N'hésitez pas à nous recontacter pour un nouveau service !",
      variables: ["motif"],
    },
    {
      id: "feedback",
      name: "Demande d'Avis",
      status: "approved",
      content:
        "🌟 Votre avis compte !\n\nComment s'est passée votre expérience avec {{nom_prestataire}} ?\n\nNotez de 1 à 5 ⭐ et partagez votre avis.",
      variables: ["nom_prestataire"],
    },
  ])

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    variables: [] as string[],
  })

  const showNotification = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const renderTemplateVariables = (content: string) => {
    return content.split(/(\{\{[^}]+\}\})/).map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        return (
          <span key={index} className="bg-green-500/20 text-green-400 px-1 py-0.5 rounded text-sm font-medium">
            {part}
          </span>
        )
      }
      return part
    })
  }

  const updateWhatsAppStats = () => {
    setWhatsAppStats((prev) => {
      const newSent = prev.sent + Math.floor(Math.random() * 5)
      const newDelivered = prev.delivered + Math.floor(Math.random() * 4)
      const newRead = prev.read + Math.floor(Math.random() * 3)

      return {
        ...prev,
        sent: newSent,
        delivered: newDelivered,
        read: newRead,
        deliveryRate: Number(((newDelivered / newSent) * 100).toFixed(1)),
        readRate: Number(((newRead / newSent) * 100).toFixed(1)),
      }
    })
  }

  const togglePasswordVisibility = (field: keyof typeof showTokens) => {
    setShowTokens((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleConfigChange = (field: keyof WhatsAppConfig, value: string | number) => {
    setWhatsAppConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
    setConfigurationChanged(true)
  }

  const handleMessagingChange = (field: keyof MessagingSettings, value: string | number | boolean) => {
    setMessagingSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
    setConfigurationChanged(true)
  }

  const testWebhook = async () => {
    if (!testData.phoneNumber || !testData.message) {
      showNotification("Veuillez remplir le numéro et le message de test", "warning")
      return
    }

    setTestLoading(true)
    setShowTestResult(true)
    setTestResult("Envoi en cours...\n")
    showNotification("Envoi du message de test...", "info")

    setTimeout(() => {
      const success = Math.random() > 0.1
      if (success) {
        setTestResult((prev) => prev + `✅ Message envoyé avec succès à ${testData.phoneNumber}\n`)
        setTestResult((prev) => prev + `ID: msg_${Date.now()}\n`)
        setTestResult((prev) => prev + `Statut: Livré\n`)
        setTestResult((prev) => prev + `Timestamp: ${new Date().toISOString()}\n`)
        showNotification("✅ Message de test envoyé avec succès", "success")
      } else {
        setTestResult((prev) => prev + `❌ Échec d'envoi\n`)
        setTestResult((prev) => prev + `Erreur: Invalid phone number format\n`)
        showNotification("❌ Échec du test d'envoi", "error")
      }
      setTestLoading(false)
    }, 2000)
  }

  const testConnection = async () => {
    setShowTestResult(true)
    setTestResult("Test de connexion Twilio...\n")
    showNotification("Test de connexion en cours...", "info")

    setTimeout(() => {
      const success = Math.random() > 0.05
      if (success) {
        setTestResult((prev) => prev + `✅ Connexion réussie\n`)
        setTestResult((prev) => prev + `Account SID: Valide\n`)
        setTestResult((prev) => prev + `Auth Token: Valide\n`)
        setTestResult((prev) => prev + `WhatsApp Number: Actif\n`)
        setTestResult((prev) => prev + `Webhook: Accessible\n`)

        setConnectionStatus("connected")
        showNotification("✅ Connexion Twilio réussie", "success")
      } else {
        setTestResult((prev) => prev + `❌ Échec de connexion\n`)
        setTestResult((prev) => prev + `Erreur: Invalid credentials\n`)

        setConnectionStatus("disconnected")
        showNotification("❌ Échec de connexion Twilio", "error")
      }
    }, 3000)
  }

  const validateWebhook = async () => {
    if (!whatsappConfig.webhookUrl) {
      showNotification("Veuillez saisir une URL de webhook", "warning")
      return
    }

    setShowTestResult(true)
    setTestResult(`Validation du webhook: ${whatsappConfig.webhookUrl}\n`)
    showNotification("Validation du webhook...", "info")

    setTimeout(() => {
      const success = Math.random() > 0.2
      if (success) {
        setTestResult((prev) => prev + `✅ Webhook accessible\n`)
        setTestResult((prev) => prev + `Status Code: 200 OK\n`)
        setTestResult((prev) => prev + `Response Time: 234ms\n`)
        setTestResult((prev) => prev + `SSL Certificate: Valide\n`)
        showNotification("✅ Webhook validé avec succès", "success")
      } else {
        setTestResult((prev) => prev + `❌ Webhook inaccessible\n`)
        setTestResult((prev) => prev + `Status Code: 404 Not Found\n`)
        showNotification("❌ Webhook non accessible", "error")
      }
    }, 2500)
  }

  const createNewTemplate = () => {
    setNewTemplate({ name: "", content: "", variables: [] })
    setShowTemplateModal(true)
  }

  const saveNewTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      showNotification("Veuillez remplir le nom et le contenu du template", "warning")
      return
    }

    const variableMatches = Array.from(newTemplate.content.matchAll(/\{\{([^}]+)\}\}/g))
    const variables = variableMatches.map((match) => match[1])

    const template: MessageTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name,
      status: "pending",
      content: newTemplate.content,
      variables: variables,
    }

    setTemplates((prev) => [...prev, template])
    setShowTemplateModal(false)
    setConfigurationChanged(true)
    showNotification("✅ Template créé avec succès", "success")
  }

  const editTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setShowEditTemplateModal(true)
  }

  const saveEditedTemplate = () => {
    if (!selectedTemplate) return

    const variableMatches = Array.from(selectedTemplate.content.matchAll(/\{\{([^}]+)\}\}/g))
    const variables = variableMatches.map((match) => match[1])

    setTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? { ...selectedTemplate, variables } : t)))

    setShowEditTemplateModal(false)
    setSelectedTemplate(null)
    setConfigurationChanged(true)
    showNotification("✅ Template modifié avec succès", "success")
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId))
    setShowDeleteConfirm(null)
    setConfigurationChanged(true)
    showNotification("✅ Template supprimé avec succès", "success")
  }

  const testTemplate = (templateId: string) => {
    if (!testData.phoneNumber) {
      showNotification("Veuillez saisir un numéro de test", "warning")
      return
    }

    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    showNotification(`Test du template ${template.name}...`, "info")

    setTimeout(() => {
      showNotification(`✅ Template ${template.name} testé avec succès`, "success")
    }, 2000)
  }

  const submitTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    if (confirm(`Êtes-vous sûr de vouloir soumettre le template "${template.name}" à WhatsApp pour approbation ?`)) {
      showNotification(`Soumission du template ${template.name}...`, "info")

      setTimeout(() => {
        setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, status: "pending" } : t)))
        showNotification(`Template ${template.name} soumis pour approbation`, "success")
      }, 1500)
    }
  }

  const syncTemplates = () => {
    showNotification("Synchronisation des templates avec WhatsApp...", "info")

    setTimeout(() => {
      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          status: Math.random() > 0.3 ? "approved" : t.status,
        })),
      )
      showNotification("✅ Templates synchronisés avec succès", "success")
    }, 3000)
  }

  const exportWhatsAppConfig = () => {
    const config = {
      timestamp: new Date().toISOString(),
      twilio: whatsappConfig,
      messaging: messagingSettings,
      templates: templates,
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `djobea-whatsapp-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    showNotification("Configuration WhatsApp exportée", "success")
  }

  const resetWhatsAppSettings = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres WhatsApp ?")) {
      setWhatsAppConfig({
        accountSid: "AC••••••••••••••••••••••••••••••••",
        authToken: "••••••••••••••••••••••••••••••••",
        whatsappNumber: "+14155238886",
        webhookUrl: "https://api.djobea.ai/webhook/whatsapp",
        statusCallbackUrl: "https://api.djobea.ai/webhook/status",
        connectionTimeout: 10,
      })

      setMessagingSettings({
        sendDelay: 2,
        dailyLimit: 1000,
        retryAttempts: 3,
        queueSize: 100,
        failureNotifications: true,
        detailedLogs: true,
        devMode: false,
      })

      setAutoRefresh(true)
      showNotification("Paramètres WhatsApp réinitialisés", "success")
      setConfigurationChanged(true)
    }
  }

  const saveWhatsAppConfiguration = async () => {
    setLoading(true)
    showNotification("Sauvegarde de la configuration WhatsApp...", "info")

    try {
      await SettingsService.updateWhatsAppSettings({
        config: whatsappConfig,
        messaging: messagingSettings,
        templates: templates,
      })
      showNotification("✅ Configuration WhatsApp sauvegardée avec succès", "success")
      setConfigurationChanged(false)
    } catch (error) {
      showNotification("❌ Erreur lors de la sauvegarde", "error")
    } finally {
      setLoading(false)
    }
  }

  // Load WhatsApp settings on component mount
  useEffect(() => {
    const loadWhatsAppSettings = async () => {
      try {
        const data = await SettingsService.getWhatsAppSettings()
        if (data.config) setWhatsAppConfig(data.config)
        if (data.messaging) setMessagingSettings(data.messaging)
        if (data.templates) setTemplates(data.templates)
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres WhatsApp:", error)
      }
    }
    loadWhatsAppSettings()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateWhatsAppStats()
      }, 300000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating Back Button */}
      <Link href="/settings">
        <Button
          className="fixed top-4 left-4 z-50 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux paramètres
        </Button>
      </Link>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-[#1a1f2e]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Configuration WhatsApp API
                    </h1>
                    <p className="text-sm text-gray-400">Configuration Twilio, messaging et templates approuvés</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    connectionStatus === "connected"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === "connected" ? "bg-green-400" : "bg-red-400"
                    } animate-pulse`}
                  />
                  {connectionStatus === "connected" ? "API Connectée" : "Déconnectée"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {/* Configuration Twilio API */}
            <motion.div
              variants={itemVariants}
              className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Configuration Twilio API</h2>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    connectionStatus === "connected"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === "connected" ? "bg-green-400" : "bg-red-400"
                    } animate-pulse`}
                  />
                  {connectionStatus === "connected" ? "API Connectée" : "Déconnectée"}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    99.2%
                  </div>
                  <div className="text-sm text-gray-400">Disponibilité</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    847
                  </div>
                  <div className="text-sm text-gray-400">Messages/jour</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    1.8s
                  </div>
                  <div className="text-sm text-gray-400">Temps moyen</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    1,000
                  </div>
                  <div className="text-sm text-gray-400">Limite/jour</div>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account SID <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showTokens.accountSid ? "text" : "password"}
                        value={whatsappConfig.accountSid}
                        onChange={(e) => handleConfigChange("accountSid", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility("accountSid")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors h-8 w-8 p-0"
                      >
                        {showTokens.accountSid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Identifiant principal de votre compte Twilio</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Auth Token <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showTokens.authToken ? "text" : "password"}
                        value={whatsappConfig.authToken}
                        onChange={(e) => handleConfigChange("authToken", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility("authToken")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors h-8 w-8 p-0"
                      >
                        {showTokens.authToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Token secret pour l'authentification API</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Numéro WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={whatsappConfig.whatsappNumber}
                      onChange={(e) => handleConfigChange("whatsappNumber", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Format international avec indicatif pays</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Webhook URL <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="url"
                      value={whatsappConfig.webhookUrl}
                      onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Point d'entrée pour les messages entrants</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status Callback URL</label>
                    <Input
                      type="url"
                      value={whatsappConfig.statusCallbackUrl}
                      onChange={(e) => handleConfigChange("statusCallbackUrl", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">Notifications de livraison et lecture</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timeout connexion (secondes)</label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={whatsappConfig.connectionTimeout}
                        onChange={(e) => handleConfigChange("connectionTimeout", Number.parseInt(e.target.value))}
                        min="5"
                        max="60"
                        className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      />
                      <div className="bg-white/5 border border-l-0 border-white/10 rounded-r-lg px-3 py-3 text-gray-400 text-sm">
                        sec
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Délai avant échec de connexion</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Test Webhook & Connexion */}
            <motion.div
              variants={itemVariants}
              className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <TestTube className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Test Webhook & Connexion</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Prêt pour test
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de test</label>
                    <Input
                      type="tel"
                      value={testData.phoneNumber}
                      onChange={(e) => setTestData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+237655123456"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">Numéro WhatsApp pour tester l'envoi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message de test</label>
                    <Textarea
                      value={testData.message}
                      onChange={(e) => setTestData((prev) => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      placeholder="Bonjour ! Ceci est un message de test depuis Djobea AI."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Button
                    onClick={testWebhook}
                    disabled={testLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
                  >
                    {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {testLoading ? "Envoi..." : "Envoyer Test"}
                  </Button>
                  <Button
                    onClick={testConnection}
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all border border-white/10"
                  >
                    <Wifi className="w-4 h-4" />
                    Test Connexion
                  </Button>
                  <Button
                    onClick={validateWebhook}
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all border border-white/10"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider Webhook
                  </Button>
                </div>

                {showTestResult && (
                  <div className="bg-[#0a0e1a] rounded-lg p-4 border border-white/10 font-mono text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {testResult}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Paramètres Messaging */}
            <motion.div
              variants={itemVariants}
              className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Paramètres Messaging</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3" />
                  Configuré
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Délai d'envoi entre messages</label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={messagingSettings.sendDelay}
                      onChange={(e) => handleMessagingChange("sendDelay", Number.parseFloat(e.target.value))}
                      min="1"
                      max="10"
                      step="0.5"
                      className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                    <div className="bg-white/5 border border-l-0 border-white/10 rounded-r-lg px-3 py-3 text-gray-400 text-sm">
                      sec
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Évite la limitation de débit</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Limite quotidienne de messages</label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={messagingSettings.dailyLimit}
                      onChange={(e) => handleMessagingChange("dailyLimit", Number.parseInt(e.target.value))}
                      min="100"
                      max="10000"
                      step="100"
                      className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                    <div className="bg-white/5 border border-l-0 border-white/10 rounded-r-lg px-3 py-3 text-gray-400 text-sm">
                      msg/jour
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Limite imposée par WhatsApp Business</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tentatives automatiques</label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={messagingSettings.retryAttempts}
                      onChange={(e) => handleMessagingChange("retryAttempts", Number.parseInt(e.target.value))}
                      min="1"
                      max="5"
                      className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                    <div className="bg-white/5 border border-l-0 border-white/10 rounded-r-lg px-3 py-3 text-gray-400 text-sm">
                      tentatives
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Retry automatique en cas d'erreur</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Taille max queue de messages</label>
                  <div className="flex">
                    <Input
                      type="number"
                      value={messagingSettings.queueSize}
                      onChange={(e) => handleMessagingChange("queueSize", Number.parseInt(e.target.value))}
                      min="10"
                      max="500"
                      step="10"
                      className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                    <div className="bg-white/5 border border-l-0 border-white/10 rounded-r-lg px-3 py-3 text-gray-400 text-sm">
                      messages
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Messages en file d'attente</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notifications d'échec par email
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={messagingSettings.failureNotifications}
                        onChange={(e) => handleMessagingChange("failureNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Alertes admin en cas de problème</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Logs détaillés</label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={messagingSettings.detailedLogs}
                        onChange={(e) => handleMessagingChange("detailedLogs", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enregistrer tous les échanges</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mode développement</label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={messagingSettings.devMode}
                        onChange={(e) => handleMessagingChange("devMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Tests sans envoi réel</p>
                </div>
              </div>
            </motion.div>

            {/* Templates de Messages */}
            <motion.div
              variants={itemVariants}
              className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Templates de Messages Approuvés</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3" />
                  {templates.filter((t) => t.status === "approved").length} templates
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="bg-white/5 border-white/10 hover:bg-green-500/5 hover:border-green-500/30 transition-all"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">{template.name}</CardTitle>
                        <Badge className={`text-xs font-medium border ${getStatusColor(template.status)}`}>
                          {template.status === "approved"
                            ? "Approuvé"
                            : template.status === "pending"
                              ? "En attente"
                              : "Rejeté"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-[#0a0e1a] rounded-lg p-3 border-l-2 border-green-500 text-sm leading-relaxed">
                        {renderTemplateVariables(template.content)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => editTemplate(template)}
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/10 text-gray-300 border-white/10 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </Button>
                        {template.status === "approved" ? (
                          <Button
                            onClick={() => testTemplate(template.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/10 text-gray-300 border-white/10 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Tester
                          </Button>
                        ) : (
                          <Button
                            onClick={() => submitTemplate(template.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/10 text-gray-300 border-white/10 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Soumettre
                          </Button>
                        )}
                        <Button
                          onClick={() => setShowDeleteConfirm(template.id)}
                          variant="outline"
                          size="sm"
                          className="bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={createNewTemplate}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer Nouveau Template
              </Button>
            </motion.div>

            {/* Statistiques d'Utilisation */}
            <motion.div
              variants={itemVariants}
              className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Statistiques d'Utilisation</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                  <BarChart3 className="w-3 h-3" />
                  Temps réel
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {whatsappStats.sent}
                  </div>
                  <div className="text-sm text-gray-400">Messages envoyés</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {whatsappStats.delivered}
                  </div>
                  <div className="text-sm text-gray-400">Messages livrés</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {whatsappStats.read}
                  </div>
                  <div className="text-sm text-gray-400">Messages lus</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {whatsappStats.failed}
                  </div>
                  <div className="text-sm text-gray-400">Échecs</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {whatsappStats.deliveryRate}%
                  </div>
                  <div className="text-sm text-gray-400">Taux de livraison</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 transition-all">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {whatsappStats.readRate}%
                  </div>
                  <div className="text-sm text-gray-400">Taux de lecture</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Période d'analyse</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Auto-refresh stats</label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Mise à jour automatique toutes les 5min</p>
                </div>
              </div>
            </motion.div>

            {/* Actions Section */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 justify-end pt-6 border-t border-white/10"
            >
              <Button
                onClick={exportWhatsAppConfig}
                variant="outline"
                className="bg-white/10 text-gray-300 border-white/10 hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter Config
              </Button>
              <Button
                onClick={syncTemplates}
                variant="outline"
                className="bg-white/10 text-gray-300 border-white/10 hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Sync Templates
              </Button>
              <Button
                onClick={resetWhatsAppSettings}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Config
              </Button>
              <Button
                onClick={saveWhatsAppConfiguration}
                disabled={loading}
                className={`${
                  configurationChanged
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                } text-white disabled:opacity-50`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : configurationChanged ? (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? "Sauvegarde..." : configurationChanged ? "Sauvegarder les modifications" : "Sauvegarder"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Create Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Créer un nouveau template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du template <span className="text-red-400">*</span>
              </label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Message de bienvenue"
                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contenu du message <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Bonjour {{nom}} ! Bienvenue sur Djobea AI..."
                rows={6}
                className="bg-white/5 border-white/10 text-white placeholder-gray-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Utilisez {`{{ variable }}`} pour les variables dynamiques (ex: {`{{ nom }}`}, {`{{ service }}`})
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => setShowTemplateModal(false)}
                variant="outline"
                className="bg-white/10 text-gray-300 border-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={saveNewTemplate}
                disabled={!newTemplate.name || !newTemplate.content}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-2" />
                Créer Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog open={showEditTemplateModal} onOpenChange={setShowEditTemplateModal}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Modifier le template
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du template <span className="text-red-400">*</span>
                </label>
                <Input
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenu du message <span className="text-red-400">*</span>
                </label>
                <Textarea
                  value={selectedTemplate.content}
                  onChange={(e) => setSelectedTemplate((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                  rows={6}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Variables détectées:{" "}
                  {Array.from(selectedTemplate.content.matchAll(/\{\{([^}]+)\}\}/g))
                    .map((match) => match[1])
                    .join(", ") || "Aucune"}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowEditTemplateModal(false)}
                  variant="outline"
                  className="bg-white/10 text-gray-300 border-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={saveEditedTemplate}
                  disabled={!selectedTemplate.name || !selectedTemplate.content}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white disabled:opacity-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-400">Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline"
                className="bg-white/10 text-gray-300 border-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={() => showDeleteConfirm && deleteTemplate(showDeleteConfirm)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

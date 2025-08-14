"use client"

import { useState, useEffect } from "react"
import { SettingsService } from "@/lib/services/settings-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Key,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  FileText,
  Save,
  RotateCcw,
  Download,
  Upload,
  TestTube,
  Plus,
  Trash2,
  Activity,
} from "lucide-react"

interface SecuritySettings {
  authentication: {
    jwtExpiration: number
    refreshTokenExpiration: number
    twoFactorRequired: boolean
    multipleSessionsAllowed: boolean
    loginAttemptLimit: number
    lockoutDuration: number
  }
  encryption: {
    databaseEncryption: string
    communicationProtocol: string
    passwordHashing: string
    hashRounds: number
    piiEncryption: boolean
    backupEncryption: boolean
  }
  ipWhitelist: {
    enabled: boolean
    addresses: string[]
  }
  audit: {
    logLevel: string
    logRetention: number
    securityLogRetention: number
    structuredLogging: boolean
    monitoringAlerts: boolean
  }
  compliance: {
    rgpdCompliant: boolean
    dataProtectionLaw: boolean
    rightToForgotten: boolean
    explicitConsent: boolean
  }
}

const defaultSettings: SecuritySettings = {
  authentication: {
    jwtExpiration: 24,
    refreshTokenExpiration: 30,
    twoFactorRequired: true,
    multipleSessionsAllowed: false,
    loginAttemptLimit: 5,
    lockoutDuration: 30,
  },
  encryption: {
    databaseEncryption: "AES-256",
    communicationProtocol: "TLS 1.3",
    passwordHashing: "bcrypt",
    hashRounds: 12,
    piiEncryption: true,
    backupEncryption: true,
  },
  ipWhitelist: {
    enabled: true,
    addresses: ["192.168.1.0/24", "10.0.0.0/8"],
  },
  audit: {
    logLevel: "INFO",
    logRetention: 90,
    securityLogRetention: 365,
    structuredLogging: true,
    monitoringAlerts: true,
  },
  compliance: {
    rgpdCompliant: true,
    dataProtectionLaw: true,
    rightToForgotten: true,
    explicitConsent: true,
  },
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [securityScore, setSecurityScore] = useState(85)
  const [newIpAddress, setNewIpAddress] = useState("")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [importConfig, setImportConfig] = useState("")
  const [testResults, setTestResults] = useState<any>(null)
  const [auditResults, setAuditResults] = useState<any>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info"
    message: string
    visible: boolean
  }>({ type: "info", message: "", visible: false })

  // Utility functions
  const showNotification = (type: "success" | "error" | "warning" | "info", message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), 4000)
  }

  const calculateSecurityScore = () => {
    let score = 0

    // Authentication score (30 points)
    if (settings.authentication.twoFactorRequired) score += 10
    if (!settings.authentication.multipleSessionsAllowed) score += 5
    if (settings.authentication.jwtExpiration <= 24) score += 5
    if (settings.authentication.loginAttemptLimit <= 5) score += 10

    // Encryption score (25 points)
    if (settings.encryption.databaseEncryption === "AES-256") score += 10
    if (settings.encryption.communicationProtocol === "TLS 1.3") score += 5
    if (settings.encryption.hashRounds >= 12) score += 5
    if (settings.encryption.piiEncryption) score += 5

    // IP Whitelist score (15 points)
    if (settings.ipWhitelist.enabled) score += 15

    // Audit score (15 points)
    if (settings.audit.structuredLogging) score += 5
    if (settings.audit.monitoringAlerts) score += 5
    if (settings.audit.securityLogRetention >= 365) score += 5

    // Compliance score (15 points)
    if (settings.compliance.rgpdCompliant) score += 5
    if (settings.compliance.rightToForgotten) score += 5
    if (settings.compliance.explicitConsent) score += 5

    setSecurityScore(score)
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Bon"
    return "À améliorer"
  }

  // Event handlers
  const handleSettingChange = (section: keyof SecuritySettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await SettingsService.updateSecuritySettings(settings)
      setHasChanges(false)
      showNotification("success", "Paramètres de sécurité sauvegardés avec succès")
      calculateSecurityScore()
    } catch (error) {
      console.error("Failed to save settings:", error)
      showNotification("error", "Erreur lors de la sauvegarde des paramètres")
    }
    setIsSaving(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    showNotification("info", "Paramètres réinitialisés aux valeurs par défaut")
    calculateSecurityScore()
  }

  const addIpAddress = () => {
    if (newIpAddress && !settings.ipWhitelist.addresses.includes(newIpAddress)) {
      const ipRegex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/

      if (ipRegex.test(newIpAddress)) {
        handleSettingChange("ipWhitelist", "addresses", [...settings.ipWhitelist.addresses, newIpAddress])
        setNewIpAddress("")
        showNotification("success", "Adresse IP ajoutée avec succès")
      } else {
        showNotification("error", "Format d'adresse IP invalide")
      }
    } else if (settings.ipWhitelist.addresses.includes(newIpAddress)) {
      showNotification("warning", "Cette adresse IP existe déjà")
    }
  }

  const removeIpAddress = (address: string) => {
    handleSettingChange(
      "ipWhitelist",
      "addresses",
      settings.ipWhitelist.addresses.filter((ip) => ip !== address),
    )
    showNotification("success", "Adresse IP supprimée")
  }

  const handleExportConfig = () => {
    const configData = JSON.stringify(settings, null, 2)
    const blob = new Blob([configData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-config-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification("success", "Configuration exportée avec succès")
    setShowExportDialog(false)
  }

  const handleImportConfig = () => {
    try {
      const parsedConfig = JSON.parse(importConfig)
      setSettings(parsedConfig)
      setHasChanges(true)
      setImportConfig("")
      setShowImportDialog(false)
      showNotification("success", "Configuration importée avec succès")
      calculateSecurityScore()
    } catch (error) {
      showNotification("error", "Format de configuration invalide")
    }
  }

  const runSecurityTest = async () => {
    setTestResults(null)
    try {
      // Simulation d'un test de sécurité
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResults = {
        authentication: {
          status: settings.authentication.twoFactorRequired ? "pass" : "warning",
          message: settings.authentication.twoFactorRequired ? "2FA activé" : "2FA recommandé",
        },
        encryption: {
          status: settings.encryption.databaseEncryption === "AES-256" ? "pass" : "fail",
          message: settings.encryption.databaseEncryption === "AES-256" ? "Chiffrement fort" : "Chiffrement faible",
        },
        network: {
          status: settings.ipWhitelist.enabled ? "pass" : "warning",
          message: settings.ipWhitelist.enabled ? "Whitelist IP active" : "Accès non restreint",
        },
        compliance: {
          status: settings.compliance.rgpdCompliant ? "pass" : "fail",
          message: settings.compliance.rgpdCompliant ? "Conforme RGPD" : "Non conforme RGPD",
        },
      }

      setTestResults(mockResults)
      showNotification("success", "Test de sécurité terminé")
    } catch (error) {
      showNotification("error", "Erreur lors du test de sécurité")
    }
  }

  const runFullAudit = async () => {
    setAuditResults(null)
    try {
      // Simulation d'un audit complet
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockAudit = {
        summary: {
          totalChecks: 25,
          passed: 20,
          warnings: 3,
          failed: 2,
        },
        details: [
          { category: "Authentication", status: "pass", details: "Configuration sécurisée" },
          { category: "Encryption", status: "pass", details: "Chiffrement AES-256 actif" },
          { category: "Network Security", status: "warning", details: "Whitelist IP partielle" },
          { category: "Data Protection", status: "pass", details: "Conformité RGPD respectée" },
          { category: "Audit Logs", status: "warning", details: "Rétention logs à optimiser" },
        ],
      }

      setAuditResults(mockAudit)
      showNotification("success", "Audit de sécurité terminé")
    } catch (error) {
      showNotification("error", "Erreur lors de l'audit")
    }
  }

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getSecuritySettings()
        setSettings(data.settings)
        setSecurityScore(data.securityScore)
      } catch (error) {
        console.error("Failed to load settings:", error)
        showNotification("error", "Erreur lors du chargement des paramètres")
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    calculateSecurityScore()
  }, [settings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Notification */}
        {notification.visible && (
          <Alert
            className={`fixed top-4 right-4 z-50 w-96 ${
              notification.type === "success"
                ? "border-green-500 bg-green-500/10"
                : notification.type === "error"
                  ? "border-red-500 bg-red-500/10"
                  : notification.type === "warning"
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-blue-500 bg-blue-500/10"
            }`}
          >
            <AlertDescription
              className={
                notification.type === "success"
                  ? "text-green-400"
                  : notification.type === "error"
                    ? "text-red-400"
                    : notification.type === "warning"
                      ? "text-yellow-400"
                      : "text-blue-400"
              }
            >
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-400" />
              Sécurité & Conformité
            </h1>
            <p className="text-slate-300 mt-2">Configuration de la sécurité, chiffrement et conformité RGPD</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>

        {/* Security Score */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Score de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Score global</span>
                  <span className={`font-bold ${getSecurityScoreColor(securityScore)}`}>
                    {securityScore}/100 - {getSecurityScoreLabel(securityScore)}
                  </span>
                </div>
                <Progress
                  value={securityScore}
                  className={`h-3 ${securityScore >= 80 ? "bg-green-900" : securityScore >= 60 ? "bg-yellow-900" : "bg-red-900"}`}
                />
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getSecurityScoreColor(securityScore)}`}>{securityScore}%</div>
                <p className="text-slate-400 text-sm">Sécurité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="authentication" className="data-[state=active]:bg-purple-600">
              <Key className="h-4 w-4 mr-2" />
              Authentification
            </TabsTrigger>
            <TabsTrigger value="encryption" className="data-[state=active]:bg-purple-600">
              <Lock className="h-4 w-4 mr-2" />
              Chiffrement
            </TabsTrigger>
            <TabsTrigger value="whitelist" className="data-[state=active]:bg-purple-600">
              <Globe className="h-4 w-4 mr-2" />
              IP Whitelist
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600">
              <FileText className="h-4 w-4 mr-2" />
              Audit & Logs
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-purple-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Conformité
            </TabsTrigger>
          </TabsList>

          {/* Authentification */}
          <TabsContent value="authentication" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-400" />
                  Configuration de l'Authentification
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Paramètres JWT, 2FA et gestion des sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Expiration JWT (heures)</Label>
                      <Input
                        type="number"
                        value={settings.authentication.jwtExpiration}
                        onChange={(e) =>
                          handleSettingChange("authentication", "jwtExpiration", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Durée de validité des tokens JWT</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Expiration Refresh Token (jours)</Label>
                      <Input
                        type="number"
                        value={settings.authentication.refreshTokenExpiration}
                        onChange={(e) =>
                          handleSettingChange(
                            "authentication",
                            "refreshTokenExpiration",
                            Number.parseInt(e.target.value),
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Durée de validité des refresh tokens</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Limite tentatives de connexion</Label>
                      <Input
                        type="number"
                        value={settings.authentication.loginAttemptLimit}
                        onChange={(e) =>
                          handleSettingChange("authentication", "loginAttemptLimit", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Nombre max de tentatives avant blocage</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Durée de blocage (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.authentication.lockoutDuration}
                        onChange={(e) =>
                          handleSettingChange("authentication", "lockoutDuration", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Durée de blocage après échecs répétés</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">2FA obligatoire pour admin</Label>
                        <p className="text-xs text-slate-400">Authentification à deux facteurs requise</p>
                      </div>
                      <Switch
                        checked={settings.authentication.twoFactorRequired}
                        onCheckedChange={(value) => handleSettingChange("authentication", "twoFactorRequired", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Sessions multiples interdites</Label>
                        <p className="text-xs text-slate-400">Un seul login simultané par utilisateur</p>
                      </div>
                      <Switch
                        checked={!settings.authentication.multipleSessionsAllowed}
                        onCheckedChange={(value) =>
                          handleSettingChange("authentication", "multipleSessionsAllowed", !value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chiffrement */}
          <TabsContent value="encryption" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  Configuration du Chiffrement
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Paramètres de chiffrement pour base de données et communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Chiffrement base de données</Label>
                      <Select
                        value={settings.encryption.databaseEncryption}
                        onValueChange={(value) => handleSettingChange("encryption", "databaseEncryption", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AES-256">AES-256</SelectItem>
                          <SelectItem value="AES-128">AES-128</SelectItem>
                          <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Protocole de communication</Label>
                      <Select
                        value={settings.encryption.communicationProtocol}
                        onValueChange={(value) => handleSettingChange("encryption", "communicationProtocol", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TLS 1.3">TLS 1.3</SelectItem>
                          <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Hachage des mots de passe</Label>
                      <Select
                        value={settings.encryption.passwordHashing}
                        onValueChange={(value) => handleSettingChange("encryption", "passwordHashing", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bcrypt">bcrypt</SelectItem>
                          <SelectItem value="scrypt">scrypt</SelectItem>
                          <SelectItem value="argon2">argon2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Rounds de hachage</Label>
                      <Input
                        type="number"
                        value={settings.encryption.hashRounds}
                        onChange={(e) =>
                          handleSettingChange("encryption", "hashRounds", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Nombre de rounds pour bcrypt (recommandé: 12)</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Chiffrement données PII</Label>
                        <p className="text-xs text-slate-400">Chiffrement spécifique pour données personnelles</p>
                      </div>
                      <Switch
                        checked={settings.encryption.piiEncryption}
                        onCheckedChange={(value) => handleSettingChange("encryption", "piiEncryption", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Chiffrement des backups</Label>
                        <p className="text-xs text-slate-400">Chiffrement AES-256 des sauvegardes</p>
                      </div>
                      <Switch
                        checked={settings.encryption.backupEncryption}
                        onCheckedChange={(value) => handleSettingChange("encryption", "backupEncryption", value)}
                      />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-2">État du chiffrement</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Base de données</span>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {settings.encryption.databaseEncryption}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Communications</span>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {settings.encryption.communicationProtocol}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Mots de passe</span>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {settings.encryption.passwordHashing}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IP Whitelist */}
          <TabsContent value="whitelist" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  Liste Blanche IP
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Gestion des adresses IP autorisées pour l'accès admin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Whitelist IP activée</Label>
                    <p className="text-xs text-slate-400">Restreindre l'accès admin aux IP autorisées</p>
                  </div>
                  <Switch
                    checked={settings.ipWhitelist.enabled}
                    onCheckedChange={(value) => handleSettingChange("ipWhitelist", "enabled", value)}
                  />
                </div>

                {settings.ipWhitelist.enabled && (
                  <>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="192.168.1.0/24 ou 10.0.0.1"
                          value={newIpAddress}
                          onChange={(e) => setNewIpAddress(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                          onKeyPress={(e) => e.key === "Enter" && addIpAddress()}
                        />
                        <Button onClick={addIpAddress} className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">
                          Adresses IP autorisées ({settings.ipWhitelist.addresses.length})
                        </Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {settings.ipWhitelist.addresses.map((address, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600"
                            >
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-blue-400" />
                                <span className="text-white font-mono">{address}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeIpAddress(address)}
                                className="text-red-400 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Attention</span>
                      </div>
                      <p className="text-yellow-300 text-sm">
                        Assurez-vous d'inclure votre IP actuelle dans la liste avant d'activer la whitelist, sinon vous
                        pourriez perdre l'accès à l'interface d'administration.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit & Logs */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Audit & Logs
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des logs système et de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Niveau de log</Label>
                      <Select
                        value={settings.audit.logLevel}
                        onValueChange={(value) => handleSettingChange("audit", "logLevel", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEBUG">DEBUG</SelectItem>
                          <SelectItem value="INFO">INFO</SelectItem>
                          <SelectItem value="WARN">WARN</SelectItem>
                          <SelectItem value="ERROR">ERROR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Rétention logs généraux (jours)</Label>
                      <Input
                        type="number"
                        value={settings.audit.logRetention}
                        onChange={(e) => handleSettingChange("audit", "logRetention", Number.parseInt(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Durée de conservation des logs système</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Rétention logs sécurité (jours)</Label>
                      <Input
                        type="number"
                        value={settings.audit.securityLogRetention}
                        onChange={(e) =>
                          handleSettingChange("audit", "securityLogRetention", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Durée de conservation des logs de sécurité</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Logs structurés JSON</Label>
                        <p className="text-xs text-slate-400">Format JSON pour faciliter l'analyse</p>
                      </div>
                      <Switch
                        checked={settings.audit.structuredLogging}
                        onCheckedChange={(value) => handleSettingChange("audit", "structuredLogging", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Alertes de monitoring</Label>
                        <p className="text-xs text-slate-400">Alertes automatiques pour événements critiques</p>
                      </div>
                      <Switch
                        checked={settings.audit.monitoringAlerts}
                        onCheckedChange={(value) => handleSettingChange("audit", "monitoringAlerts", value)}
                      />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-3">Événements audités</h5>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Connexions/déconnexions admin</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Modifications de configuration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Accès aux données sensibles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Tentatives d'accès non autorisées</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Erreurs système critiques</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conformité */}
          <TabsContent value="compliance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                  Conformité RGPD Cameroun
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration de la conformité selon la loi 2010/012 du Cameroun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Conformité RGPD Cameroun</Label>
                        <p className="text-xs text-slate-400">
                          Respect de la loi 2010/012 sur la protection des données
                        </p>
                      </div>
                      <Switch
                        checked={settings.compliance.rgpdCompliant}
                        onCheckedChange={(value) => handleSettingChange("compliance", "rgpdCompliant", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Protection des données</Label>
                        <p className="text-xs text-slate-400">Application des règles de protection des données</p>
                      </div>
                      <Switch
                        checked={settings.compliance.dataProtectionLaw}
                        onCheckedChange={(value) => handleSettingChange("compliance", "dataProtectionLaw", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Droit à l'oubli</Label>
                        <p className="text-xs text-slate-400">Possibilité de suppression des données personnelles</p>
                      </div>
                      <Switch
                        checked={settings.compliance.rightToForgotten}
                        onCheckedChange={(value) => handleSettingChange("compliance", "rightToForgotten", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Consentement explicite</Label>
                        <p className="text-xs text-slate-400">Consentement requis pour traitement des données</p>
                      </div>
                      <Switch
                        checked={settings.compliance.explicitConsent}
                        onCheckedChange={(value) => handleSettingChange("compliance", "explicitConsent", value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-3">État de conformité</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">RGPD Cameroun</span>
                          {settings.compliance.rgpdCompliant ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Conforme
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Non conforme
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Protection données</span>
                          {settings.compliance.dataProtectionLaw ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activé
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Désactivé
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Droit à l'oubli</span>
                          {settings.compliance.rightToForgotten ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Implémenté
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Non implémenté
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Consentement</span>
                          {settings.compliance.explicitConsent ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Requis
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Non requis
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-600 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400 font-medium">Loi 2010/012</span>
                      </div>
                      <p className="text-blue-300 text-sm">
                        Cette configuration respecte la loi camerounaise 2010/012 du 21 décembre 2010 régissant les
                        communications électroniques et la protection des données personnelles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions rapides */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter config
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Exporter la configuration</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Télécharger la configuration de sécurité actuelle au format JSON
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-slate-300 text-sm">
                      Cette action va télécharger un fichier JSON contenant tous vos paramètres de sécurité actuels.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleExportConfig} className="bg-purple-600 hover:bg-purple-700">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer config
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Importer une configuration</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Coller le contenu JSON d'une configuration de sécurité
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Coller le JSON de configuration ici..."
                      value={importConfig}
                      onChange={(e) => setImportConfig(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white min-h-32"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleImportConfig}
                        disabled={!importConfig.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importer
                      </Button>
                      <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test sécurité
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Test de sécurité</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Vérification rapide des paramètres de sécurité
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!testResults ? (
                      <div className="text-center py-8">
                        <Button onClick={runSecurityTest} className="bg-purple-600 hover:bg-purple-700">
                          <TestTube className="h-4 w-4 mr-2" />
                          Lancer le test
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(testResults).map(([key, result]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <span className="text-white capitalize">{key}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 text-sm">{result.message}</span>
                              {result.status === "pass" ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : result.status === "warning" ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                    <Eye className="h-4 w-4 mr-2" />
                    Audit complet
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Audit de sécurité complet</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Analyse détaillée de tous les aspects de sécurité
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!auditResults ? (
                      <div className="text-center py-8">
                        <Button onClick={runFullAudit} className="bg-purple-600 hover:bg-purple-700">
                          <Activity className="h-4 w-4 mr-2" />
                          Lancer l'audit complet
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                            <div className="text-2xl font-bold text-white">{auditResults.summary.totalChecks}</div>
                            <div className="text-xs text-slate-400">Total</div>
                          </div>
                          <div className="text-center p-3 bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-400">{auditResults.summary.passed}</div>
                            <div className="text-xs text-slate-400">Réussis</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-400">{auditResults.summary.warnings}</div>
                            <div className="text-xs text-slate-400">Avertissements</div>
                          </div>
                          <div className="text-center p-3 bg-red-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">{auditResults.summary.failed}</div>
                            <div className="text-xs text-slate-400">Échecs</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {auditResults.details.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                            >
                              <span className="text-white">{item.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300 text-sm">{item.details}</span>
                                {item.status === "pass" ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : item.status === "warning" ? (
                                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { SettingsService } from "@/lib/services/settings-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Save,
  RotateCcw,
  TestTube,
  Plus,
  Edit,
  Trash2,
  Volume2,
  Vibrate,
  Moon,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

interface NotificationSettings {
  pushNotifications: {
    enabled: boolean
    firebaseServerKey: string
    soundEnabled: boolean
    vibrationEnabled: boolean
    badgeEnabled: boolean
    quietHours: {
      enabled: boolean
      startTime: string
      endTime: string
    }
  }
  emailNotifications: {
    enabled: boolean
    provider: string
    sendgridApiKey: string
    fromEmail: string
    fromName: string
    digestEnabled: boolean
    digestFrequency: string
    digestTime: string
  }
  smsNotifications: {
    enabled: boolean
    provider: string
    orangeApiKey: string
    mtnApiKey: string
    dailyLimit: number
    costPerSms: number
    emergencyOnly: boolean
  }
  notificationRules: {
    [key: string]: {
      push: boolean
      email: boolean
      sms: boolean
      whatsapp: boolean
    }
  }
  templates: {
    whatsapp: Array<{
      id: string
      name: string
      content: string
      variables: string[]
    }>
    sms: Array<{
      id: string
      name: string
      content: string
      variables: string[]
    }>
    email: Array<{
      id: string
      name: string
      subject: string
      content: string
      variables: string[]
    }>
  }
}

const defaultSettings: NotificationSettings = {
  pushNotifications: {
    enabled: true,
    firebaseServerKey: "",
    soundEnabled: true,
    vibrationEnabled: true,
    badgeEnabled: true,
    quietHours: {
      enabled: true,
      startTime: "22:00",
      endTime: "07:00",
    },
  },
  emailNotifications: {
    enabled: true,
    provider: "sendgrid",
    sendgridApiKey: "",
    fromEmail: "noreply@djobea.com",
    fromName: "Djobea",
    digestEnabled: true,
    digestFrequency: "daily",
    digestTime: "08:00",
  },
  smsNotifications: {
    enabled: true,
    provider: "local",
    orangeApiKey: "",
    mtnApiKey: "",
    dailyLimit: 100,
    costPerSms: 25,
    emergencyOnly: false,
  },
  notificationRules: {
    newRequest: {
      push: true,
      email: true,
      sms: false,
      whatsapp: true,
    },
    providerAssigned: {
      push: true,
      email: false,
      sms: false,
      whatsapp: true,
    },
    requestCompleted: {
      push: true,
      email: true,
      sms: false,
      whatsapp: false,
    },
    paymentReceived: {
      push: true,
      email: true,
      sms: true,
      whatsapp: false,
    },
    systemAlert: {
      push: true,
      email: true,
      sms: true,
      whatsapp: false,
    },
  },
  templates: {
    whatsapp: [
      {
        id: "new_request",
        name: "Nouvelle demande",
        content: "🔔 Nouvelle demande de service: {{service_type}} à {{location}}. Répondez rapidement!",
        variables: ["service_type", "location"],
      },
      {
        id: "request_assigned",
        name: "Demande assignée",
        content: "✅ Votre demande a été assignée à {{provider_name}}. Contact: {{provider_phone}}",
        variables: ["provider_name", "provider_phone"],
      },
    ],
    sms: [
      {
        id: "urgent_request",
        name: "Demande urgente",
        content: "URGENT: Nouvelle demande {{service_type}} à {{location}}. Répondez vite!",
        variables: ["service_type", "location"],
      },
    ],
    email: [
      {
        id: "daily_digest",
        name: "Résumé quotidien",
        subject: "Votre résumé Djobea du {{date}}",
        content: "Bonjour {{user_name}}, voici votre résumé d'activité...",
        variables: ["user_name", "date"],
      },
    ],
  },
}

const eventLabels = {
  newRequest: "Nouvelle demande",
  providerAssigned: "Prestataire assigné",
  requestCompleted: "Demande terminée",
  paymentReceived: "Paiement reçu",
  systemAlert: "Alerte système",
}

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [isTestingPush, setIsTestingPush] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [isTestingSms, setIsTestingSms] = useState(false)

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const data = await SettingsService.getNotificationsSettings()
        setSettings(data)
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSettingChange = (section: keyof NotificationSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleNestedSettingChange = (
    section: keyof NotificationSettings,
    subsection: string,
    key: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value,
        },
      },
    }))
    setHasChanges(true)
  }

  const handleRuleChange = (event: string, channel: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notificationRules: {
        ...prev.notificationRules,
        [event]: {
          ...prev.notificationRules[event],
          [channel]: value,
        },
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await SettingsService.updateNotificationsSettings(settings)
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
    setIsSaving(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  const testNotification = async (type: string) => {
    const setTesting = {
      push: setIsTestingPush,
      email: setIsTestingEmail,
      sms: setIsTestingSms,
    }[type]

    if (setTesting) setTesting(true)

    try {
      const response = await fetch("/api/settings/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, settings: settings[`${type}Notifications` as keyof NotificationSettings] }),
      })
      const result = await response.json()
      setTestResults((prev: any) => ({ ...prev, [type]: result }))
    } catch (error) {
      console.error(`Test ${type} failed:`, error)
    }

    if (setTesting) setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="h-8 w-8 text-purple-400" />
              Système de Notifications
            </h1>
            <p className="text-slate-300 mt-2">Configuration des notifications push, email, SMS et règles d'envoi</p>
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

        <Tabs defaultValue="push" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="push" className="data-[state=active]:bg-purple-600">
              <Smartphone className="h-4 w-4 mr-2" />
              Push
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-600">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Règles
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
              <Edit className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Push Notifications */}
          <TabsContent value="push" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-400" />
                  Notifications Push
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration Firebase et paramètres des notifications push
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Notifications push activées</Label>
                      <Switch
                        checked={settings.pushNotifications.enabled}
                        onCheckedChange={(value) => handleSettingChange("pushNotifications", "enabled", value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Clé serveur Firebase</Label>
                      <Input
                        type="password"
                        value={settings.pushNotifications.firebaseServerKey}
                        onChange={(e) => handleSettingChange("pushNotifications", "firebaseServerKey", e.target.value)}
                        placeholder="AAAA..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Clé serveur Firebase Cloud Messaging</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Options de notification</h4>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-blue-400" />
                          <Label className="text-white">Son activé</Label>
                        </div>
                        <Switch
                          checked={settings.pushNotifications.soundEnabled}
                          onCheckedChange={(value) => handleSettingChange("pushNotifications", "soundEnabled", value)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Vibrate className="h-4 w-4 text-green-400" />
                          <Label className="text-white">Vibration activée</Label>
                        </div>
                        <Switch
                          checked={settings.pushNotifications.vibrationEnabled}
                          onCheckedChange={(value) =>
                            handleSettingChange("pushNotifications", "vibrationEnabled", value)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="w-4 h-4 bg-red-500" />
                          <Label className="text-white">Badge activé</Label>
                        </div>
                        <Switch
                          checked={settings.pushNotifications.badgeEnabled}
                          onCheckedChange={(value) => handleSettingChange("pushNotifications", "badgeEnabled", value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4 text-indigo-400" />
                          <Label className="text-white">Heures silencieuses</Label>
                        </div>
                        <Switch
                          checked={settings.pushNotifications.quietHours.enabled}
                          onCheckedChange={(value) =>
                            handleNestedSettingChange("pushNotifications", "quietHours", "enabled", value)
                          }
                        />
                      </div>

                      {settings.pushNotifications.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Début</Label>
                            <Input
                              type="time"
                              value={settings.pushNotifications.quietHours.startTime}
                              onChange={(e) =>
                                handleNestedSettingChange(
                                  "pushNotifications",
                                  "quietHours",
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Fin</Label>
                            <Input
                              type="time"
                              value={settings.pushNotifications.quietHours.endTime}
                              onChange={(e) =>
                                handleNestedSettingChange("pushNotifications", "quietHours", "endTime", e.target.value)
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => testNotification("push")}
                      disabled={isTestingPush || !settings.pushNotifications.firebaseServerKey}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isTestingPush ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Tester les notifications push
                    </Button>

                    {testResults.push && (
                      <div
                        className={`p-4 rounded-lg ${testResults.push.success ? "bg-green-900/50" : "bg-red-900/50"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {testResults.push.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className="text-white font-medium">Résultat du test</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{testResults.push.message}</p>
                        {testResults.push.details && (
                          <div className="text-xs text-slate-400">
                            <p>Appareils testés: {testResults.push.details.devicesTested}</p>
                            <p>Livrés: {testResults.push.details.delivered}</p>
                            <p>Échecs: {testResults.push.details.failed}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Notifications */}
          <TabsContent value="email" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-400" />
                  Notifications Email
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration SendGrid et paramètres des emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Notifications email activées</Label>
                      <Switch
                        checked={settings.emailNotifications.enabled}
                        onCheckedChange={(value) => handleSettingChange("emailNotifications", "enabled", value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Fournisseur</Label>
                      <Select
                        value={settings.emailNotifications.provider}
                        onValueChange={(value) => handleSettingChange("emailNotifications", "provider", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Clé API SendGrid</Label>
                      <Input
                        type="password"
                        value={settings.emailNotifications.sendgridApiKey}
                        onChange={(e) => handleSettingChange("emailNotifications", "sendgridApiKey", e.target.value)}
                        placeholder="SG...."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Email expéditeur</Label>
                        <Input
                          type="email"
                          value={settings.emailNotifications.fromEmail}
                          onChange={(e) => handleSettingChange("emailNotifications", "fromEmail", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Nom expéditeur</Label>
                        <Input
                          value={settings.emailNotifications.fromName}
                          onChange={(e) => handleSettingChange("emailNotifications", "fromName", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Résumé quotidien activé</Label>
                        <Switch
                          checked={settings.emailNotifications.digestEnabled}
                          onCheckedChange={(value) => handleSettingChange("emailNotifications", "digestEnabled", value)}
                        />
                      </div>

                      {settings.emailNotifications.digestEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Fréquence</Label>
                            <Select
                              value={settings.emailNotifications.digestFrequency}
                              onValueChange={(value) =>
                                handleSettingChange("emailNotifications", "digestFrequency", value)
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Quotidien</SelectItem>
                                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                <SelectItem value="monthly">Mensuel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Heure d'envoi</Label>
                            <Input
                              type="time"
                              value={settings.emailNotifications.digestTime}
                              onChange={(e) => handleSettingChange("emailNotifications", "digestTime", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => testNotification("email")}
                      disabled={isTestingEmail || !settings.emailNotifications.sendgridApiKey}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isTestingEmail ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Tester l'envoi d'email
                    </Button>

                    {testResults.email && (
                      <div
                        className={`p-4 rounded-lg ${testResults.email.success ? "bg-green-900/50" : "bg-red-900/50"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {testResults.email.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className="text-white font-medium">Résultat du test</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{testResults.email.message}</p>
                        {testResults.email.details && (
                          <div className="text-xs text-slate-400">
                            <p>Destinataire: {testResults.email.details.recipient}</p>
                            <p>Temps de livraison: {testResults.email.details.deliveryTime}</p>
                            <p>Statut: {testResults.email.details.status}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Notifications */}
          <TabsContent value="sms" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  Notifications SMS
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des opérateurs locaux et limites SMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Notifications SMS activées</Label>
                      <Switch
                        checked={settings.smsNotifications.enabled}
                        onCheckedChange={(value) => handleSettingChange("smsNotifications", "enabled", value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Fournisseur</Label>
                      <Select
                        value={settings.smsNotifications.provider}
                        onValueChange={(value) => handleSettingChange("smsNotifications", "provider", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Opérateurs locaux</SelectItem>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Clé API Orange</Label>
                      <Input
                        type="password"
                        value={settings.smsNotifications.orangeApiKey}
                        onChange={(e) => handleSettingChange("smsNotifications", "orangeApiKey", e.target.value)}
                        placeholder="Orange API Key"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Clé API MTN</Label>
                      <Input
                        type="password"
                        value={settings.smsNotifications.mtnApiKey}
                        onChange={(e) => handleSettingChange("smsNotifications", "mtnApiKey", e.target.value)}
                        placeholder="MTN API Key"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Limite quotidienne</Label>
                        <Input
                          type="number"
                          value={settings.smsNotifications.dailyLimit}
                          onChange={(e) =>
                            handleSettingChange("smsNotifications", "dailyLimit", Number.parseInt(e.target.value))
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                        <p className="text-xs text-slate-400">Nombre max de SMS par jour</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Coût par SMS (FCFA)</Label>
                        <Input
                          type="number"
                          value={settings.smsNotifications.costPerSms}
                          onChange={(e) =>
                            handleSettingChange("smsNotifications", "costPerSms", Number.parseInt(e.target.value))
                          }
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Urgences uniquement</Label>
                        <p className="text-xs text-slate-400">Limiter aux notifications critiques</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications.emergencyOnly}
                        onCheckedChange={(value) => handleSettingChange("smsNotifications", "emergencyOnly", value)}
                      />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-2">Statistiques SMS</h5>
                      <div className="space-y-1 text-sm text-slate-300">
                        <div className="flex justify-between">
                          <span>Envoyés aujourd'hui:</span>
                          <span>23/{settings.smsNotifications.dailyLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût total:</span>
                          <span>{23 * settings.smsNotifications.costPerSms} FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taux de livraison:</span>
                          <span className="text-green-400">94.2%</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => testNotification("sms")}
                      disabled={
                        isTestingSms ||
                        (!settings.smsNotifications.orangeApiKey && !settings.smsNotifications.mtnApiKey)
                      }
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isTestingSms ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Tester l'envoi SMS
                    </Button>

                    {testResults.sms && (
                      <div
                        className={`p-4 rounded-lg ${testResults.sms.success ? "bg-green-900/50" : "bg-red-900/50"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {testResults.sms.success ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className="text-white font-medium">Résultat du test</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{testResults.sms.message}</p>
                        {testResults.sms.details && (
                          <div className="text-xs text-slate-400">
                            <p>Destinataire: {testResults.sms.details.recipient}</p>
                            <p>Coût: {testResults.sms.details.cost}</p>
                            <p>Statut: {testResults.sms.details.status}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Rules */}
          <TabsContent value="rules" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  Règles de Notification
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des canaux de notification par événement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left text-white font-medium py-3 px-4">Événement</th>
                        <th className="text-center text-white font-medium py-3 px-4">
                          <Smartphone className="h-4 w-4 mx-auto" />
                          <span className="block text-xs mt-1">Push</span>
                        </th>
                        <th className="text-center text-white font-medium py-3 px-4">
                          <Mail className="h-4 w-4 mx-auto" />
                          <span className="block text-xs mt-1">Email</span>
                        </th>
                        <th className="text-center text-white font-medium py-3 px-4">
                          <MessageSquare className="h-4 w-4 mx-auto" />
                          <span className="block text-xs mt-1">SMS</span>
                        </th>
                        <th className="text-center text-white font-medium py-3 px-4">
                          <MessageSquare className="h-4 w-4 mx-auto" />
                          <span className="block text-xs mt-1">WhatsApp</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(eventLabels).map(([eventKey, eventLabel]) => (
                        <tr key={eventKey} className="border-b border-slate-700/50">
                          <td className="py-4 px-4">
                            <div className="text-white font-medium">{eventLabel}</div>
                            <div className="text-xs text-slate-400">
                              {eventKey === "newRequest" && "Quand une nouvelle demande est créée"}
                              {eventKey === "providerAssigned" && "Quand un prestataire est assigné"}
                              {eventKey === "requestCompleted" && "Quand une demande est terminée"}
                              {eventKey === "paymentReceived" && "Quand un paiement est reçu"}
                              {eventKey === "systemAlert" && "Pour les alertes système critiques"}
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <Switch
                              checked={settings.notificationRules[eventKey]?.push || false}
                              onCheckedChange={(value) => handleRuleChange(eventKey, "push", value)}
                            />
                          </td>
                          <td className="text-center py-4 px-4">
                            <Switch
                              checked={settings.notificationRules[eventKey]?.email || false}
                              onCheckedChange={(value) => handleRuleChange(eventKey, "email", value)}
                            />
                          </td>
                          <td className="text-center py-4 px-4">
                            <Switch
                              checked={settings.notificationRules[eventKey]?.sms || false}
                              onCheckedChange={(value) => handleRuleChange(eventKey, "sms", value)}
                            />
                          </td>
                          <td className="text-center py-4 px-4">
                            <Switch
                              checked={settings.notificationRules[eventKey]?.whatsapp || false}
                              onCheckedChange={(value) => handleRuleChange(eventKey, "whatsapp", value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit className="h-5 w-5 text-purple-400" />
                  Templates de Messages
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Gestion des templates pour WhatsApp, SMS et Email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="whatsapp" className="space-y-4">
                  <TabsList className="bg-slate-700/50">
                    <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                  </TabsList>

                  <TabsContent value="whatsapp" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-medium">Templates WhatsApp</h4>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau template
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {settings.templates.whatsapp.map((template) => (
                        <div key={template.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="text-white font-medium">{template.name}</h5>
                              <div className="flex gap-2 mt-1">
                                {template.variables.map((variable) => (
                                  <Badge key={variable} variant="secondary" className="text-xs">
                                    {`{{${variable}}}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="bg-slate-600 border-slate-500">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="bg-slate-600 border-slate-500">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded text-sm text-slate-300">{template.content}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="sms" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-medium">Templates SMS</h4>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau template
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {settings.templates.sms.map((template) => (
                        <div key={template.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="text-white font-medium">{template.name}</h5>
                              <div className="flex gap-2 mt-1">
                                {template.variables.map((variable) => (
                                  <Badge key={variable} variant="secondary" className="text-xs">
                                    {`{{${variable}}}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="bg-slate-600 border-slate-500">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="bg-slate-600 border-slate-500">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded text-sm text-slate-300">{template.content}</div>
                          <div className="mt-2 text-xs text-slate-400">
                            Longueur: {template.content.length}/160 caractères
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-medium">Templates Email</h4>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau template
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {settings.templates.email.map((template) => (
                        <div key={template.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="text-white font-medium">{template.name}</h5>
                              <p className="text-sm text-slate-400">{template.subject}</p>
                              <div className="flex gap-2 mt-1">
                                {template.variables.map((variable) => (
                                  <Badge key={variable} variant="secondary" className="text-xs">
                                    {`{{${variable}}}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="bg-slate-600 border-slate-500">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="bg-slate-600 border-slate-500">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded text-sm text-slate-300">
                            {template.content.substring(0, 200)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

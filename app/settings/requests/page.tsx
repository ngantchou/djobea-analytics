"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Settings,
  Clock,
  Target,
  Timer,
  Users,
  MapPin,
  Star,
  Zap,
  TrendingUp,
  Save,
  RotateCcw,
  Download,
  Upload,
  TestTube,
  Activity,
  Home,
  AlertTriangle,
} from "lucide-react"

interface RequestSettings {
  automaticProcessing: {
    enabled: boolean
    timeoutAssignment: number
    maxProvidersContacted: number
    geographicPriority: boolean
    ratingPriority: boolean
    availabilityPriority: boolean
  }
  matchingAlgorithm: {
    distanceWeight: number
    ratingWeight: number
    responseTimeWeight: number
    specializationWeight: number
    newProviderBoost: number
  }
  timeouts: {
    providerResponse: number
    automaticFallback: boolean
    adminEscalation: number
    autoCancel: number
    clientNotification: boolean
  }
  statuses: {
    pending: boolean
    providerNotified: boolean
    assigned: boolean
    inProgress: boolean
    completed: boolean
    cancelled: boolean
    failed: boolean
  }
}

const defaultSettings: RequestSettings = {
  automaticProcessing: {
    enabled: true,
    timeoutAssignment: 10,
    maxProvidersContacted: 3,
    geographicPriority: true,
    ratingPriority: true,
    availabilityPriority: true,
  },
  matchingAlgorithm: {
    distanceWeight: 40,
    ratingWeight: 30,
    responseTimeWeight: 20,
    specializationWeight: 10,
    newProviderBoost: 10,
  },
  timeouts: {
    providerResponse: 10,
    automaticFallback: true,
    adminEscalation: 180,
    autoCancel: 120,
    clientNotification: true,
  },
  statuses: {
    pending: true,
    providerNotified: true,
    assigned: true,
    inProgress: true,
    completed: true,
    cancelled: true,
    failed: true,
  },
}

const statusConfig = [
  { key: "pending", label: "PENDING", description: "En attente", icon: "⏱️", color: "bg-yellow-500" },
  {
    key: "providerNotified",
    label: "PROVIDER_NOTIFIED",
    description: "Prestataire contacté",
    icon: "📱",
    color: "bg-blue-500",
  },
  { key: "assigned", label: "ASSIGNED", description: "Prestataire assigné", icon: "✅", color: "bg-green-500" },
  { key: "inProgress", label: "IN_PROGRESS", description: "En cours d'exécution", icon: "🔧", color: "bg-purple-500" },
  { key: "completed", label: "COMPLETED", description: "Terminée", icon: "✅", color: "bg-green-600" },
  { key: "cancelled", label: "CANCELLED", description: "Annulée", icon: "❌", color: "bg-red-500" },
  { key: "failed", label: "FAILED", description: "Échec", icon: "💥", color: "bg-red-600" },
]

export default function RequestsSettingsPage() {
  const [settings, setSettings] = useState<RequestSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [importData, setImportData] = useState("")
  const [isTestingAlgorithm, setIsTestingAlgorithm] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/settings/requests")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (section: keyof RequestSettings, key: string, value: any) => {
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
    // Validation
    const totalWeight =
      settings.matchingAlgorithm.distanceWeight +
      settings.matchingAlgorithm.ratingWeight +
      settings.matchingAlgorithm.responseTimeWeight +
      settings.matchingAlgorithm.specializationWeight

    if (totalWeight !== 100) {
      toast({
        title: "Erreur de validation",
        description: "La somme des poids de l'algorithme doit être égale à 100%",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/settings/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (response.ok) {
        setHasChanges(false)
        toast({
          title: "Succès",
          description: "Paramètres sauvegardés avec succès",
        })
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la sauvegarde",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    setShowResetModal(false)
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés",
    })
  }

  const testMatchingAlgorithm = async () => {
    setIsTestingAlgorithm(true)
    try {
      const response = await fetch("/api/settings/requests/test-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings.matchingAlgorithm),
      })
      const results = await response.json()
      setTestResults(results)
      setShowTestModal(true)
      toast({
        title: "Test terminé",
        description: "Les résultats du test sont disponibles",
      })
    } catch (error) {
      console.error("Test failed:", error)
      toast({
        title: "Erreur",
        description: "Échec du test de l'algorithme",
        variant: "destructive",
      })
    }
    setIsTestingAlgorithm(false)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `djobea-requests-settings-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    setShowExportModal(false)
    toast({
      title: "Export réussi",
      description: "Configuration exportée avec succès",
    })
  }

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData)
      setSettings(parsedData)
      setHasChanges(true)
      setShowImportModal(false)
      setImportData("")
      toast({
        title: "Import réussi",
        description: "Configuration importée avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Format JSON invalide",
        variant: "destructive",
      })
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
      }
      reader.readAsText(file)
    }
  }

  const totalWeight =
    settings.matchingAlgorithm.distanceWeight +
    settings.matchingAlgorithm.ratingWeight +
    settings.matchingAlgorithm.responseTimeWeight +
    settings.matchingAlgorithm.specializationWeight

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des paramètres...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-slate-300 hover:text-white flex items-center gap-1">
                <Home className="h-4 w-4" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-400" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings" className="text-slate-300 hover:text-white">
                Paramètres
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-400" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">Gestion des Demandes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="h-8 w-8 text-purple-400" />
              Gestion des Demandes
            </h1>
            <p className="text-slate-300 mt-2">
              Configuration du traitement automatique et de l'algorithme de matching
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetModal(true)}
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

        {/* Changes indicator */}
        {hasChanges && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Vous avez des modifications non sauvegardées</span>
            </div>
          </div>
        )}

        <Tabs defaultValue="processing" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="processing" className="data-[state=active]:bg-purple-600">
              <Zap className="h-4 w-4 mr-2" />
              Traitement Auto
            </TabsTrigger>
            <TabsTrigger value="matching" className="data-[state=active]:bg-purple-600">
              <Target className="h-4 w-4 mr-2" />
              Algorithme Matching
            </TabsTrigger>
            <TabsTrigger value="timeouts" className="data-[state=active]:bg-purple-600">
              <Timer className="h-4 w-4 mr-2" />
              Timeouts & Escalation
            </TabsTrigger>
            <TabsTrigger value="statuses" className="data-[state=active]:bg-purple-600">
              <Activity className="h-4 w-4 mr-2" />
              Statuts Demandes
            </TabsTrigger>
          </TabsList>

          {/* Traitement Automatique */}
          <TabsContent value="processing" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Configuration du Traitement Automatique
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Paramètres pour l'assignation automatique des demandes aux prestataires
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Traitement automatique activé</Label>
                      <Switch
                        checked={settings.automaticProcessing.enabled}
                        onCheckedChange={(value) => handleSettingChange("automaticProcessing", "enabled", value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Timeout d'assignation (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.automaticProcessing.timeoutAssignment}
                        onChange={(e) =>
                          handleSettingChange(
                            "automaticProcessing",
                            "timeoutAssignment",
                            Number.parseInt(e.target.value) || 1,
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Temps maximum pour assigner une demande</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Nombre max de prestataires contactés</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.automaticProcessing.maxProvidersContacted}
                        onChange={(e) =>
                          handleSettingChange(
                            "automaticProcessing",
                            "maxProvidersContacted",
                            Number.parseInt(e.target.value) || 1,
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Nombre de prestataires contactés simultanément</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Priorités d'assignation</h4>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <Label className="text-white">Priorité géographique</Label>
                      </div>
                      <Switch
                        checked={settings.automaticProcessing.geographicPriority}
                        onCheckedChange={(value) =>
                          handleSettingChange("automaticProcessing", "geographicPriority", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Label className="text-white">Priorité rating</Label>
                      </div>
                      <Switch
                        checked={settings.automaticProcessing.ratingPriority}
                        onCheckedChange={(value) => handleSettingChange("automaticProcessing", "ratingPriority", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-400" />
                        <Label className="text-white">Priorité disponibilité</Label>
                      </div>
                      <Switch
                        checked={settings.automaticProcessing.availabilityPriority}
                        onCheckedChange={(value) =>
                          handleSettingChange("automaticProcessing", "availabilityPriority", value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithme de Matching */}
          <TabsContent value="matching" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Algorithme de Matching
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des poids pour l'algorithme de sélection des prestataires
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-400" />
                          Poids distance ({settings.matchingAlgorithm.distanceWeight}%)
                        </Label>
                      </div>
                      <Slider
                        value={[settings.matchingAlgorithm.distanceWeight]}
                        onValueChange={(value) => handleSettingChange("matchingAlgorithm", "distanceWeight", value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          Poids rating ({settings.matchingAlgorithm.ratingWeight}%)
                        </Label>
                      </div>
                      <Slider
                        value={[settings.matchingAlgorithm.ratingWeight]}
                        onValueChange={(value) => handleSettingChange("matchingAlgorithm", "ratingWeight", value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-400" />
                          Poids temps de réponse ({settings.matchingAlgorithm.responseTimeWeight}%)
                        </Label>
                      </div>
                      <Slider
                        value={[settings.matchingAlgorithm.responseTimeWeight]}
                        onValueChange={(value) =>
                          handleSettingChange("matchingAlgorithm", "responseTimeWeight", value[0])
                        }
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-400" />
                          Poids spécialisation ({settings.matchingAlgorithm.specializationWeight}%)
                        </Label>
                      </div>
                      <Slider
                        value={[settings.matchingAlgorithm.specializationWeight]}
                        onValueChange={(value) =>
                          handleSettingChange("matchingAlgorithm", "specializationWeight", value[0])
                        }
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Répartition des poids</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Total des poids:</span>
                          <span className={`font-medium ${totalWeight === 100 ? "text-green-400" : "text-red-400"}`}>
                            {totalWeight}%
                          </span>
                        </div>
                        <Progress
                          value={totalWeight}
                          className={`h-2 ${totalWeight === 100 ? "bg-green-900" : "bg-red-900"}`}
                        />
                        {totalWeight !== 100 && (
                          <p className="text-xs text-red-400">⚠️ La somme des poids doit être égale à 100%</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-400" />
                          Boost nouveau prestataire ({settings.matchingAlgorithm.newProviderBoost}%)
                        </Label>
                      </div>
                      <Slider
                        value={[settings.matchingAlgorithm.newProviderBoost]}
                        onValueChange={(value) =>
                          handleSettingChange("matchingAlgorithm", "newProviderBoost", value[0])
                        }
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-400">
                        Bonus appliqué aux nouveaux prestataires (premiers 30 jours)
                      </p>
                    </div>

                    <Button
                      onClick={testMatchingAlgorithm}
                      disabled={isTestingAlgorithm || totalWeight !== 100}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {isTestingAlgorithm ? "Test en cours..." : "Tester l'algorithme"}
                    </Button>

                    {testResults && (
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <h5 className="text-white font-medium mb-2">Derniers résultats du test</h5>
                        <div className="text-sm text-slate-300 space-y-1">
                          <p>Prestataires testés: {testResults.providersCount}</p>
                          <p>Temps de calcul: {testResults.executionTime}ms</p>
                          <p>Score moyen: {testResults.averageScore}/100</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeouts & Escalation */}
          <TabsContent value="timeouts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Timer className="h-5 w-5 text-purple-400" />
                  Timeouts & Escalation
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des délais et des règles d'escalation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Réponse prestataire (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={settings.timeouts.providerResponse}
                        onChange={(e) =>
                          handleSettingChange("timeouts", "providerResponse", Number.parseInt(e.target.value) || 1)
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Temps maximum pour qu'un prestataire réponde</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Escalation admin (minutes)</Label>
                      <Input
                        type="number"
                        min="30"
                        max="1440"
                        value={settings.timeouts.adminEscalation}
                        onChange={(e) =>
                          handleSettingChange("timeouts", "adminEscalation", Number.parseInt(e.target.value) || 30)
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Délai avant escalation vers l'admin (après 3 échecs)</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Annulation automatique (minutes)</Label>
                      <Input
                        type="number"
                        min="60"
                        max="2880"
                        value={settings.timeouts.autoCancel}
                        onChange={(e) =>
                          handleSettingChange("timeouts", "autoCancel", Number.parseInt(e.target.value) || 60)
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Délai avant annulation automatique de la demande</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Options d'escalation</h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Fallback automatique</Label>
                        <p className="text-xs text-slate-400">Passer au prestataire suivant automatiquement</p>
                      </div>
                      <Switch
                        checked={settings.timeouts.automaticFallback}
                        onCheckedChange={(value) => handleSettingChange("timeouts", "automaticFallback", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Notification client</Label>
                        <p className="text-xs text-slate-400">Notifier le client à chaque étape</p>
                      </div>
                      <Switch
                        checked={settings.timeouts.clientNotification}
                        onCheckedChange={(value) => handleSettingChange("timeouts", "clientNotification", value)}
                      />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-3">Flux d'escalation</h5>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>1. Notification prestataire</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span>2. Timeout ({settings.timeouts.providerResponse}min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span>3. Fallback prestataire suivant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>4. Escalation admin ({settings.timeouts.adminEscalation}min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>5. Annulation auto ({settings.timeouts.autoCancel}min)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statuts des Demandes */}
          <TabsContent value="statuses" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Statuts des Demandes
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des statuts disponibles pour les demandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statusConfig.map((status) => (
                    <div key={status.key} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                          <span className="text-white font-medium">{status.label}</span>
                        </div>
                        <Switch
                          checked={settings.statuses[status.key as keyof typeof settings.statuses]}
                          onCheckedChange={(value) => handleSettingChange("statuses", status.key, value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{status.icon}</span>
                          <span className="text-slate-300 text-sm">{status.description}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Flux des statuts</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {statusConfig.map((status, index) => (
                      <div key={status.key} className="flex items-center gap-2">
                        <Badge
                          variant={
                            settings.statuses[status.key as keyof typeof settings.statuses] ? "default" : "secondary"
                          }
                          className={
                            settings.statuses[status.key as keyof typeof settings.statuses]
                              ? status.color
                              : "bg-gray-600"
                          }
                        >
                          {status.icon} {status.label}
                        </Badge>
                        {index < statusConfig.length - 1 && <span className="text-slate-400">→</span>}
                      </div>
                    ))}
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
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter config
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer config
              </Button>
              <Button
                variant="outline"
                onClick={testMatchingAlgorithm}
                disabled={isTestingAlgorithm || totalWeight !== 100}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Confirmer la réinitialisation
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ? Cette action ne peut
              pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-green-400" />
              Exporter la configuration
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Télécharger la configuration actuelle au format JSON
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-slate-300 text-sm">
                La configuration sera exportée avec tous les paramètres actuels. Vous pourrez l'importer plus tard ou la
                partager avec d'autres instances.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Importer une configuration
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Importer une configuration depuis un fichier JSON ou coller le contenu directement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Fichier de configuration</Label>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
            </div>
            <div className="text-center text-slate-400">ou</div>
            <div>
              <Label className="text-white">Coller le JSON directement</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Coller le contenu JSON ici..."
                className="bg-slate-700 border-slate-600 text-white mt-2 h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false)
                setImportData("")
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim()} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Results Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-400" />
              Résultats du test d'algorithme
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Résultats détaillés du test de l'algorithme de matching
            </DialogDescription>
          </DialogHeader>
          {testResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-white">{testResults.providersCount}</div>
                  <div className="text-sm text-slate-300">Prestataires testés</div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-white">{testResults.executionTime}ms</div>
                  <div className="text-sm text-slate-300">Temps d'exécution</div>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Score moyen</span>
                  <span className="text-2xl font-bold text-green-400">{testResults.averageScore}/100</span>
                </div>
                <Progress value={testResults.averageScore} className="h-2" />
              </div>

              {testResults.topProviders && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Top 3 prestataires</h4>
                  <div className="space-y-2">
                    {testResults.topProviders.map((provider: any, index: number) => (
                      <div key={provider.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-white">{provider.name}</span>
                          <span className="text-slate-400 text-sm">({provider.distance})</span>
                        </div>
                        <div className="text-green-400 font-medium">{provider.score}/100</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowTestModal(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

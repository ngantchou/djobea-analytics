"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  BarChart3,
  TrendingUp,
  Target,
  FileText,
  Download,
  Calendar,
  Save,
  TestTube,
  Settings,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import Link from "next/link"

interface KPIConfig {
  id: string
  name: string
  target: number
  current: number
  unit: string
  enabled: boolean
  critical: boolean
}

interface ReportConfig {
  dailyReport: boolean
  weeklyReport: boolean
  monthlyReport: boolean
  dailyTime: string
  weeklyDay: string
  weeklyTime: string
  monthlyDay: number
  monthlyTime: string
  recipients: string[]
}

interface AnalyticsConfig {
  refreshRate: string
  dataRetention: number
  exportFormats: string[]
  dashboardCount: number
  realTimeEnabled: boolean
  alertsEnabled: boolean
}

interface BusinessTargets {
  conversionRate: number
  responseTime: number
  satisfaction: number
  cancellationRate: number
  monthlyRevenue: number
  activeProviders: number
  dailyRequests: number
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

export default function AnalyticsSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [showRecipients, setShowRecipients] = useState(false)

  const [kpis, setKpis] = useState<KPIConfig[]>([
    {
      id: "conversion",
      name: "Taux de conversion",
      target: 85,
      current: 87.3,
      unit: "%",
      enabled: true,
      critical: true,
    },
    {
      id: "response_time",
      name: "Temps de réponse moyen",
      target: 15,
      current: 12.4,
      unit: "min",
      enabled: true,
      critical: true,
    },
    {
      id: "satisfaction",
      name: "Satisfaction client",
      target: 4.5,
      current: 4.7,
      unit: "/5",
      enabled: true,
      critical: true,
    },
    {
      id: "cancellation",
      name: "Taux d'annulation",
      target: 5,
      current: 3.2,
      unit: "%",
      enabled: true,
      critical: false,
    },
    {
      id: "revenue",
      name: "Revenus mensuels",
      target: 500000,
      current: 547000,
      unit: "XAF",
      enabled: true,
      critical: true,
    },
    {
      id: "providers",
      name: "Prestataires actifs",
      target: 50,
      current: 47,
      unit: "",
      enabled: true,
      critical: false,
    },
    {
      id: "requests",
      name: "Demandes quotidiennes",
      target: 100,
      current: 127,
      unit: "",
      enabled: true,
      critical: false,
    },
    {
      id: "uptime",
      name: "Disponibilité système",
      target: 99.9,
      current: 99.95,
      unit: "%",
      enabled: true,
      critical: true,
    },
  ])

  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dailyReport: true,
    weeklyReport: true,
    monthlyReport: true,
    dailyTime: "08:00",
    weeklyDay: "monday",
    weeklyTime: "09:00",
    monthlyDay: 1,
    monthlyTime: "10:00",
    recipients: ["admin@djobea.ai", "manager@djobea.ai", "analytics@djobea.ai"],
  })

  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig>({
    refreshRate: "realtime",
    dataRetention: 730,
    exportFormats: ["JSON", "CSV", "PDF"],
    dashboardCount: 5,
    realTimeEnabled: true,
    alertsEnabled: true,
  })

  const [businessTargets, setBusinessTargets] = useState<BusinessTargets>({
    conversionRate: 85,
    responseTime: 15,
    satisfaction: 4.5,
    cancellationRate: 5,
    monthlyRevenue: 500000,
    activeProviders: 50,
    dailyRequests: 100,
  })

  const [newRecipient, setNewRecipient] = useState("")

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Configuration analytics sauvegardée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleTestReports = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Rapport de test généré et envoyé")
    } catch (error) {
      toast.error("Erreur lors du test")
    } finally {
      setLoading(false)
    }
  }

  const toggleKPI = (id: string) => {
    setKpis(kpis.map((kpi) => (kpi.id === id ? { ...kpi, enabled: !kpi.enabled } : kpi)))
  }

  const updateKPITarget = (id: string, target: number) => {
    setKpis(kpis.map((kpi) => (kpi.id === id ? { ...kpi, target } : kpi)))
  }

  const addRecipient = () => {
    if (newRecipient && !reportConfig.recipients.includes(newRecipient)) {
      setReportConfig({
        ...reportConfig,
        recipients: [...reportConfig.recipients, newRecipient],
      })
      setNewRecipient("")
      toast.success("Destinataire ajouté")
    }
  }

  const removeRecipient = (email: string) => {
    setReportConfig({
      ...reportConfig,
      recipients: reportConfig.recipients.filter((r) => r !== email),
    })
    toast.success("Destinataire supprimé")
  }

  const exportAnalyticsConfig = () => {
    const config = {
      timestamp: new Date().toISOString(),
      kpis,
      reportConfig,
      analyticsConfig,
      businessTargets,
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `djobea-analytics-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Configuration analytics exportée")
  }

  const getKPIStatus = (kpi: KPIConfig) => {
    const isGood =
      kpi.id === "cancellation" || kpi.id === "response_time" ? kpi.current <= kpi.target : kpi.current >= kpi.target
    return isGood ? "success" : "warning"
  }

  const getKPIColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
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
              <span className="text-white">Analytics & Reporting</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
              <BarChart3 className="w-12 h-12 text-blue-400 animate-pulse" />
              Analytics & Reporting
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Métriques business, KPIs et rapports automatiques</p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {/* KPIs Principaux */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">KPIs Principaux</CardTitle>
                        <CardDescription>Indicateurs clés de performance</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {kpis.filter((kpi) => kpi.enabled).length} KPIs actifs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {kpis.map((kpi) => {
                      const status = getKPIStatus(kpi)
                      return (
                        <div
                          key={kpi.id}
                          className={`bg-white/5 rounded-lg p-4 border transition-all ${
                            kpi.enabled ? "border-white/10" : "border-white/5 opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{kpi.name}</h3>
                              {kpi.critical && (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                                  Critique
                                </Badge>
                              )}
                            </div>
                            <Switch checked={kpi.enabled} onCheckedChange={() => toggleKPI(kpi.id)} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-400 text-xs">Actuel</Label>
                              <div className={`text-xl font-bold ${getKPIColor(status)}`}>
                                {kpi.unit === "XAF"
                                  ? `${kpi.current.toLocaleString()} ${kpi.unit}`
                                  : `${kpi.current}${kpi.unit}`}
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-400 text-xs">Cible</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={kpi.target}
                                  onChange={(e) => updateKPITarget(kpi.id, Number.parseFloat(e.target.value))}
                                  className="bg-white/5 border-white/10 text-white text-sm h-8"
                                  step={kpi.unit === "%" ? 0.1 : kpi.unit === "/5" ? 0.1 : 1}
                                />
                                <span className="text-xs text-gray-400">{kpi.unit}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Performance</span>
                              <span>{status === "success" ? "✅ Objectif atteint" : "⚠️ Sous l'objectif"}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  status === "success" ? "bg-green-400" : "bg-yellow-400"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    kpi.id === "cancellation" || kpi.id === "response_time"
                                      ? (kpi.target / kpi.current) * 100
                                      : (kpi.current / kpi.target) * 100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Configuration Analytics */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Configuration Analytics</CardTitle>
                        <CardDescription>Paramètres de collecte et traitement des données</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${
                        analyticsConfig.realTimeEnabled
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 ${analyticsConfig.realTimeEnabled ? "bg-green-400" : "bg-gray-400"} rounded-full mr-2 animate-pulse`}
                      />
                      {analyticsConfig.realTimeEnabled ? "Temps réel" : "Différé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Fréquence de mise à jour</Label>
                      <Select
                        value={analyticsConfig.refreshRate}
                        onValueChange={(value) => setAnalyticsConfig({ ...analyticsConfig, refreshRate: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Temps réel</SelectItem>
                          <SelectItem value="1min">1 minute</SelectItem>
                          <SelectItem value="5min">5 minutes</SelectItem>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="1hour">1 heure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Rétention des données (jours)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={analyticsConfig.dataRetention}
                          onChange={(e) =>
                            setAnalyticsConfig({ ...analyticsConfig, dataRetention: Number.parseInt(e.target.value) })
                          }
                          className="bg-white/5 border-white/10 text-white"
                          min={30}
                          max={2555}
                        />
                        <span className="text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-md">j</span>
                      </div>
                      <p className="text-xs text-gray-400">2 ans par défaut (730 jours)</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Nombre de dashboards</Label>
                      <Input
                        type="number"
                        value={analyticsConfig.dashboardCount}
                        onChange={(e) =>
                          setAnalyticsConfig({ ...analyticsConfig, dashboardCount: Number.parseInt(e.target.value) })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        min={1}
                        max={20}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Analytics temps réel</Label>
                        <p className="text-xs text-gray-400">Mise à jour instantanée des métriques</p>
                      </div>
                      <Switch
                        checked={analyticsConfig.realTimeEnabled}
                        onCheckedChange={(checked) =>
                          setAnalyticsConfig({ ...analyticsConfig, realTimeEnabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Alertes performance</Label>
                        <p className="text-xs text-gray-400">Notifications automatiques</p>
                      </div>
                      <Switch
                        checked={analyticsConfig.alertsEnabled}
                        onCheckedChange={(checked) =>
                          setAnalyticsConfig({ ...analyticsConfig, alertsEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="text-gray-300 mb-3 block">Formats d'export disponibles</Label>
                    <div className="flex flex-wrap gap-2">
                      {["JSON", "CSV", "PDF", "Excel", "XML"].map((format) => (
                        <Button
                          key={format}
                          variant={analyticsConfig.exportFormats.includes(format) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const formats = analyticsConfig.exportFormats.includes(format)
                              ? analyticsConfig.exportFormats.filter((f) => f !== format)
                              : [...analyticsConfig.exportFormats, format]
                            setAnalyticsConfig({ ...analyticsConfig, exportFormats: formats })
                          }}
                          className={
                            analyticsConfig.exportFormats.includes(format)
                              ? "bg-gradient-to-r from-blue-500 to-purple-600"
                              : "bg-transparent border-white/20 text-white hover:bg-white/10"
                          }
                        >
                          {format}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Rapports Automatiques */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FileText className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Rapports Automatiques</CardTitle>
                        <CardDescription>Configuration des rapports périodiques</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Calendar className="w-3 h-3 mr-1" />
                      Programmés
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Rapport quotidien</Label>
                          <p className="text-xs text-gray-400">Envoyé chaque matin</p>
                        </div>
                        <Switch
                          checked={reportConfig.dailyReport}
                          onCheckedChange={(checked) => setReportConfig({ ...reportConfig, dailyReport: checked })}
                        />
                      </div>
                      {reportConfig.dailyReport && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Heure d'envoi</Label>
                          <Input
                            type="time"
                            value={reportConfig.dailyTime}
                            onChange={(e) => setReportConfig({ ...reportConfig, dailyTime: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Rapport hebdomadaire</Label>
                          <p className="text-xs text-gray-400">Envoyé chaque semaine</p>
                        </div>
                        <Switch
                          checked={reportConfig.weeklyReport}
                          onCheckedChange={(checked) => setReportConfig({ ...reportConfig, weeklyReport: checked })}
                        />
                      </div>
                      {reportConfig.weeklyReport && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Jour de la semaine</Label>
                          <Select
                            value={reportConfig.weeklyDay}
                            onValueChange={(value) => setReportConfig({ ...reportConfig, weeklyDay: value })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Lundi</SelectItem>
                              <SelectItem value="tuesday">Mardi</SelectItem>
                              <SelectItem value="wednesday">Mercredi</SelectItem>
                              <SelectItem value="thursday">Jeudi</SelectItem>
                              <SelectItem value="friday">Vendredi</SelectItem>
                              <SelectItem value="saturday">Samedi</SelectItem>
                              <SelectItem value="sunday">Dimanche</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="time"
                            value={reportConfig.weeklyTime}
                            onChange={(e) => setReportConfig({ ...reportConfig, weeklyTime: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Rapport mensuel</Label>
                          <p className="text-xs text-gray-400">Envoyé chaque mois</p>
                        </div>
                        <Switch
                          checked={reportConfig.monthlyReport}
                          onCheckedChange={(checked) => setReportConfig({ ...reportConfig, monthlyReport: checked })}
                        />
                      </div>
                      {reportConfig.monthlyReport && (
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Jour du mois</Label>
                          <Input
                            type="number"
                            value={reportConfig.monthlyDay}
                            onChange={(e) =>
                              setReportConfig({ ...reportConfig, monthlyDay: Number.parseInt(e.target.value) })
                            }
                            className="bg-white/5 border-white/10 text-white"
                            min={1}
                            max={28}
                          />
                          <Input
                            type="time"
                            value={reportConfig.monthlyTime}
                            onChange={(e) => setReportConfig({ ...reportConfig, monthlyTime: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Destinataires */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Destinataires des rapports</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRecipients(!showRecipients)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showRecipients ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="email@djobea.ai"
                        className="bg-white/5 border-white/10 text-white flex-1"
                        onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                      />
                      <Button
                        onClick={addRecipient}
                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                      >
                        Ajouter
                      </Button>
                    </div>

                    {showRecipients && (
                      <div className="space-y-2">
                        {reportConfig.recipients.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-white">{email}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRecipient(email)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      onClick={exportAnalyticsConfig}
                      variant="outline"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter configuration
                    </Button>
                    <Button
                      onClick={handleTestReports}
                      variant="outline"
                      disabled={loading}
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Tester les rapports
                    </Button>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
      </div>
    </TooltipProvider>
  )
}

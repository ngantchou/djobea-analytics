"use client"

import { useState, useEffect } from "react"
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
  Zap,
  Activity,
  Database,
  Globe,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Clock,
  TrendingUp,
  CheckCircle,
  Save,
  RotateCcw,
  Download,
  Upload,
  TestTube,
  RefreshCw,
  Server,
  Shield,
} from "lucide-react"

interface PerformanceSettings {
  cache: {
    redisEnabled: boolean
    ttl: number
    maxMemory: string
    evictionPolicy: string
  }
  cdn: {
    enabled: boolean
    provider: string
    regions: string[]
    cacheHeaders: boolean
  }
  compression: {
    gzipEnabled: boolean
    brotliEnabled: boolean
    level: number
    minSize: number
  }
  images: {
    webpEnabled: boolean
    lazyLoading: boolean
    compression: number
    maxWidth: number
  }
  database: {
    connectionPool: number
    queryTimeout: number
    indexOptimization: boolean
    slowQueryLog: boolean
  }
  monitoring: {
    uptimeTarget: number
    responseTimeTarget: number
    errorRateTarget: number
    alertsEnabled: boolean
  }
  backup: {
    dailyEnabled: boolean
    weeklyEnabled: boolean
    retention: number
    encryption: boolean
    rto: number
    rpo: number
  }
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
  uptime: number
  errorRate: number
}

const defaultSettings: PerformanceSettings = {
  cache: {
    redisEnabled: true,
    ttl: 300,
    maxMemory: "512mb",
    evictionPolicy: "allkeys-lru",
  },
  cdn: {
    enabled: true,
    provider: "CloudFlare",
    regions: ["Europe", "Africa", "North America"],
    cacheHeaders: true,
  },
  compression: {
    gzipEnabled: true,
    brotliEnabled: true,
    level: 6,
    minSize: 1024,
  },
  images: {
    webpEnabled: true,
    lazyLoading: true,
    compression: 80,
    maxWidth: 1920,
  },
  database: {
    connectionPool: 20,
    queryTimeout: 30,
    indexOptimization: true,
    slowQueryLog: true,
  },
  monitoring: {
    uptimeTarget: 99.9,
    responseTimeTarget: 200,
    errorRateTarget: 0.1,
    alertsEnabled: true,
  },
  backup: {
    dailyEnabled: true,
    weeklyEnabled: true,
    retention: 30,
    encryption: true,
    rto: 60,
    rpo: 15,
  },
}

const defaultMetrics: SystemMetrics = {
  cpu: 45,
  memory: 62,
  disk: 38,
  network: 25,
  responseTime: 156,
  uptime: 99.8,
  errorRate: 0.05,
}

export default function PerformanceSettingsPage() {
  const [settings, setSettings] = useState<PerformanceSettings>(defaultSettings)
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [performanceScore, setPerformanceScore] = useState(88)

  useEffect(() => {
    // Load settings and metrics from API
    const loadData = async () => {
      try {
        const [settingsResponse, metricsResponse] = await Promise.all([
          fetch("/api/settings/performance"),
          fetch("/api/metrics/system"),
        ])

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setSettings(settingsData.settings)
          setPerformanceScore(settingsData.performanceScore)
        }

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()

    // Update metrics every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSettingChange = (section: keyof PerformanceSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
    calculatePerformanceScore()
  }

  const calculatePerformanceScore = () => {
    let score = 0

    // Cache score (20 points)
    if (settings.cache.redisEnabled) score += 15
    if (settings.cache.ttl <= 300) score += 5

    // CDN score (15 points)
    if (settings.cdn.enabled) score += 15

    // Compression score (15 points)
    if (settings.compression.gzipEnabled) score += 8
    if (settings.compression.brotliEnabled) score += 7

    // Images score (15 points)
    if (settings.images.webpEnabled) score += 8
    if (settings.images.lazyLoading) score += 7

    // Database score (20 points)
    if (settings.database.connectionPool >= 20) score += 10
    if (settings.database.indexOptimization) score += 10

    // Monitoring score (15 points)
    if (settings.monitoring.uptimeTarget >= 99.9) score += 8
    if (settings.monitoring.responseTimeTarget <= 200) score += 7

    setPerformanceScore(score)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (response.ok) {
        setHasChanges(false)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
    setIsSaving(false)
  }

  const getMetricColor = (value: number, threshold: number, inverse = false) => {
    if (inverse) {
      return value <= threshold ? "text-green-400" : value <= threshold * 1.5 ? "text-yellow-400" : "text-red-400"
    }
    return value >= threshold ? "text-green-400" : value >= threshold * 0.8 ? "text-yellow-400" : "text-red-400"
  }

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-400" />
              Performance & Infrastructure
            </h1>
            <p className="text-slate-300 mt-2">Optimisations, monitoring et configuration de l'infrastructure</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSettings(defaultSettings)}
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

        {/* Performance Score & Real-time Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Score de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Score global</span>
                    <span className={`font-bold ${getPerformanceScoreColor(performanceScore)}`}>
                      {performanceScore}/100
                    </span>
                  </div>
                  <Progress
                    value={performanceScore}
                    className={`h-3 ${performanceScore >= 80 ? "bg-green-900" : performanceScore >= 60 ? "bg-yellow-900" : "bg-red-900"}`}
                  />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getPerformanceScoreColor(performanceScore)}`}>
                    {performanceScore}%
                  </div>
                  <p className="text-slate-400 text-sm">Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Métriques Temps Réel
                <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">CPU</span>
                    <span className={`font-medium ${getMetricColor(metrics.cpu, 80, true)}`}>{metrics.cpu}%</span>
                  </div>
                  <Progress value={metrics.cpu} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Mémoire</span>
                    <span className={`font-medium ${getMetricColor(metrics.memory, 80, true)}`}>{metrics.memory}%</span>
                  </div>
                  <Progress value={metrics.memory} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Disque</span>
                    <span className={`font-medium ${getMetricColor(metrics.disk, 80, true)}`}>{metrics.disk}%</span>
                  </div>
                  <Progress value={metrics.disk} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Réseau</span>
                    <span className={`font-medium ${getMetricColor(metrics.network, 80, true)}`}>
                      {metrics.network}%
                    </span>
                  </div>
                  <Progress value={metrics.network} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="optimization" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="optimization" className="data-[state=active]:bg-purple-600">
              <Zap className="h-4 w-4 mr-2" />
              Optimisations
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600">
              <Activity className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-purple-600">
              <Database className="h-4 w-4 mr-2" />
              Base de Données
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-purple-600">
              <Shield className="h-4 w-4 mr-2" />
              Backup & Recovery
            </TabsTrigger>
          </TabsList>

          {/* Optimisations */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cache Redis */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MemoryStick className="h-5 w-5 text-red-400" />
                    Cache Redis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Cache Redis activé</Label>
                    <Switch
                      checked={settings.cache.redisEnabled}
                      onCheckedChange={(value) => handleSettingChange("cache", "redisEnabled", value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">TTL par défaut (secondes)</Label>
                    <Input
                      type="number"
                      value={settings.cache.ttl}
                      onChange={(e) => handleSettingChange("cache", "ttl", Number.parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Mémoire maximale</Label>
                    <Select
                      value={settings.cache.maxMemory}
                      onValueChange={(value) => handleSettingChange("cache", "maxMemory", value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256mb">256 MB</SelectItem>
                        <SelectItem value="512mb">512 MB</SelectItem>
                        <SelectItem value="1gb">1 GB</SelectItem>
                        <SelectItem value="2gb">2 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Politique d'éviction</Label>
                    <Select
                      value={settings.cache.evictionPolicy}
                      onValueChange={(value) => handleSettingChange("cache", "evictionPolicy", value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allkeys-lru">All Keys LRU</SelectItem>
                        <SelectItem value="volatile-lru">Volatile LRU</SelectItem>
                        <SelectItem value="allkeys-random">All Keys Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* CDN */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    CDN Global
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">CDN activé</Label>
                    <Switch
                      checked={settings.cdn.enabled}
                      onCheckedChange={(value) => handleSettingChange("cdn", "enabled", value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Fournisseur CDN</Label>
                    <Select
                      value={settings.cdn.provider}
                      onValueChange={(value) => handleSettingChange("cdn", "provider", value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CloudFlare">CloudFlare</SelectItem>
                        <SelectItem value="AWS CloudFront">AWS CloudFront</SelectItem>
                        <SelectItem value="Azure CDN">Azure CDN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Régions actives</Label>
                    <div className="flex flex-wrap gap-2">
                      {settings.cdn.regions.map((region, index) => (
                        <Badge key={index} variant="secondary" className="bg-slate-700">
                          🌍 {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Headers de cache</Label>
                    <Switch
                      checked={settings.cdn.cacheHeaders}
                      onCheckedChange={(value) => handleSettingChange("cdn", "cacheHeaders", value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Compression */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-green-400" />
                    Compression
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Compression Gzip</Label>
                    <Switch
                      checked={settings.compression.gzipEnabled}
                      onCheckedChange={(value) => handleSettingChange("compression", "gzipEnabled", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Compression Brotli</Label>
                    <Switch
                      checked={settings.compression.brotliEnabled}
                      onCheckedChange={(value) => handleSettingChange("compression", "brotliEnabled", value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Niveau de compression (1-9)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="9"
                      value={settings.compression.level}
                      onChange={(e) => handleSettingChange("compression", "level", Number.parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Taille minimale (bytes)</Label>
                    <Input
                      type="number"
                      value={settings.compression.minSize}
                      onChange={(e) => handleSettingChange("compression", "minSize", Number.parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-purple-400" />
                    Optimisation Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Format WebP</Label>
                    <Switch
                      checked={settings.images.webpEnabled}
                      onCheckedChange={(value) => handleSettingChange("images", "webpEnabled", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Lazy Loading</Label>
                    <Switch
                      checked={settings.images.lazyLoading}
                      onCheckedChange={(value) => handleSettingChange("images", "lazyLoading", value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Qualité compression (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.images.compression}
                      onChange={(e) => handleSettingChange("images", "compression", Number.parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Largeur maximale (px)</Label>
                    <Input
                      type="number"
                      value={settings.images.maxWidth}
                      onChange={(e) => handleSettingChange("images", "maxWidth", Number.parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    Objectifs de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Uptime cible (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="90"
                      max="100"
                      value={settings.monitoring.uptimeTarget}
                      onChange={(e) =>
                        handleSettingChange("monitoring", "uptimeTarget", Number.parseFloat(e.target.value))
                      }
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Actuel: {metrics.uptime}%</span>
                      <span className={getMetricColor(metrics.uptime, settings.monitoring.uptimeTarget)}>
                        {metrics.uptime >= settings.monitoring.uptimeTarget ? "✅" : "⚠️"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Temps de réponse cible (ms)</Label>
                    <Input
                      type="number"
                      value={settings.monitoring.responseTimeTarget}
                      onChange={(e) =>
                        handleSettingChange("monitoring", "responseTimeTarget", Number.parseInt(e.target.value))
                      }
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Actuel: {metrics.responseTime}ms</span>
                      <span
                        className={getMetricColor(metrics.responseTime, settings.monitoring.responseTimeTarget, true)}
                      >
                        {metrics.responseTime <= settings.monitoring.responseTimeTarget ? "✅" : "⚠️"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Taux d'erreur cible (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      value={settings.monitoring.errorRateTarget}
                      onChange={(e) =>
                        handleSettingChange("monitoring", "errorRateTarget", Number.parseFloat(e.target.value))
                      }
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Actuel: {metrics.errorRate}%</span>
                      <span className={getMetricColor(metrics.errorRate, settings.monitoring.errorRateTarget, true)}>
                        {metrics.errorRate <= settings.monitoring.errorRateTarget ? "✅" : "⚠️"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Alertes activées</Label>
                    <Switch
                      checked={settings.monitoring.alertsEnabled}
                      onCheckedChange={(value) => handleSettingChange("monitoring", "alertsEnabled", value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Métriques Détaillées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-400" />
                        <span className="text-white">CPU Usage</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getMetricColor(metrics.cpu, 80, true)}`}>{metrics.cpu}%</div>
                        <div className="text-xs text-slate-400">Seuil: 80%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-green-400" />
                        <span className="text-white">Memory Usage</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getMetricColor(metrics.memory, 80, true)}`}>{metrics.memory}%</div>
                        <div className="text-xs text-slate-400">Seuil: 80%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-yellow-400" />
                        <span className="text-white">Disk Usage</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getMetricColor(metrics.disk, 80, true)}`}>{metrics.disk}%</div>
                        <div className="text-xs text-slate-400">Seuil: 80%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-purple-400" />
                        <span className="text-white">Network I/O</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getMetricColor(metrics.network, 80, true)}`}>
                          {metrics.network}%
                        </div>
                        <div className="text-xs text-slate-400">Seuil: 80%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Base de Données */}
          <TabsContent value="database" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  Configuration Base de Données
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Optimisations et monitoring de la base de données PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Pool de connexions</Label>
                      <Input
                        type="number"
                        min="5"
                        max="100"
                        value={settings.database.connectionPool}
                        onChange={(e) =>
                          handleSettingChange("database", "connectionPool", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Nombre max de connexions simultanées</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Timeout requête (secondes)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="300"
                        value={settings.database.queryTimeout}
                        onChange={(e) =>
                          handleSettingChange("database", "queryTimeout", Number.parseInt(e.target.value))
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Timeout pour les requêtes longues</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Optimisation des index</Label>
                        <p className="text-xs text-slate-400">Analyse automatique des performances</p>
                      </div>
                      <Switch
                        checked={settings.database.indexOptimization}
                        onCheckedChange={(value) => handleSettingChange("database", "indexOptimization", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Log des requêtes lentes</Label>
                        <p className="text-xs text-slate-400">Enregistrer les requêtes {">"} 1s</p>
                      </div>
                      <Switch
                        checked={settings.database.slowQueryLog}
                        onCheckedChange={(value) => handleSettingChange("database", "slowQueryLog", value)}
                      />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-3">Statistiques DB</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Connexions actives</span>
                          <span className="text-white font-medium">12/20</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Requêtes/sec</span>
                          <span className="text-white font-medium">156</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Cache hit ratio</span>
                          <span className="text-green-400 font-medium">98.5%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Taille DB</span>
                          <span className="text-white font-medium">2.4 GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup & Recovery */}
          <TabsContent value="backup" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configuration des sauvegardes et plan de reprise d'activité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Backup quotidien</Label>
                        <p className="text-xs text-slate-400">Sauvegarde automatique chaque jour à 2h</p>
                      </div>
                      <Switch
                        checked={settings.backup.dailyEnabled}
                        onCheckedChange={(value) => handleSettingChange("backup", "dailyEnabled", value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Backup hebdomadaire</Label>
                        <p className="text-xs text-slate-400">Sauvegarde complète chaque dimanche</p>
                      </div>
                      <Switch
                        checked={settings.backup.weeklyEnabled}
                        onCheckedChange={(value) => handleSettingChange("backup", "weeklyEnabled", value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Rétention (jours)</Label>
                      <Input
                        type="number"
                        min="7"
                        max="365"
                        value={settings.backup.retention}
                        onChange={(e) => handleSettingChange("backup", "retention", Number.parseInt(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Durée de conservation des backups</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Chiffrement des backups</Label>
                        <p className="text-xs text-slate-400">Chiffrement AES-256 des sauvegardes</p>
                      </div>
                      <Switch
                        checked={settings.backup.encryption}
                        onCheckedChange={(value) => handleSettingChange("backup", "encryption", value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">RTO - Recovery Time Objective (minutes)</Label>
                      <Input
                        type="number"
                        min="15"
                        max="1440"
                        value={settings.backup.rto}
                        onChange={(e) => handleSettingChange("backup", "rto", Number.parseInt(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Temps maximum pour restaurer le service</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">RPO - Recovery Point Objective (minutes)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="1440"
                        value={settings.backup.rpo}
                        onChange={(e) => handleSettingChange("backup", "rpo", Number.parseInt(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400">Perte de données maximale acceptable</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-3">Dernières sauvegardes</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Backup quotidien</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span className="text-green-400">Aujourd'hui 02:00</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Backup hebdomadaire</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span className="text-green-400">Dimanche 02:00</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Taille totale</span>
                          <span className="text-white font-medium">1.2 GB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Localisation</span>
                          <span className="text-blue-400">AWS S3 + Local</span>
                        </div>
                      </div>
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
              <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                <Download className="h-4 w-4 mr-2" />
                Exporter config
              </Button>
              <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                <Upload className="h-4 w-4 mr-2" />
                Importer config
              </Button>
              <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                <TestTube className="h-4 w-4 mr-2" />
                Test performance
              </Button>
              <Button variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                <Server className="h-4 w-4 mr-2" />
                Redémarrer services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

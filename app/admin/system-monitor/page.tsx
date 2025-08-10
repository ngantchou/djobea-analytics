"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Bell,
  Monitor,
  Wifi,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface SystemMetrics {
  server: {
    status: "healthy" | "warning" | "critical"
    uptime: string
    load: {
      cpu: number
      memory: number
      disk: number
    }
    connections: {
      active: number
      total: number
    }
  }
  database: {
    status: "healthy" | "warning" | "critical"
    connections: {
      active: number
      max: number
    }
    performance: {
      queryTime: number
      slowQueries: number
    }
    size: {
      total: string
      used: string
      free: string
    }
  }
  api: {
    status: "healthy" | "warning" | "critical"
    requests: {
      total: number
      perMinute: number
      errors: number
      errorRate: number
    }
    responseTime: {
      average: number
      p95: number
      p99: number
    }
  }
  llm: {
    status: "healthy" | "warning" | "critical"
    providers: {
      claude: { status: "online" | "offline", latency: number }
      gemini: { status: "online" | "offline", latency: number }
      openai: { status: "online" | "offline", latency: number }
    }
    requests: {
      total: number
      successful: number
      failed: number
    }
  }
  services: {
    whatsapp: { status: "healthy" | "warning" | "critical", lastCheck: string }
    notifications: { status: "healthy" | "warning" | "critical", lastCheck: string }
    tracking: { status: "healthy" | "warning" | "critical", lastCheck: string }
    payments: { status: "healthy" | "warning" | "critical", lastCheck: string }
  }
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

export default function SystemMonitorPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data - replace with real API calls
  const [metrics, setMetrics] = useState<SystemMetrics>({
    server: {
      status: "healthy",
      uptime: "12d 4h 23m",
      load: {
        cpu: 45,
        memory: 68,
        disk: 23
      },
      connections: {
        active: 142,
        total: 500
      }
    },
    database: {
      status: "healthy",
      connections: {
        active: 15,
        max: 100
      },
      performance: {
        queryTime: 12.5,
        slowQueries: 2
      },
      size: {
        total: "2.4 GB",
        used: "1.8 GB",
        free: "600 MB"
      }
    },
    api: {
      status: "healthy",
      requests: {
        total: 45670,
        perMinute: 85,
        errors: 23,
        errorRate: 0.05
      },
      responseTime: {
        average: 125,
        p95: 230,
        p99: 450
      }
    },
    llm: {
      status: "warning",
      providers: {
        claude: { status: "offline", latency: 0 },
        gemini: { status: "online", latency: 892 },
        openai: { status: "offline", latency: 0 }
      },
      requests: {
        total: 1240,
        successful: 1180,
        failed: 60
      }
    },
    services: {
      whatsapp: { status: "healthy", lastCheck: "Il y a 2 minutes" },
      notifications: { status: "healthy", lastCheck: "Il y a 1 minute" },
      tracking: { status: "warning", lastCheck: "Il y a 5 minutes" },
      payments: { status: "critical", lastCheck: "Il y a 15 minutes" }
    }
  })

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMetrics()
      }, refreshInterval * 1000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update with slight variations to show real-time changes
      setMetrics(prev => ({
        ...prev,
        server: {
          ...prev.server,
          load: {
            cpu: Math.max(20, Math.min(80, prev.server.load.cpu + (Math.random() - 0.5) * 10)),
            memory: Math.max(30, Math.min(90, prev.server.load.memory + (Math.random() - 0.5) * 5)),
            disk: Math.max(10, Math.min(95, prev.server.load.disk + (Math.random() - 0.5) * 2))
          },
          connections: {
            ...prev.server.connections,
            active: Math.max(50, Math.min(300, prev.server.connections.active + Math.floor((Math.random() - 0.5) * 20)))
          }
        },
        api: {
          ...prev.api,
          requests: {
            ...prev.api.requests,
            total: prev.api.requests.total + Math.floor(Math.random() * 10),
            perMinute: Math.max(10, Math.min(150, prev.api.requests.perMinute + Math.floor((Math.random() - 0.5) * 20)))
          }
        }
      }))
      
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error("Failed to load metrics:", error)
      toast.error("Erreur lors du chargement des métriques")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "critical":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getLoadColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500"
    if (percentage < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Check if user has admin permissions
  if (!user || (user.role !== "admin" && !user.permissions?.includes("system:monitor"))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <Monitor className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès Refusé</h2>
            <p className="text-gray-300 mb-4">Vous n'avez pas les permissions nécessaires pour accéder au monitoring système.</p>
            <Button asChild>
              <Link href="/settings">Retour aux paramètres</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/settings/admin">
                <Button variant="outline" size="sm" className="bg-black/20 border-white/10 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Retour Admin
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-400" />
                <h1 className="text-lg font-semibold text-white">Monitoring Système</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">
                Dernière MAJ: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button
                size="sm"
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "bg-black/20 border-white/10 text-white hover:bg-white/10"}
              >
                {autoRefresh ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Auto ({refreshInterval}s)
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Manual
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={loadMetrics}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pt-20">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* System Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-400" />
                      <CardTitle className="text-sm text-white">Serveur</CardTitle>
                    </div>
                    {getStatusIcon(metrics.server.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-400">
                    Uptime: {metrics.server.uptime}
                  </div>
                  <div className="text-xs text-gray-400">
                    Connexions: {metrics.server.connections.active}/{metrics.server.connections.total}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-sm text-white">Base de Données</CardTitle>
                    </div>
                    {getStatusIcon(metrics.database.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-400">
                    Connexions: {metrics.database.connections.active}/{metrics.database.connections.max}
                  </div>
                  <div className="text-xs text-gray-400">
                    Taille: {metrics.database.size.used}/{metrics.database.size.total}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <CardTitle className="text-sm text-white">API</CardTitle>
                    </div>
                    {getStatusIcon(metrics.api.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-400">
                    {metrics.api.requests.perMinute} req/min
                  </div>
                  <div className="text-xs text-gray-400">
                    Erreurs: {metrics.api.requests.errorRate}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <CardTitle className="text-sm text-white">LLM</CardTitle>
                    </div>
                    {getStatusIcon(metrics.llm.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-400">
                    Succès: {Math.round((metrics.llm.requests.successful / metrics.llm.requests.total) * 100)}%
                  </div>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${metrics.llm.providers.claude.status === "online" ? "bg-green-400" : "bg-red-400"}`}></div>
                    <div className={`w-2 h-2 rounded-full ${metrics.llm.providers.gemini.status === "online" ? "bg-green-400" : "bg-red-400"}`}></div>
                    <div className={`w-2 h-2 rounded-full ${metrics.llm.providers.openai.status === "online" ? "bg-green-400" : "bg-red-400"}`}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Detailed Metrics */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="resources" className="space-y-4">
              <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
                <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600">
                  <Cpu className="h-4 w-4 mr-2" />
                  Ressources
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-purple-600">
                  <Network className="h-4 w-4 mr-2" />
                  API & Réseaux
                </TabsTrigger>
                <TabsTrigger value="services" className="data-[state=active]:bg-purple-600">
                  <Settings className="h-4 w-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="llm" className="data-[state=active]:bg-purple-600">
                  <Zap className="h-4 w-4 mr-2" />
                  Providers LLM
                </TabsTrigger>
              </TabsList>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-blue-400" />
                        <CardTitle className="text-white">CPU</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Utilisation</span>
                          <span className="text-white">{metrics.server.load.cpu}%</span>
                        </div>
                        <Progress 
                          value={metrics.server.load.cpu} 
                          className="h-2"
                          color={getLoadColor(metrics.server.load.cpu)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {metrics.server.load.cpu < 70 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs text-gray-400">
                          {metrics.server.load.cpu < 70 ? "Optimal" : "Élevé"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        <CardTitle className="text-white">Mémoire</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Utilisation</span>
                          <span className="text-white">{metrics.server.load.memory}%</span>
                        </div>
                        <Progress 
                          value={metrics.server.load.memory} 
                          className="h-2"
                          color={getLoadColor(metrics.server.load.memory)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {metrics.server.load.memory < 80 ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-xs text-gray-400">
                          {metrics.server.load.memory < 80 ? "Normal" : "Attention"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-purple-400" />
                        <CardTitle className="text-white">Stockage</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Utilisation</span>
                          <span className="text-white">{metrics.server.load.disk}%</span>
                        </div>
                        <Progress 
                          value={metrics.server.load.disk} 
                          className="h-2"
                          color={getLoadColor(metrics.server.load.disk)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Optimal</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Database Metrics */}
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-white">Métriques Base de Données</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-green-400">{metrics.database.connections.active}</div>
                        <div className="text-xs text-gray-400">Connexions actives</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-blue-400">{metrics.database.performance.queryTime}ms</div>
                        <div className="text-xs text-gray-400">Temps de requête moyen</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-yellow-400">{metrics.database.performance.slowQueries}</div>
                        <div className="text-xs text-gray-400">Requêtes lentes</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-purple-400">{metrics.database.size.used}</div>
                        <div className="text-xs text-gray-400">Espace utilisé</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Tab */}
              <TabsContent value="api" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Trafic API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total des requêtes</span>
                          <span className="text-white font-mono">{metrics.api.requests.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Requêtes/minute</span>
                          <span className="text-white font-mono">{metrics.api.requests.perMinute}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Erreurs</span>
                          <span className="text-red-400 font-mono">{metrics.api.requests.errors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Taux d'erreur</span>
                          <span className="text-red-400 font-mono">{metrics.api.requests.errorRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Temps de Réponse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Moyenne</span>
                          <span className="text-green-400 font-mono">{metrics.api.responseTime.average}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">95e percentile</span>
                          <span className="text-yellow-400 font-mono">{metrics.api.responseTime.p95}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">99e percentile</span>
                          <span className="text-red-400 font-mono">{metrics.api.responseTime.p99}ms</span>
                        </div>
                        <div className="mt-4">
                          <Badge variant={metrics.api.responseTime.average < 200 ? "default" : "destructive"}>
                            {metrics.api.responseTime.average < 200 ? "Performant" : "Lent"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(metrics.services).map(([service, data]) => (
                    <Card key={service} className="bg-black/40 backdrop-blur-sm border-white/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white capitalize">{service}</CardTitle>
                          {getStatusIcon(data.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Dernière vérification</span>
                          <span className="text-gray-300 text-sm">{data.lastCheck}</span>
                        </div>
                        <Badge 
                          className={`mt-2 ${
                            data.status === "healthy" ? "bg-green-500/20 text-green-400" :
                            data.status === "warning" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {data.status === "healthy" ? "Opérationnel" :
                           data.status === "warning" ? "Attention" :
                           "Critique"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* LLM Tab */}
              <TabsContent value="llm" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(metrics.llm.providers).map(([provider, data]) => (
                    <Card key={provider} className="bg-black/40 backdrop-blur-sm border-white/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white capitalize">{provider}</CardTitle>
                          <div className={`w-3 h-3 rounded-full ${data.status === "online" ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Statut</span>
                          <Badge variant={data.status === "online" ? "default" : "destructive"}>
                            {data.status === "online" ? "En ligne" : "Hors ligne"}
                          </Badge>
                        </div>
                        {data.status === "online" && (
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Latence</span>
                            <span className="text-white text-sm font-mono">{data.latency}ms</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Statistiques LLM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-blue-400">{metrics.llm.requests.total}</div>
                        <div className="text-xs text-gray-400">Requêtes totales</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-green-400">{metrics.llm.requests.successful}</div>
                        <div className="text-xs text-gray-400">Succès</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-2xl font-bold text-red-400">{metrics.llm.requests.failed}</div>
                        <div className="text-xs text-gray-400">Échecs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Alerts and Actions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <CardTitle className="text-white">Alertes & Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-300">
                      Providers LLM partiellement disponibles - Claude et OpenAI hors ligne
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      Service de paiement critique - Dernière vérification il y a 15 minutes
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurer les alertes
                  </Button>
                  <Button size="sm" variant="outline" className="bg-black/20 border-white/10 text-white hover:bg-white/10">
                    <Bell className="w-4 h-4 mr-2" />
                    Historique des alertes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
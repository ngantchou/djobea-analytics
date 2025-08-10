"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Database,
  Activity,
  Clock,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Server,
  Table,
  Search,
  FileText,
  Users,
  Tool,
  Cpu,
  Memory,
  Network
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface DatabaseMetrics {
  overview: {
    status: "healthy" | "warning" | "critical"
    uptime: string
    version: string
    totalSize: string
    usedSize: string
    freeSize: string
    connectionPool: {
      active: number
      idle: number
      max: number
    }
  }
  performance: {
    queryTime: {
      average: number
      p95: number
      p99: number
    }
    throughput: {
      reads: number
      writes: number
      transactions: number
    }
    slowQueries: {
      count: number
      threshold: number
    }
    locks: {
      waiting: number
      blocked: number
    }
  }
  tables: Array<{
    name: string
    rows: number
    size: string
    lastAccessed: string
    indexSize: string
    fragmentation: number
  }>
  queries: Array<{
    id: string
    query: string
    duration: number
    status: "running" | "completed" | "waiting"
    startTime: string
    rows: number
    cpu: number
  }>
  maintenance: {
    lastBackup: string
    backupSize: string
    lastVacuum: string
    lastAnalyze: string
    indexHealth: number
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

export default function DatabaseHealthPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval] = useState(30)
  const [searchQuery, setSearchQuery] = useState("")
  const [tableFilter, setTableFilter] = useState("all")
  const [queryFilter, setQueryFilter] = useState("all")

  // Mock data - replace with real API calls
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    overview: {
      status: "healthy",
      uptime: "28d 14h 23m",
      version: "PostgreSQL 15.4",
      totalSize: "4.2 GB",
      usedSize: "3.1 GB",
      freeSize: "1.1 GB",
      connectionPool: {
        active: 15,
        idle: 25,
        max: 100
      }
    },
    performance: {
      queryTime: {
        average: 12.5,
        p95: 45.2,
        p99: 156.8
      },
      throughput: {
        reads: 450,
        writes: 120,
        transactions: 85
      },
      slowQueries: {
        count: 3,
        threshold: 1000
      },
      locks: {
        waiting: 0,
        blocked: 0
      }
    },
    tables: [
      {
        name: "service_requests",
        rows: 15420,
        size: "156 MB",
        lastAccessed: "il y a 2 min",
        indexSize: "42 MB",
        fragmentation: 5
      },
      {
        name: "users",
        rows: 8945,
        size: "89 MB",
        lastAccessed: "il y a 5 min",
        indexSize: "28 MB",
        fragmentation: 12
      },
      {
        name: "providers",
        rows: 1230,
        size: "25 MB",
        lastAccessed: "il y a 1 min",
        indexSize: "8 MB",
        fragmentation: 3
      },
      {
        name: "messages",
        rows: 45890,
        size: "234 MB",
        lastAccessed: "il y a 30 sec",
        indexSize: "67 MB",
        fragmentation: 8
      },
      {
        name: "notifications",
        rows: 12456,
        size: "45 MB",
        lastAccessed: "il y a 10 min",
        indexSize: "15 MB",
        fragmentation: 15
      }
    ],
    queries: [
      {
        id: "q1",
        query: "SELECT * FROM service_requests WHERE status = 'pending' ORDER BY created_at DESC",
        duration: 125,
        status: "running",
        startTime: "2025-01-10T10:15:30Z",
        rows: 450,
        cpu: 15
      },
      {
        id: "q2", 
        query: "UPDATE users SET last_login = NOW() WHERE id = $1",
        duration: 8,
        status: "completed",
        startTime: "2025-01-10T10:14:55Z",
        rows: 1,
        cpu: 2
      },
      {
        id: "q3",
        query: "SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '1 hour'",
        duration: 1250,
        status: "waiting",
        startTime: "2025-01-10T10:13:20Z",
        rows: 0,
        cpu: 0
      }
    ],
    maintenance: {
      lastBackup: "il y a 6h",
      backupSize: "3.8 GB",
      lastVacuum: "il y a 2h",
      lastAnalyze: "il y a 4h",
      indexHealth: 94
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
      
      // Update with slight variations
      setMetrics(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          connectionPool: {
            ...prev.overview.connectionPool,
            active: Math.max(5, Math.min(50, prev.overview.connectionPool.active + Math.floor((Math.random() - 0.5) * 10)))
          }
        },
        performance: {
          ...prev.performance,
          queryTime: {
            average: Math.max(5, Math.min(50, prev.performance.queryTime.average + (Math.random() - 0.5) * 5)),
            p95: Math.max(20, Math.min(100, prev.performance.queryTime.p95 + (Math.random() - 0.5) * 10)),
            p99: Math.max(80, Math.min(300, prev.performance.queryTime.p99 + (Math.random() - 0.5) * 20))
          },
          throughput: {
            reads: Math.max(100, Math.min(800, prev.performance.throughput.reads + Math.floor((Math.random() - 0.5) * 100))),
            writes: Math.max(50, Math.min(300, prev.performance.throughput.writes + Math.floor((Math.random() - 0.5) * 50))),
            transactions: Math.max(30, Math.min(200, prev.performance.throughput.transactions + Math.floor((Math.random() - 0.5) * 30)))
          }
        }
      }))
      
    } catch (error) {
      console.error("Failed to load database metrics:", error)
      toast.error("Erreur lors du chargement des métriques")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-400"
      case "warning": return "text-yellow-400"
      case "critical": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "critical": return <XCircle className="w-4 h-4 text-red-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getFragmentationColor = (fragmentation: number) => {
    if (fragmentation < 10) return "text-green-400"
    if (fragmentation < 20) return "text-yellow-400"
    return "text-red-400"
  }

  const getQueryStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500/20 text-blue-400"
      case "completed": return "bg-green-500/20 text-green-400"
      case "waiting": return "bg-yellow-500/20 text-yellow-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const filteredTables = metrics.tables.filter(table => {
    if (searchQuery && !table.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (tableFilter === "large" && parseInt(table.size) < 100) {
      return false
    }
    if (tableFilter === "fragmented" && table.fragmentation < 10) {
      return false
    }
    return true
  })

  const filteredQueries = metrics.queries.filter(query => {
    if (searchQuery && !query.query.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (queryFilter !== "all" && query.status !== queryFilter) {
      return false
    }
    return true
  })

  // Check if user has admin permissions
  if (!user || (user.role !== "admin" && !user.permissions?.includes("system:database"))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <Database className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès Refusé</h2>
            <p className="text-gray-300 mb-4">Vous n'avez pas les permissions nécessaires pour accéder au monitoring base de données.</p>
            <Button asChild>
              <Link href="/settings/admin">Retour Admin</Link>
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
                <Database className="w-5 h-5 text-green-400" />
                <h1 className="text-lg font-semibold text-white">Santé Base de Données</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? "default" : "secondary"} className="text-xs">
                {autoRefresh ? (
                  <>
                    <Activity className="w-3 h-3 mr-1 animate-pulse" />
                    Auto ({refreshInterval}s)
                  </>
                ) : (
                  "Manuel"
                )}
              </Badge>
              <Button
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "bg-black/20 border-white/10 text-white hover:bg-white/10"}
              >
                {autoRefresh ? "Auto" : "Manuel"}
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
          {/* Overview Cards */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-400" />
                      <CardTitle className="text-sm text-white">État Global</CardTitle>
                    </div>
                    {getStatusIcon(metrics.overview.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-400">
                    {metrics.overview.version}
                  </div>
                  <div className="text-xs text-gray-400">
                    Uptime: {metrics.overview.uptime}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-400" />
                    Stockage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Utilisé</span>
                      <span className="text-white">{metrics.overview.usedSize}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-400">
                    Total: {metrics.overview.totalSize}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-purple-400" />
                    Connexions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Actives</span>
                      <span className="text-white">{metrics.overview.connectionPool.active}</span>
                    </div>
                    <Progress value={(metrics.overview.connectionPool.active / metrics.overview.connectionPool.max) * 100} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-400">
                    Max: {metrics.overview.connectionPool.max}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-white">
                    {metrics.performance.queryTime.average.toFixed(1)}ms
                  </div>
                  <div className="text-xs text-gray-400">
                    Temps moyen
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
                <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="tables" className="data-[state=active]:bg-purple-600">
                  <Table className="h-4 w-4 mr-2" />
                  Tables
                </TabsTrigger>
                <TabsTrigger value="queries" className="data-[state=active]:bg-purple-600">
                  <Search className="h-4 w-4 mr-2" />
                  Requêtes
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="data-[state=active]:bg-purple-600">
                  <Tool className="h-4 w-4 mr-2" />
                  Maintenance
                </TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Temps de Réponse
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Moyenne</span>
                          <span className="text-white font-mono">{metrics.performance.queryTime.average.toFixed(1)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">95e percentile</span>
                          <span className="text-yellow-400 font-mono">{metrics.performance.queryTime.p95.toFixed(1)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">99e percentile</span>
                          <span className="text-red-400 font-mono">{metrics.performance.queryTime.p99.toFixed(1)}ms</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Badge variant={metrics.performance.queryTime.average < 50 ? "default" : "destructive"}>
                          {metrics.performance.queryTime.average < 50 ? "Excellent" : "À surveiller"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Débit
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lectures/sec</span>
                          <span className="text-green-400 font-mono">{metrics.performance.throughput.reads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Écritures/sec</span>
                          <span className="text-blue-400 font-mono">{metrics.performance.throughput.writes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transactions/sec</span>
                          <span className="text-purple-400 font-mono">{metrics.performance.throughput.transactions}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                          {metrics.performance.slowQueries.count}
                        </div>
                        <div className="text-sm text-gray-400">Requêtes lentes</div>
                        <div className="text-xs text-gray-500 mt-1">
                          &gt; {metrics.performance.slowQueries.threshold}ms
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400 mb-2">
                          {metrics.performance.locks.waiting}
                        </div>
                        <div className="text-sm text-gray-400">Verrous en attente</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-2">
                          {metrics.performance.locks.blocked}
                        </div>
                        <div className="text-sm text-gray-400">Sessions bloquées</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(metrics.performance.locks.waiting > 0 || metrics.performance.locks.blocked > 0) && (
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-300">
                      Verrous détectés - Surveillez les performances et considérez l'optimisation des requêtes.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Tables Tab */}
              <TabsContent value="tables" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher une table..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <Select value={tableFilter} onValueChange={setTableFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="large">Tables volumineuses</SelectItem>
                      <SelectItem value="fragmented">Fragmentées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Tables de la Base de Données</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-96">
                      <div className="p-4 space-y-3">
                        {filteredTables.map((table, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Table className="w-5 h-5 text-blue-400" />
                                <h4 className="text-white font-medium">{table.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {table.rows.toLocaleString()} lignes
                                </Badge>
                              </div>
                              <Badge className={`${getFragmentationColor(table.fragmentation)}`}>
                                {table.fragmentation}% fragmenté
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-400">Taille</div>
                                <div className="text-white font-mono">{table.size}</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Index</div>
                                <div className="text-white font-mono">{table.indexSize}</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Dernier accès</div>
                                <div className="text-white">{table.lastAccessed}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {table.fragmentation > 15 ? (
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                ) : (
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                )}
                                <span className="text-xs text-gray-400">
                                  {table.fragmentation > 15 ? "Optimisation requise" : "Saine"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Queries Tab */}
              <TabsContent value="queries" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher une requête..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <Select value={queryFilter} onValueChange={setQueryFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="running">En cours</SelectItem>
                      <SelectItem value="completed">Terminées</SelectItem>
                      <SelectItem value="waiting">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Requêtes Actives</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-96">
                      <div className="p-4 space-y-3">
                        {filteredQueries.map((query) => (
                          <div key={query.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-green-400" />
                                <Badge className={getQueryStatusColor(query.status)}>
                                  {query.status === "running" ? "En cours" :
                                   query.status === "completed" ? "Terminée" : "En attente"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">
                                  {query.duration}ms
                                </span>
                                <span className="text-gray-400">
                                  {query.rows} lignes
                                </span>
                                <span className="text-gray-400">
                                  {query.cpu}% CPU
                                </span>
                              </div>
                            </div>

                            <div className="bg-black/20 rounded p-3 mb-3">
                              <code className="text-white text-sm break-all">
                                {query.query}
                              </code>
                            </div>

                            <div className="flex justify-between text-xs text-gray-400">
                              <span>ID: {query.id}</span>
                              <span>Début: {new Date(query.startTime).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-blue-400" />
                        Sauvegardes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dernière sauvegarde</span>
                          <span className="text-white">{metrics.maintenance.lastBackup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Taille</span>
                          <span className="text-white">{metrics.maintenance.backupSize}</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <HardDrive className="w-4 h-4 mr-2" />
                        Lancer une sauvegarde
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Tool className="w-5 h-5 text-green-400" />
                        Maintenance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">VACUUM</span>
                          <span className="text-white">{metrics.maintenance.lastVacuum}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ANALYZE</span>
                          <span className="text-white">{metrics.maintenance.lastAnalyze}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          VACUUM
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          ANALYZE
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-400" />
                      Santé des Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Score global</span>
                        <span className="text-white font-bold">{metrics.maintenance.indexHealth}%</span>
                      </div>
                      <Progress value={metrics.maintenance.indexHealth} className="h-3" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {metrics.maintenance.indexHealth > 90 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : metrics.maintenance.indexHealth > 70 ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-gray-400">
                        {metrics.maintenance.indexHealth > 90 
                          ? "Index en excellent état" 
                          : metrics.maintenance.indexHealth > 70 
                          ? "Index nécessitent une attention" 
                          : "Index nécessitent une maintenance urgente"
                        }
                      </span>
                    </div>

                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Tool className="w-4 h-4 mr-2" />
                      Réindexer
                    </Button>
                  </CardContent>
                </Card>

                {metrics.maintenance.indexHealth < 80 && (
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-300">
                      La santé des index est dégradée. Considérez une réindexation pour améliorer les performances.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
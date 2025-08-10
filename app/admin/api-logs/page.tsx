"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Code,
  Terminal,
  Settings,
  Play,
  Pause,
  Trash2,
  FileText,
  Globe,
  Server,
  Smartphone,
  Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface APILog {
  id: string
  timestamp: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  status: number
  duration: number
  ip: string
  userAgent: string
  userId?: string
  requestBody?: any
  responseBody?: any
  error?: string
  size: number
  source: "web" | "mobile" | "api" | "webhook"
}

interface LogFilters {
  search: string
  method: string
  status: string
  source: string
  dateRange: string
  userId: string
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

export default function APILogsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<APILog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<APILog[]>([])
  const [selectedLog, setSelectedLog] = useState<APILog | null>(null)
  const [showLogDetail, setShowLogDetail] = useState(false)
  const [liveMode, setLiveMode] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const [filters, setFilters] = useState<LogFilters>({
    search: "",
    method: "all",
    status: "all",
    source: "all",
    dateRange: "1h",
    userId: ""
  })

  // Mock data - replace with real API calls
  const generateMockLogs = (): APILog[] => {
    const methods: APILog["method"][] = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    const endpoints = [
      "/webhook/chat",
      "/api/requests",
      "/api/users", 
      "/api/providers",
      "/api/dashboard/stats",
      "/api/notifications",
      "/api/auth/login",
      "/api/settings/admin",
      "/api/tracking/REQ-000001",
      "/api/services/search"
    ]
    const sources: APILog["source"][] = ["web", "mobile", "api", "webhook"]
    const statuses = [200, 201, 400, 401, 403, 404, 500, 502]
    
    return Array.from({ length: 50 }, (_, i) => {
      const method = methods[Math.floor(Math.random() * methods.length)]
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const duration = Math.floor(Math.random() * 2000) + 10
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      
      return {
        id: `log-${i + 1}`,
        timestamp,
        method,
        endpoint,
        status,
        duration,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: Math.random() > 0.5 ? 
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" :
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)",
        userId: Math.random() > 0.7 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
        size: Math.floor(Math.random() * 5000) + 100,
        source: sources[Math.floor(Math.random() * sources.length)],
        requestBody: method !== "GET" ? { data: "sample request" } : undefined,
        responseBody: status < 400 ? { success: true, data: "sample response" } : undefined,
        error: status >= 400 ? "Sample error message" : undefined
      }
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  useEffect(() => {
    loadLogs()
  }, [])

  // Live mode effect
  useEffect(() => {
    if (liveMode) {
      const interval = setInterval(() => {
        addNewLog()
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [liveMode])

  // Filter logs effect
  useEffect(() => {
    let filtered = [...logs]
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(log => 
        log.endpoint.toLowerCase().includes(search) ||
        log.ip.includes(search) ||
        log.userId?.toLowerCase().includes(search)
      )
    }
    
    if (filters.method !== "all") {
      filtered = filtered.filter(log => log.method === filters.method)
    }
    
    if (filters.status !== "all") {
      if (filters.status === "2xx") {
        filtered = filtered.filter(log => log.status >= 200 && log.status < 300)
      } else if (filters.status === "4xx") {
        filtered = filtered.filter(log => log.status >= 400 && log.status < 500)
      } else if (filters.status === "5xx") {
        filtered = filtered.filter(log => log.status >= 500)
      }
    }
    
    if (filters.source !== "all") {
      filtered = filtered.filter(log => log.source === filters.source)
    }
    
    if (filters.userId) {
      filtered = filtered.filter(log => log.userId?.includes(filters.userId))
    }
    
    setFilteredLogs(filtered)
  }, [logs, filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockLogs = generateMockLogs()
      setLogs(mockLogs)
      
    } catch (error) {
      console.error("Failed to load logs:", error)
      toast.error("Erreur lors du chargement des logs")
    } finally {
      setLoading(false)
    }
  }

  const addNewLog = () => {
    const newLog: APILog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      method: "POST",
      endpoint: "/webhook/chat",
      status: Math.random() > 0.8 ? 500 : 200,
      duration: Math.floor(Math.random() * 500) + 50,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      size: Math.floor(Math.random() * 2000) + 200,
      source: "webhook",
      requestBody: { message: "Test real-time log" },
      responseBody: { success: true }
    }
    
    setLogs(prev => [newLog, ...prev.slice(0, 99)]) // Keep only last 100 logs
    
    // Auto-scroll to top in live mode
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const clearLogs = () => {
    setLogs([])
    setFilteredLogs([])
    toast.success("Logs effacés")
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = `api-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success("Logs exportés")
  }

  const getStatusColor = (status: number) => {
    if (status < 300) return "text-green-400"
    if (status < 400) return "text-blue-400"
    if (status < 500) return "text-yellow-400"
    return "text-red-400"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500/20 text-green-400"
      case "POST": return "bg-blue-500/20 text-blue-400"
      case "PUT": return "bg-yellow-500/20 text-yellow-400"
      case "DELETE": return "bg-red-500/20 text-red-400"
      case "PATCH": return "bg-purple-500/20 text-purple-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "web": return <Globe className="w-4 h-4" />
      case "mobile": return <Smartphone className="w-4 h-4" />
      case "api": return <Server className="w-4 h-4" />
      case "webhook": return <Terminal className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  // Check if user has admin permissions
  if (!user || (user.role !== "admin" && !user.permissions?.includes("system:logs"))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès Refusé</h2>
            <p className="text-gray-300 mb-4">Vous n'avez pas les permissions nécessaires pour accéder aux logs API.</p>
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
                <Terminal className="w-5 h-5 text-green-400" />
                <h1 className="text-lg font-semibold text-white">Logs API</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={liveMode ? "default" : "secondary"} className="text-xs">
                {liveMode ? (
                  <>
                    <Activity className="w-3 h-3 mr-1 animate-pulse" />
                    Live
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                )}
              </Badge>
              <Button
                size="sm"
                variant={liveMode ? "destructive" : "default"}
                onClick={() => setLiveMode(!liveMode)}
              >
                {liveMode ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Live
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={loadLogs}
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
          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{filteredLogs.length}</div>
                    <div className="text-xs text-gray-400">Total Logs</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {filteredLogs.filter(log => log.status < 300).length}
                    </div>
                    <div className="text-xs text-gray-400">Succès (2xx)</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {filteredLogs.filter(log => log.status >= 400 && log.status < 500).length}
                    </div>
                    <div className="text-xs text-gray-400">Erreurs (4xx)</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {filteredLogs.filter(log => log.status >= 500).length}
                    </div>
                    <div className="text-xs text-gray-400">Serveur (5xx)</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.round(filteredLogs.reduce((acc, log) => acc + log.duration, 0) / filteredLogs.length || 0)}ms
                    </div>
                    <div className="text-xs text-gray-400">Temps Moyen</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Rechercher par endpoint, IP, user ID..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  
                  <Select
                    value={filters.method}
                    onValueChange={(value) => setFilters({ ...filters, method: value })}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="2xx">2xx Succès</SelectItem>
                      <SelectItem value="4xx">4xx Erreurs</SelectItem>
                      <SelectItem value="5xx">5xx Serveur</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.source}
                    onValueChange={(value) => setFilters({ ...filters, source: value })}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={exportLogs}
                      className="bg-black/20 border-white/10 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearLogs}
                      className="bg-black/20 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Effacer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Logs List */}
          <motion.div variants={itemVariants}>
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Logs en Temps Réel
                  </CardTitle>
                  <Badge variant="outline" className="text-gray-300">
                    {filteredLogs.length} entrées
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96" ref={scrollAreaRef}>
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded border border-white/10">
                          <Skeleton className="w-16 h-4" />
                          <Skeleton className="w-12 h-4" />
                          <Skeleton className="flex-1 h-4" />
                          <Skeleton className="w-20 h-4" />
                          <Skeleton className="w-16 h-4" />
                        </div>
                      ))}
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Aucun log trouvé</h3>
                      <p className="text-gray-400">Ajustez vos filtres ou attendez de nouvelles requêtes.</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-1">
                      {filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedLog(log)
                            setShowLogDetail(true)
                          }}
                        >
                          <div className="flex items-center gap-2 w-24">
                            <Badge className={`${getMethodColor(log.method)} text-xs font-mono`}>
                              {log.method}
                            </Badge>
                          </div>
                          
                          <div className="w-16">
                            <Badge 
                              variant="outline"
                              className={`${getStatusColor(log.status)} border-current text-xs font-mono`}
                            >
                              {log.status}
                            </Badge>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-mono text-sm truncate">
                              {log.endpoint}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {log.ip} • {log.duration}ms
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getSourceIcon(log.source)}
                            <span className="text-xs text-gray-400 capitalize">{log.source}</span>
                          </div>
                          
                          <div className="w-20 text-xs text-gray-400 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                          
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Log Detail Modal */}
      <Dialog open={showLogDetail} onOpenChange={setShowLogDetail}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Détails du Log
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedLog && `${selectedLog.method} ${selectedLog.endpoint} - ${selectedLog.status}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="request">Requête</TabsTrigger>
                <TabsTrigger value="response">Réponse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Méthode</div>
                      <Badge className={getMethodColor(selectedLog.method)}>{selectedLog.method}</Badge>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <Badge variant="outline" className={`${getStatusColor(selectedLog.status)} border-current`}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Durée</div>
                      <div className="text-white font-mono">{selectedLog.duration}ms</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">IP</div>
                      <div className="text-white font-mono">{selectedLog.ip}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Source</div>
                      <div className="flex items-center gap-2">
                        {getSourceIcon(selectedLog.source)}
                        <span className="text-white capitalize">{selectedLog.source}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Taille</div>
                      <div className="text-white font-mono">{selectedLog.size} bytes</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Endpoint</div>
                  <div className="text-white font-mono break-all">{selectedLog.endpoint}</div>
                </div>
                
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">User Agent</div>
                  <div className="text-white text-sm break-all">{selectedLog.userAgent}</div>
                </div>
                
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Timestamp</div>
                  <div className="text-white font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
              </TabsContent>
              
              <TabsContent value="request" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-2">Corps de la requête</div>
                    <pre className="text-white text-sm overflow-x-auto">
                      {selectedLog.requestBody ? 
                        JSON.stringify(selectedLog.requestBody, null, 2) : 
                        "Aucun corps de requête"
                      }
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="response" className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="bg-white/5 p-4 rounded border border-white/10">
                    <div className="text-xs text-gray-400 mb-2">Corps de la réponse</div>
                    <pre className="text-white text-sm overflow-x-auto">
                      {selectedLog.responseBody ? 
                        JSON.stringify(selectedLog.responseBody, null, 2) : 
                        selectedLog.error || "Aucune réponse"
                      }
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, XCircle, Search, Eye, Archive, Trash2, AlertCircle, Info, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { usePagination } from "@/hooks/use-pagination"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { Skeleton } from "@/components/ui/skeleton"

interface Alert {
  id: string
  title: string
  message: string
  type: "error" | "warning" | "info" | "success"
  priority: "low" | "medium" | "high" | "critical"
  status: "active" | "resolved" | "archived"
  source: string
  timestamp: Date
  assignee?: string
}


const getAlertIcon = (type: Alert["type"]) => {
  switch (type) {
    case "error":
      return <XCircle className="w-4 h-4 text-red-400" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    case "info":
      return <Info className="w-4 h-4 text-blue-400" />
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />
  }
}

const getPriorityBadge = (priority: Alert["priority"]) => {
  const variants = {
    low: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
  }

  return (
    <Badge variant="outline" className={`${variants[priority]} border`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

const getStatusBadge = (status: Alert["status"]) => {
  const variants = {
    active: "bg-red-500/20 text-red-300 border-red-500/30",
    resolved: "bg-green-500/20 text-green-300 border-green-500/30",
    archived: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  }

  return (
    <Badge variant="outline" className={`${variants[status]} border`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "À l'instant"
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
  if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`
  return `Il y a ${Math.floor(diffInMinutes / 1440)}j`
}

export function AlertsTable() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.request('/api/system/alerts', {
          method: 'GET',
          requireAuth: false
        })
        
        if (response.success && response.data) {
          setAlerts(response.data)
        } else {
          throw new Error('Failed to fetch alerts')
        }
      } catch (err) {
        logger.error('Error fetching alerts:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Set fallback alerts for better UX
        setAlerts([
          {
            id: "1",
            title: "Système opérationnel",
            message: "Tous les systèmes fonctionnent normalement",
            type: "success",
            priority: "low",
            status: "active",
            source: "System",
            timestamp: new Date(),
            assignee: "Auto",
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleAlertAction = async (alertId: string, action: 'resolve' | 'archive' | 'delete') => {
    try {
      await apiClient.request(`/api/system/alerts/${alertId}/${action}`, {
        method: 'POST',
        requireAuth: false
      })
      
      // Update local state
      setAlerts(prev => {
        if (action === 'delete') {
          return prev.filter(alert => alert.id !== alertId)
        }
        return prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: action === 'resolve' ? 'resolved' : 'archived' as Alert['status'] }
            : alert
        )
      })
      
      logger.info(`Alert ${alertId} ${action}ed successfully`)
    } catch (err) {
      logger.error(`Error ${action}ing alert:`, err)
    }
  }

  // Filtrage des alertes
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || alert.status === statusFilter
      const matchesType = typeFilter === "all" || alert.type === typeFilter
      const matchesPriority = priorityFilter === "all" || alert.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesType && matchesPriority
    })
  }, [searchTerm, statusFilter, typeFilter, priorityFilter])

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    startIndex,
    endIndex,
  } = usePagination(filteredAlerts, 10)

  const activeAlertsCount = alerts.filter((alert) => alert.status === "active").length

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Alertes Système
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start gap-3 flex-1">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Alertes Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-2">Erreur lors du chargement des alertes</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Alertes Système
            </CardTitle>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{activeAlertsCount} actives</Badge>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher dans les alertes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="warning">Alerte</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tableau des alertes */}
        <div className="space-y-2">
          {paginatedItems.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium truncate">{alert.title}</h4>
                    {getPriorityBadge(alert.priority)}
                    {getStatusBadge(alert.status)}
                  </div>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                    {alert.assignee && <span>Assigné à: {alert.assignee}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => logger.info('View alert:', alert.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => handleAlertAction(alert.id, 'archive')}
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-red-400"
                  onClick={() => handleAlertAction(alert.id, 'delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucune alerte */}
        {paginatedItems.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucune alerte trouvée</p>
          </div>
        )}

        {/* Pagination */}
        {filteredAlerts.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
              onFirstPage={goToFirstPage}
              onLastPage={goToLastPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={filteredAlerts.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

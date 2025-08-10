"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequestsTable } from "@/components/features/requests/requests-table"
import { RequestsStats } from "@/components/features/requests/requests-stats"
import { useRequestsData } from "@/hooks/use-requests-data"
import { Search, Filter, Plus, Download, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import React from "react"

export default function RequestsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    priority: "all",
    serviceType: "all",
    location: "all",
    dateRange: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Memoize the filters object to prevent infinite re-renders
  const memoizedFilters = useMemo(() => {
    const baseFilters: any = {
      page: currentPage,
      limit: 10,
    }

    // Only add non-default values to prevent unnecessary re-renders
    if (searchQuery.trim()) {
      baseFilters.search = searchQuery.trim()
    }

    if (activeTab !== "all") {
      baseFilters.status = activeTab
    }

    // Only add filters that are not "all"
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "all") {
        baseFilters[key] = value
      }
    })

    return baseFilters
  }, [activeTab, searchQuery, filters, currentPage])

  // Use the memoized filters in the hook
  const { 
    data,
    loading, 
    error, 
    refetch, 
    updateRequest, 
    assignRequest, 
    cancelRequest,
    exportRequests 
  } = useRequestsData(memoizedFilters)

  // Extract data with proper fallbacks
  const requests = data?.requests || []
  const stats = data?.stats || null
  const pagination = {
    page: data?.page || currentPage,
    totalPages: data?.totalPages || 1,
    total: data?.total || 0
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1) // Reset to first page when changing tabs
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast({
        title: "Données actualisées",
        description: "Les demandes ont été mises à jour avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données.",
        variant: "destructive",
      })
    }
  }, [refetch, toast])

  const handleExport = useCallback(async () => {
    try {
      toast({
        title: "Export en cours",
        description: "Le fichier sera téléchargé dans quelques instants.",
      })
      await exportRequests("csv")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      })
    }
  }, [exportRequests, toast])

  const handleNewRequest = useCallback(() => {
    toast({
      title: "Nouvelle demande",
      description: "Fonctionnalité en cours de développement.",
    })
  }, [toast])

  const clearFilter = useCallback((key: string) => {
    if (key === "search") {
      setSearchQuery("")
    } else {
      handleFilterChange(key, "all")
    }
  }, [handleFilterChange])

  const clearAllFilters = useCallback(() => {
    setSearchQuery("")
    setFilters({
      priority: "all",
      serviceType: "all",
      location: "all",
      dateRange: "all",
    })
    setActiveTab("all")
    setCurrentPage(1)
  }, [])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (activeTab !== "all") count++
    Object.values(filters).forEach(value => {
      if (value !== "all") count++
    })
    return count
  }, [searchQuery, activeTab, filters])

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">Impossible de charger les demandes. Veuillez réessayer.</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demandes</h1>
          <p className="text-gray-600 mt-1">Gérez toutes les demandes de services</p>
          {activeFiltersCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleNewRequest} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <RequestsStats stats={stats} loading={loading} />

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres et recherche
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button 
                onClick={clearAllFilters} 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Effacer tout ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par client, service, zone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange("serviceType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                <SelectItem value="Électricité">Électricité</SelectItem>
                <SelectItem value="Plomberie">Plomberie</SelectItem>
                <SelectItem value="Ménage">Ménage</SelectItem>
                <SelectItem value="Jardinage">Jardinage</SelectItem>
                <SelectItem value="Électroménager">Électroménager</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                <SelectItem value="Bonamoussadi">Bonamoussadi</SelectItem>
                <SelectItem value="Akwa">Akwa</SelectItem>
                <SelectItem value="Deido">Deido</SelectItem>
                <SelectItem value="Bonapriso">Bonapriso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Badges des filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Recherche: {searchQuery}
                  <button 
                    onClick={() => clearFilter("search")} 
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {Object.entries(filters).map(
                ([key, value]) =>
                  value !== "all" && (
                    <Badge key={key} variant="secondary" className="flex items-center gap-1">
                      {key}: {value}
                      <button
                        onClick={() => clearFilter(key)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets par statut */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            Toutes
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assignées
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.assigned}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            En cours
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.inProgress}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminées
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.completed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Annulées
            {stats && (
              <Badge variant="secondary" className="ml-2">
                {stats.cancelled}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <RequestsTable
            requests={requests}
            loading={loading}
            pagination={pagination}
            onUpdateRequest={updateRequest}
            onAssignRequest={assignRequest}
            onCancelRequest={cancelRequest}
            onPageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
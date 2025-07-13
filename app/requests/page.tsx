"use client"

import { useState } from "react"
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

export default function RequestsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    service: "all",
    zone: "all",
    dateRange: "all",
  })

  const { requests, stats, loading, error, pagination, refetch, updateRequest, assignRequest, cancelRequest } =
    useRequestsData({
      page: 1,
      limit: 10,
      search: searchQuery,
      status: activeTab === "all" ? "" : activeTab,
      ...filters,
    })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleRefresh = async () => {
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
  }

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Le fichier sera téléchargé dans quelques instants.",
    })
  }

  const handleNewRequest = () => {
    toast({
      title: "Nouvelle demande",
      description: "Fonctionnalité en cours de développement.",
    })
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">Impossible de charger les demandes. Veuillez réessayer.</p>
              <Button onClick={refetch} variant="outline">
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
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
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
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres et recherche
          </CardTitle>
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
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.service} onValueChange={(value) => handleFilterChange("service", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                <SelectItem value="electricite">Électricité</SelectItem>
                <SelectItem value="plomberie">Plomberie</SelectItem>
                <SelectItem value="menage">Ménage</SelectItem>
                <SelectItem value="jardinage">Jardinage</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.zone} onValueChange={(value) => handleFilterChange("zone", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                <SelectItem value="bonamoussadi-centre">Bonamoussadi Centre</SelectItem>
                <SelectItem value="bonamoussadi-nord">Bonamoussadi Nord</SelectItem>
                <SelectItem value="bonamoussadi-sud">Bonamoussadi Sud</SelectItem>
                <SelectItem value="bonamoussadi-est">Bonamoussadi Est</SelectItem>
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
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Recherche: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
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
                      onClick={() => handleFilterChange(key, "all")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                ),
            )}
          </div>
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
          <TabsTrigger value="in_progress">
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
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Search, Filter, X, Calendar, MapPin, AlertTriangle, Wrench } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RequestsFilters {
  search: string
  serviceType: string
  location: string
  priority: string
  dateRange: string
  status?: string
}

interface RequestsFiltersProps {
  filters: RequestsFilters
  onFiltersChange: (filters: Partial<RequestsFilters>) => void
  onResetFilters: () => void
  resultsCount: number
  isLoading?: boolean
}

const serviceTypes = [
  { value: "all", label: "Tous les services" },
  { value: "Plomberie", label: "Plomberie" },
  { value: "Électricité", label: "Électricité" },
  { value: "Ménage", label: "Ménage" },
  { value: "Jardinage", label: "Jardinage" },
  { value: "Peinture", label: "Peinture" },
  { value: "Réparation", label: "Réparation" },
]

const locations = [
  { value: "all", label: "Toutes les villes" },
  { value: "Paris", label: "Paris" },
  { value: "Lyon", label: "Lyon" },
  { value: "Marseille", label: "Marseille" },
  { value: "Toulouse", label: "Toulouse" },
  { value: "Nice", label: "Nice" },
  { value: "Nantes", label: "Nantes" },
]

const priorities = [
  { value: "all", label: "Toutes les priorités" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "Haute" },
  { value: "normal", label: "Normale" },
  { value: "low", label: "Basse" },
]

const statuses = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "assigned", label: "Assignée" },
  { value: "in-progress", label: "En cours" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
]

const dateRanges = [
  { value: "all", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
]

export function RequestsFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  resultsCount,
  isLoading = false,
}: RequestsFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.serviceType !== "all") count++
    if (filters.location !== "all") count++
    if (filters.priority !== "all") count++
    if (filters.dateRange !== "all") count++
    if (filters.status && filters.status !== "all") count++
    return count
  }

  const getActiveFiltersBadges = () => {
    const badges = []

    if (filters.search) {
      badges.push({
        key: "search",
        label: `Recherche: "${filters.search}"`,
        onRemove: () => onFiltersChange({ search: "" }),
      })
    }

    if (filters.serviceType !== "all") {
      const serviceType = serviceTypes.find((s) => s.value === filters.serviceType)
      badges.push({
        key: "serviceType",
        label: `Service: ${serviceType?.label}`,
        onRemove: () => onFiltersChange({ serviceType: "all" }),
      })
    }

    if (filters.location !== "all") {
      const location = locations.find((l) => l.value === filters.location)
      badges.push({
        key: "location",
        label: `Ville: ${location?.label}`,
        onRemove: () => onFiltersChange({ location: "all" }),
      })
    }

    if (filters.priority !== "all") {
      const priority = priorities.find((p) => p.value === filters.priority)
      badges.push({
        key: "priority",
        label: `Priorité: ${priority?.label}`,
        onRemove: () => onFiltersChange({ priority: "all" }),
      })
    }

    if (filters.status && filters.status !== "all") {
      const status = statuses.find((s) => s.value === filters.status)
      badges.push({
        key: "status",
        label: `Statut: ${status?.label}`,
        onRemove: () => onFiltersChange({ status: "all" }),
      })
    }

    if (filters.dateRange !== "all") {
      const dateRange = dateRanges.find((d) => d.value === filters.dateRange)
      badges.push({
        key: "dateRange",
        label: `Période: ${dateRange?.label}`,
        onRemove: () => onFiltersChange({ dateRange: "all" }),
      })
    }

    return badges
  }

  const activeFiltersCount = getActiveFiltersCount()
  const activeFiltersBadges = getActiveFiltersBadges()

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <div className="p-6 space-y-4">
        {/* Barre de recherche principale */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, service, description, localisation..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-slate-800 border-slate-700" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">Filtres avancés</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="text-slate-400 hover:text-white"
                      >
                        Réinitialiser
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1 block">
                        <Wrench className="w-4 h-4 inline mr-1" />
                        Type de service
                      </label>
                      <Select
                        value={filters.serviceType}
                        onValueChange={(value) => onFiltersChange({ serviceType: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-white">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1 block">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Localisation
                      </label>
                      <Select value={filters.location} onValueChange={(value) => onFiltersChange({ location: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {locations.map((location) => (
                            <SelectItem key={location.value} value={location.value} className="text-white">
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1 block">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Priorité
                      </label>
                      <Select value={filters.priority} onValueChange={(value) => onFiltersChange({ priority: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value} className="text-white">
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1 block">Statut</label>
                      <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => onFiltersChange({ status: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value} className="text-white">
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1 block">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Période
                      </label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) => onFiltersChange({ dateRange: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {dateRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value} className="text-white">
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>

        {/* Badges des filtres actifs */}
        {activeFiltersBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFiltersBadges.map((badge) => (
              <Badge
                key={badge.key}
                variant="secondary"
                className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer"
                onClick={badge.onRemove}
              >
                {badge.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Résultats */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {isLoading ? (
              "Chargement..."
            ) : (
              <>
                {resultsCount} demande{resultsCount !== 1 ? "s" : ""} trouvée{resultsCount !== 1 ? "s" : ""}
                {activeFiltersCount > 0 && " (filtrées)"}
              </>
            )}
          </span>
        </div>
      </div>
    </Card>
  )
}

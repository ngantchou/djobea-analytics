"use client"

import styled from "styled-components"
import { Download, RefreshCw, X, Calendar, MapPin, User, Wrench, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useAnalyticsExport } from "@/hooks/use-analytics-data"

const FiltersContainer = styled(Card)`
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.3);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`

const FiltersContent = styled(CardContent)`
  padding: 1.5rem;
`

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const FilterLabel = styled.label`
  color: rgb(156, 163, 175);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const ActionsGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`

const PeriodButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const PeriodButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: 1px solid rgb(75, 85, 99);
  background: ${(props) => (props.active ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "transparent")};
  color: ${(props) => (props.active ? "white" : "rgb(156, 163, 175)")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    transition: left 0.3s ease;
    z-index: -1;
  }

  &:hover::before {
    left: 0;
  }

  &:hover {
    color: white;
    border-color: transparent;
  }
`

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const FilterBadge = styled(Badge)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      opacity: 0.7;
    }
  }
`

interface AnalyticsFiltersProps {
  period: string
  onPeriodChange: (period: string) => void
  onFiltersChange?: (filters: any) => void
}

interface FilterState {
  period: string
  serviceType: string
  zone: string
  provider: string
  dateRange: { from: Date | undefined; to: Date | undefined }
  priority: string[]
  status: string[]
  minAmount: string
  maxAmount: string
  customPeriod: boolean
}

export function AnalyticsFilters({ period, onPeriodChange, onFiltersChange }: AnalyticsFiltersProps) {
  const { exportData, isExporting } = useAnalyticsExport()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    period,
    serviceType: "all",
    zone: "all",
    provider: "all",
    dateRange: { from: undefined, to: undefined },
    priority: [],
    status: [],
    minAmount: "",
    maxAmount: "",
    customPeriod: false,
  })

  const [availableProviders, setAvailableProviders] = useState<Array<{ id: string; name: string }>>([])
  const [availableZones, setAvailableZones] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    setFilters((prev) => ({ ...prev, period }))
  }, [period])

  useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const fetchFilterOptions = async () => {
    try {
      const [providersRes, zonesRes] = await Promise.all([fetch("/api/providers?active=true"), fetch("/api/zones")])

      if (providersRes.ok) {
        const providers = await providersRes.json()
        setAvailableProviders(providers.data || [])
      }

      if (zonesRes.ok) {
        const zones = await zonesRes.json()
        setAvailableZones(zones.data || [])
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const periodOptions = [
    { key: "24h", label: "24 heures" },
    { key: "7d", label: "7 jours" },
    { key: "30d", label: "30 jours" },
    { key: "90d", label: "90 jours" },
    { key: "1y", label: "1 an" },
    { key: "custom", label: "Personnalisé" },
  ]

  const serviceTypes = [
    { value: "all", label: "Tous les services" },
    { value: "plomberie", label: "Plomberie" },
    { value: "electricite", label: "Électricité" },
    { value: "electromenager", label: "Électroménager" },
    { value: "climatisation", label: "Climatisation" },
    { value: "menuiserie", label: "Menuiserie" },
    { value: "peinture", label: "Peinture" },
  ]

  const handlePeriodChange = (newPeriod: string) => {
    onPeriodChange(newPeriod)
    setFilters((prev) => ({
      ...prev,
      period: newPeriod,
      customPeriod: newPeriod === "custom",
    }))
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleExport = async () => {
    try {
      await exportData("csv", period, { filters })
      toast.success("Export réussi", {
        description: "Les données filtrées ont été exportées",
      })
    } catch (error) {
      toast.error("Erreur d'export", {
        description: "Impossible d'exporter les données",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/analytics/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      })

      if (!response.ok) throw new Error("Refresh failed")

      toast.success("Données actualisées", {
        description: "Les analytics ont été mis à jour avec les filtres",
      })
    } catch (error) {
      toast.error("Erreur d'actualisation", {
        description: "Impossible d'actualiser les données",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/analytics?period=${period}&filters=${encodeURIComponent(JSON.stringify(filters))}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Lien copié", {
        description: "Le lien de partage a été copié dans le presse-papiers",
      })
    } catch (error) {
      toast.error("Erreur de partage", {
        description: "Impossible de copier le lien",
      })
    }
  }

  const resetFilters = () => {
    const resetState: FilterState = {
      period: "7d",
      serviceType: "all",
      zone: "all",
      provider: "all",
      dateRange: { from: undefined, to: undefined },
      priority: [],
      status: [],
      minAmount: "",
      maxAmount: "",
      customPeriod: false,
    }
    setFilters(resetState)
    onPeriodChange("7d")
    toast.success("Filtres réinitialisés")
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.serviceType !== "all") count++
    if (filters.zone !== "all") count++
    if (filters.provider !== "all") count++
    if (filters.priority.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.minAmount || filters.maxAmount) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    return count
  }

  const removeFilter = (filterKey: string, value?: string) => {
    switch (filterKey) {
      case "serviceType":
      case "zone":
      case "provider":
      case "minAmount":
      case "maxAmount":
        handleFilterChange(filterKey as keyof FilterState, "all")
        break
      case "priority":
      case "status":
        if (value) {
          const currentValues = filters[filterKey as "priority" | "status"]
          handleFilterChange(
            filterKey as keyof FilterState,
            currentValues.filter((v) => v !== value),
          )
        } else {
          handleFilterChange(filterKey as keyof FilterState, [])
        }
        break
      case "dateRange":
        handleFilterChange("dateRange", { from: undefined, to: undefined })
        break
    }
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <FiltersContainer>
        <FiltersContent>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>
                <Calendar />
                Période d'analyse
              </FilterLabel>
              <PeriodButtons>
                {periodOptions.map((option) => (
                  <PeriodButton
                    key={option.key}
                    active={filters.period === option.key}
                    onClick={() => handlePeriodChange(option.key)}
                  >
                    {option.label}
                  </PeriodButton>
                ))}
              </PeriodButtons>
              {filters.customPeriod && (
                <div className="mt-2">
                  <DatePickerWithRange
                    date={filters.dateRange}
                    onDateChange={(dateRange) => handleFilterChange("dateRange", dateRange)}
                  />
                </div>
              )}
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <Wrench />
                Type de service
              </FilterLabel>
              <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange("serviceType", value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Sélectionner un service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <MapPin />
                Zone géographique
              </FilterLabel>
              <Select value={filters.zone} onValueChange={(value) => handleFilterChange("zone", value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Sélectionner une zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les zones</SelectItem>
                  {availableZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>
                <User />
                Prestataire
              </FilterLabel>
              <Select value={filters.provider} onValueChange={(value) => handleFilterChange("provider", value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Sélectionner un prestataire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prestataires</SelectItem>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>
          </FiltersGrid>

          {activeFiltersCount > 0 && (
            <ActiveFilters>
              {filters.serviceType !== "all" && (
                <FilterBadge>
                  Service: {serviceTypes.find((s) => s.value === filters.serviceType)?.label}
                  <button onClick={() => removeFilter("serviceType")}>
                    <X className="w-3 h-3" />
                  </button>
                </FilterBadge>
              )}
              {filters.zone !== "all" && (
                <FilterBadge>
                  Zone: {availableZones.find((z) => z.id === filters.zone)?.name}
                  <button onClick={() => removeFilter("zone")}>
                    <X className="w-3 h-3" />
                  </button>
                </FilterBadge>
              )}
              {filters.provider !== "all" && (
                <FilterBadge>
                  Prestataire: {availableProviders.find((p) => p.id === filters.provider)?.name}
                  <button onClick={() => removeFilter("provider")}>
                    <X className="w-3 h-3" />
                  </button>
                </FilterBadge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent"
              >
                Réinitialiser
              </Button>
            </ActiveFilters>
          )}

          <ActionsGroup>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent"
            >
              <Download className={`w-4 h-4 mr-2 ${isExporting ? "animate-spin" : ""}`} />
              {isExporting ? "Export..." : "Exporter"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </ActionsGroup>
        </FiltersContent>
      </FiltersContainer>
    </motion.div>
  )
}

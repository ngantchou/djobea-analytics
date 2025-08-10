"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  Navigation,
  Zap,
  Users,
  Search,
  Layers,
  Filter,
  MapIcon,
  Building2,
  ArrowRight,
  Eye,
  Phone,
  MessageCircle,
  Star,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

// Define interfaces for the API response
interface GeoLocation {
  region: string
  requests: number
  providers: number
  revenue: number
  satisfaction: number
  responseTime: number
  coordinates: [number, number]
  growth: number
  marketShare: number
}

interface GeoSummary {
  totalRegions: number
  totalRequests: number
  totalProviders: number
  totalRevenue: number
  averageSatisfaction: number
}

interface GeoResponse {
  success: boolean
  data: GeoLocation[]
  summary: GeoSummary
  message: string
}

interface RegionData {
  id: string
  name: string
  requests: number
  providers: number
  revenue: number
  satisfaction: number
  responseTime: number
  coordinates: { lat: number; lng: number }
  growth: number
  marketShare: number
  color: string
  city: string
}

interface City {
  id: string
  name: string
  center: { lat: number; lng: number }
  regions: string[]
  requests: number
  providers: number
  revenue: number
}

interface InteractiveMapProps {
  compact?: boolean
}

export function InteractiveMap({ compact = false }: InteractiveMapProps) {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null)
  const [mapType, setMapType] = useState<"satellite" | "roadmap" | "terrain">("roadmap")
  const [showTraffic, setShowTraffic] = useState(false)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showZones, setShowZones] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "providers" | "requests">("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedZone, setSelectedZone] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"city" | "region">("region")
  const [regions, setRegions] = useState<RegionData[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [period, setPeriod] = useState("30d")
  const [level, setLevel] = useState("city")

  // Colors for regions
  const regionColors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#F97316", // orange
  ]

  // Load geographic data from API
  useEffect(() => {
    const loadGeolocationData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data from your API
        const response = await apiClient.getGeolocationData()
        
        if (response.success && response.data) {
          // Process regions
          const apiRegions = response.data?.map((item: GeoLocation, index: number) => {
            // Create a unique ID from the region name
            const id = item.region.toLowerCase().replace(/[^a-z0-9]/g, "-")
            
            return {
              id,
              name: item.region,
              requests: item.requests,
              providers: item.providers,
              revenue: item.revenue,
              satisfaction: item.satisfaction,
              responseTime: item.responseTime,
              coordinates: { lat: item.coordinates[0], lng: item.coordinates[1] },
              growth: item.growth,
              marketShare: item.marketShare,
              color: regionColors[index % regionColors.length],
              // City will be extracted from database data
              city: item.region.split(',')[0] || item.region,
            }
          })
          
          setRegions(apiRegions)
          
          // Extract cities from regions
          const citiesMap = new Map<string, City>()
          
          apiRegions.forEach((region: { city: string; coordinates: any; id: string; requests: number; providers: number; revenue: number }) => {
            const cityName = region.city
            if (!cityName) return // Skip regions without city data
            const cityId = cityName.toLowerCase().replace(/[^a-z0-9]/g, "-")
            
            if (!citiesMap.has(cityId)) {
              citiesMap.set(cityId, {
                id: cityId,
                name: cityName,
                center: region.coordinates, // Use the coordinates of the first region in this city
                regions: [region.id],
                requests: region.requests,
                providers: region.providers,
                revenue: region.revenue,
              })
            } else {
              const city = citiesMap.get(cityId)!
              city.regions.push(region.id)
              city.requests += region.requests
              city.providers += region.providers
              city.revenue += region.revenue
            }
          })
          
          setCities(Array.from(citiesMap.values()))
        } else {
          logger.error("Invalid API response format", response)
          setRegions([])
          setCities([])
        }
      } catch (error) {
        logger.error("Error loading geolocation data:", error)
        setRegions([])
        setCities([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadGeolocationData()
  }, [period, level])
  

  // Filtering logic
  const filteredRegions = regions.filter(region => {
    const matchesCity = selectedCity === "all" || region.city.toLowerCase() === selectedCity
    const matchesZone = selectedZone === "all" || region.id === selectedZone
    const matchesSearch = !searchQuery || 
      region.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by type (providers or requests)
    const matchesType = filterType === "all" || 
      (filterType === "providers" && region.providers > 0) ||
      (filterType === "requests" && region.requests > 0)
    
    return matchesCity && matchesZone && matchesSearch && matchesType
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Navigation handlers
  const handleViewFullMap = () => {
    logger.logUserAction("view_full_map")
    router.push("/map")
  }

  const handleRegionClick = (region: RegionData) => {
    setSelectedRegion(region)
    setDetailsOpen(true)
  }

  const handleViewProviders = (regionId: string) => {
    logger.logUserAction("view_providers", { regionId })
    router.push(`/providers?region=${regionId}`)
  }

  const handleViewRequests = (regionId: string) => {
    logger.logUserAction("view_requests", { regionId })
    router.push(`/requests?region=${regionId}`)
  }

  // Get color based on growth
  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-500" : "text-red-500"
  }

  // Compact view for small widgets
  if (compact) {
    return (
      <div className="h-full relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-950 to-green-950">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2 text-white">Carte Géographique</h3>
            <p className="text-gray-300 mb-4">{regions.length} régions actives</p>

            {/* Top regions */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {regions.slice(0, 6).map((region, index) => (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-blue-500 hover:bg-blue-600 rounded-full p-2 cursor-pointer hover:scale-110 transition-transform`}
                  onClick={() => handleRegionClick(region)}
                >
                  <span className="text-xs text-white font-bold">{region.requests}</span>
                </motion.div>
              ))}
            </div>

            <Button onClick={handleViewFullMap} className="bg-blue-600 hover:bg-blue-700" size="sm">
              Voir Carte Complète
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 border">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Demandes: {regions.reduce((acc, r) => acc + r.requests, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Revenus: {formatCurrency(regions.reduce((acc, r) => acc + r.revenue, 0))}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Map controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapIcon className="w-5 h-5 text-blue-500" />
            Cartographie - Analyse Géographique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="mb-4">
            <TabsList className="bg-gray-900/50">
              <TabsTrigger value="region" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300">
                <Layers className="w-4 h-4 mr-2" />
                Par Région
              </TabsTrigger>
              <TabsTrigger value="city" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300">
                <Building2 className="w-4 h-4 mr-2" />
                Par Ville
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une région..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 placeholder:text-gray-500"
              />
            </div>

            {/* City filter */}
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} ({city.regions.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Region filter */}
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type filter */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="providers">Prestataires</SelectItem>
                <SelectItem value="requests">Demandes</SelectItem>
              </SelectContent>
            </Select>

            {/* Period filter */}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main map */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] bg-gray-800/50 border-gray-700">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full bg-gradient-to-br from-blue-950 to-green-950 rounded-lg relative overflow-hidden">
                {/* Region distribution visualization */}
                <div className="absolute inset-0">
                  {filteredRegions.map((region, index) => {
                    const size = (region.requests / Math.max(...regions.map(r => r.requests))) * 100
                    const minSize = 15
                    const maxSize = 30
                    const adjustedSize = Math.max(minSize, Math.min(maxSize, size))
                    
                    // Position based on index for visualization
                    const col = index % 4
                    const row = Math.floor(index / 4)
                    
                    return (
                      <motion.div
                        key={region.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="absolute flex items-center justify-center cursor-pointer hover:z-10"
                        style={{
                          left: `${10 + col * 25}%`,
                          top: `${15 + row * 20}%`,
                          width: `${adjustedSize}%`,
                          height: `${adjustedSize * 0.7}%`,
                        }}
                        onClick={() => handleRegionClick(region)}
                      >
                        <div 
                          className="w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-2 text-center hover:scale-105 transition-transform"
                          style={{ 
                            borderColor: region.color,
                            backgroundColor: `${region.color}20`,
                          }}
                        >
                          <div className="font-bold text-white text-sm truncate w-full">
                            {region.name}
                          </div>
                          <div className="text-xs text-gray-300">
                            {region.requests} demandes
                          </div>
                          {region.revenue > 0 && (
                            <div className="text-xs text-green-400">
                              {formatCurrency(region.revenue)}
                            </div>
                          )}
                          <div className={`text-xs ${getGrowthColor(region.growth)}`}>
                            {region.growth > 0 ? "+" : ""}{region.growth}%
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700 shadow-lg">
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span>Demandes: {filteredRegions.reduce((acc, r) => acc + r.requests, 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Revenus: {formatCurrency(filteredRegions.reduce((acc, r) => acc + r.revenue, 0))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <span>Régions: {filteredRegions.length}</span>
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {filteredRegions.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Aucune région trouvée</h3>
                      <p className="max-w-xs mx-auto">Aucune région ne correspond à vos critères de recherche. Essayez de modifier vos filtres.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information panel */}
        <div className="space-y-4">
          {/* Summary stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Filter className="w-5 h-5 text-blue-500" />
                Statistiques {viewMode === "city" ? "Villes" : "Régions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {viewMode === "region" ? (
                // Region stats
                filteredRegions
                  .sort((a, b) => b.requests - a.requests)
                  .slice(0, 5)
                  .map((region) => (
                    <div key={region.id} className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{region.name}</span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: region.color }} 
                        />
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Demandes:</span>
                          <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 hover:bg-blue-900/70">
                            {region.requests}
                          </Badge>
                        </div>
                        {region.providers > 0 && (
                          <div className="flex justify-between">
                            <span>Prestataires:</span>
                            <Badge variant="secondary" className="bg-green-900/50 text-green-300 hover:bg-green-900/70">
                              {region.providers}
                            </Badge>
                          </div>
                        )}
                        {region.revenue > 0 && (
                          <div className="flex justify-between">
                            <span>Revenus:</span>
                            <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70">
                              {formatCurrency(region.revenue)}
                            </Badge>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Part de marché:</span>
                          <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900/70">
                            {region.marketShare}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                // City stats
                cities
                  .filter(city => selectedCity === "all" || city.id === selectedCity)
                  .sort((a, b) => b.requests - a.requests)
                  .map((city) => (
                    <div key={city.id} className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{city.name}</span>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {city.regions.length} régions
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Demandes:</span>
                          <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 hover:bg-blue-900/70">
                            {city.requests}
                          </Badge>
                        </div>
                        {city.providers > 0 && (
                          <div className="flex justify-between">
                            <span>Prestataires:</span>
                            <Badge variant="secondary" className="bg-green-900/50 text-green-300 hover:bg-green-900/70">
                              {city.providers}
                            </Badge>
                          </div>
                        )}
                        {city.revenue > 0 && (
                          <div className="flex justify-between">
                            <span>Revenus:</span>
                            <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70">
                              {formatCurrency(city.revenue)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-yellow-500" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-700" 
                variant="outline"
                onClick={() => router.push("/providers")}
              >
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Voir prestataires par région
              </Button>
              <Button 
                className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-700" 
                variant="outline"
                onClick={() => router.push("/requests")}
              >
                <MapPin className="w-4 h-4 mr-2 text-green-400" />
                Voir demandes par région
              </Button>
              <Button 
                className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-700" 
                variant="outline"
                onClick={() => router.push("/analytics/geographic")}
              >
                <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                Analyse géographique détaillée
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Region details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700 text-white">
          {selectedRegion && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5" style={{ color: selectedRegion.color }} />
                  {selectedRegion.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    {selectedRegion.requests} demandes
                  </Badge>
                  {selectedRegion.providers > 0 && (
                    <Badge className="bg-green-600 text-white">
                      {selectedRegion.providers} prestataires
                    </Badge>
                  )}
                  <Badge 
                    className={`${selectedRegion.growth >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white`}
                  >
                    {selectedRegion.growth > 0 ? "+" : ""}{selectedRegion.growth}% croissance
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Demandes</div>
                    <div className="text-xl font-bold flex items-center">
                      {selectedRegion.requests}
                      <span className="text-xs ml-2 font-normal text-gray-400">
                        {selectedRegion.marketShare}% du marché
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Revenus</div>
                    <div className="text-xl font-bold text-green-400">
                      {formatCurrency(selectedRegion.revenue)}
                    </div>
                  </div>
                  
                  {selectedRegion.responseTime > 0 && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Temps de réponse</div>
                      <div className="text-xl font-bold flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-400" />
                        {selectedRegion.responseTime} min
                      </div>
                    </div>
                  )}{selectedRegion.satisfaction > 0 && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Satisfaction</div>
                      <div className="text-xl font-bold flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                        {selectedRegion.satisfaction}/5
                      </div>
                    </div>
                  )}
                </div>

                {/* Location info */}
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Localisation</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-400">Latitude:</div>
                      <div>{selectedRegion.coordinates.lat.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Longitude:</div>
                      <div>{selectedRegion.coordinates.lng.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Ville:</div>
                      <div className="capitalize">{selectedRegion.city}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => handleViewRequests(selectedRegion.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les demandes
                  </Button>
                  
                  {selectedRegion.providers > 0 && (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleViewProviders(selectedRegion.id)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Voir prestataires
                    </Button>
                  )}
                  
                  <Button variant="outline" size="icon" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
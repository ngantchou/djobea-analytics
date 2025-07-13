"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation, Zap, Users, Search, Layers, Filter, MapIcon, Building2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface MapMarker {
  id: string
  type: "provider" | "request" | "zone"
  position: { lat: number; lng: number }
  title: string
  description: string
  status: "active" | "inactive" | "pending"
  zone: string
  city: string
  metadata: Record<string, any>
}

interface Zone {
  id: string
  name: string
  city: string
  bounds: { north: number; south: number; east: number; west: number }
  color: string
  markersCount: number
}

interface City {
  id: string
  name: string
  center: { lat: number; lng: number }
  zones: string[]
  markersCount: number
}

interface InteractiveMapProps {
  compact?: boolean
}

export function InteractiveMap({ compact = false }: InteractiveMapProps) {
  const router = useRouter()
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [mapType, setMapType] = useState<"satellite" | "roadmap" | "terrain">("roadmap")
  const [showTraffic, setShowTraffic] = useState(false)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showZones, setShowZones] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "provider" | "request" | "zone">("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedZone, setSelectedZone] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"city" | "zone">("zone")
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger les données géographiques depuis l'API
  useEffect(() => {
    const loadGeolocationData = async () => {
      try {
        setIsLoading(true)

        // Essayer de charger les zones depuis l'API
        try {
          const zonesResponse = await apiClient.getZones()
          if (zonesResponse.success && zonesResponse.data) {
            const apiZones = zonesResponse.data.map((zone: any) => ({
              id: zone.id,
              name: zone.name,
              city: "Douala", // Par défaut
              bounds: { north: 4.06, south: 4.04, east: 9.78, west: 9.75 },
              color: "#3B82F6",
              markersCount: Math.floor(Math.random() * 20) + 5,
            }))
            setZones(apiZones)
          } else {
            setDefaultZones()
          }
        } catch (error) {
          logger.warn("API zones non disponible, utilisation des données par défaut", error)
          setDefaultZones()
        }

        // Essayer de charger les données géographiques
        try {
          const geoResponse = await apiClient.getGeolocationData()
          if (geoResponse.success && geoResponse.data) {
            setMarkers(geoResponse.data.markers || [])
            setCities(geoResponse.data.cities || getDefaultCities())
          } else {
            setDefaultMarkers()
            setCities(getDefaultCities())
          }
        } catch (error) {
          logger.warn("API géolocalisation non disponible, utilisation des données par défaut", error)
          setDefaultMarkers()
          setCities(getDefaultCities())
        }
      } catch (error) {
        logger.error("Erreur lors du chargement des données géographiques:", error)
        setDefaultData()
      } finally {
        setIsLoading(false)
      }
    }

    loadGeolocationData()
  }, [])

  const getDefaultCities = (): City[] => [
    {
      id: "douala",
      name: "Douala",
      center: { lat: 4.0511, lng: 9.7679 },
      zones: ["bonamoussadi-centre", "bonamoussadi-nord", "akwa", "bonapriso"],
      markersCount: 45,
    },
    {
      id: "yaounde",
      name: "Yaoundé",
      center: { lat: 3.848, lng: 11.5021 },
      zones: ["centre", "mfoundi", "nlongkak"],
      markersCount: 32,
    },
  ]

  const setDefaultZones = () => {
    const defaultZones: Zone[] = [
      {
        id: "bonamoussadi-centre",
        name: "Bonamoussadi Centre",
        city: "Douala",
        bounds: { north: 4.06, south: 4.04, east: 9.78, west: 9.75 },
        color: "#3B82F6",
        markersCount: 15,
      },
      {
        id: "bonamoussadi-nord",
        name: "Bonamoussadi Nord",
        city: "Douala",
        bounds: { north: 4.065, south: 4.045, east: 9.785, west: 9.755 },
        color: "#10B981",
        markersCount: 12,
      },
      {
        id: "akwa",
        name: "Akwa",
        city: "Douala",
        bounds: { north: 4.055, south: 4.035, east: 9.775, west: 9.745 },
        color: "#F59E0B",
        markersCount: 8,
      },
      {
        id: "bonapriso",
        name: "Bonapriso",
        city: "Douala",
        bounds: { north: 4.07, south: 4.05, east: 9.79, west: 9.76 },
        color: "#EF4444",
        markersCount: 10,
      },
    ]
    setZones(defaultZones)
  }

  const setDefaultMarkers = () => {
    const defaultMarkers: MapMarker[] = [
      {
        id: "provider-1",
        type: "provider",
        position: { lat: 4.0511, lng: 9.7679 },
        title: "Jean-Baptiste Électricité",
        description: "Électricien disponible",
        status: "active",
        zone: "bonamoussadi-centre",
        city: "douala",
        metadata: { rating: 4.8, services: ["électricité", "dépannage"] },
      },
      {
        id: "provider-2",
        type: "provider",
        position: { lat: 4.0521, lng: 9.7689 },
        title: "Marie Plomberie",
        description: "Plombier expert",
        status: "active",
        zone: "bonamoussadi-centre",
        city: "douala",
        metadata: { rating: 4.6, services: ["plomberie", "réparation"] },
      },
      {
        id: "request-1",
        type: "request",
        position: { lat: 4.0531, lng: 9.7699 },
        title: "Réparation fuite",
        description: "Demande urgente",
        status: "pending",
        zone: "bonamoussadi-centre",
        city: "douala",
        metadata: { priority: "high", client: "Mme Ngo" },
      },
      {
        id: "request-2",
        type: "request",
        position: { lat: 4.0541, lng: 9.7709 },
        title: "Installation prises",
        description: "Installation électrique",
        status: "pending",
        zone: "bonamoussadi-nord",
        city: "douala",
        metadata: { priority: "medium", client: "M. Biya" },
      },
    ]
    setMarkers(defaultMarkers)
  }

  const setDefaultData = () => {
    setDefaultZones()
    setDefaultMarkers()
    setCities(getDefaultCities())
  }

  // Filtrage des marqueurs
  const filteredMarkers = markers.filter((marker) => {
    const matchesType = filterType === "all" || marker.type === filterType
    const matchesCity = selectedCity === "all" || marker.city === selectedCity
    const matchesZone = selectedZone === "all" || marker.zone === selectedZone
    const matchesSearch =
      !searchQuery ||
      marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesType && matchesCity && matchesZone && matchesSearch
  })

  // Filtrage des zones selon la ville sélectionnée
  const filteredZones = zones.filter((zone) => selectedCity === "all" || zone.city.toLowerCase() === selectedCity)

  const getMarkerColor = (marker: MapMarker) => {
    switch (marker.type) {
      case "provider":
        return marker.status === "active" ? "bg-blue-500" : "bg-gray-500"
      case "request":
        return marker.status === "pending" ? "bg-red-500" : "bg-green-500"
      case "zone":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMarkerIcon = (marker: MapMarker) => {
    switch (marker.type) {
      case "provider":
        return Users
      case "request":
        return MapPin
      case "zone":
        return Layers
      default:
        return MapPin
    }
  }

  const handleViewFullMap = () => {
    logger.logUserAction("view_full_map")
    router.push("/map")
  }

  const getZoneStats = () => {
    const stats = filteredZones.map((zone) => {
      const zoneMarkers = filteredMarkers.filter((m) => m.zone === zone.id)
      return {
        ...zone,
        providers: zoneMarkers.filter((m) => m.type === "provider").length,
        requests: zoneMarkers.filter((m) => m.type === "request").length,
      }
    })
    return stats
  }

  const getCityStats = () => {
    const stats = cities.map((city) => {
      const cityMarkers = filteredMarkers.filter((m) => m.city === city.id)
      return {
        ...city,
        providers: cityMarkers.filter((m) => m.type === "provider").length,
        requests: cityMarkers.filter((m) => m.type === "request").length,
      }
    })
    return stats
  }

  if (compact) {
    return (
      <div className="h-full relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20 flex items-center justify-center">
          <div className="text-center text-white">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2">Carte Interactive</h3>
            <p className="text-gray-400 mb-4">{filteredMarkers.length} éléments sur la carte</p>

            {/* Marqueurs compacts */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {filteredMarkers.slice(0, 6).map((marker, index) => {
                const Icon = getMarkerIcon(marker)
                return (
                  <motion.div
                    key={marker.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${getMarkerColor(marker)} rounded-full p-2 cursor-pointer hover:scale-110 transition-transform`}
                    onClick={() => setSelectedMarker(marker)}
                  >
                    <Icon className="w-3 h-3 text-white" />
                  </motion.div>
                )
              })}
            </div>

            <Button onClick={handleViewFullMap} className="bg-blue-600 hover:bg-blue-700" size="sm">
              Voir Carte Complète
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Légende compacte */}
        <div className="absolute bottom-2 left-2 bg-gray-900/80 backdrop-blur-sm rounded-lg p-2">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-white">
                Prestataires ({filteredMarkers.filter((m) => m.type === "provider").length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-white">
                Demandes ({filteredMarkers.filter((m) => m.type === "request").length})
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contrôles de la carte */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-blue-400" />
            Carte Interactive - Cameroun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="mb-4">
            <TabsList className="bg-gray-700">
              <TabsTrigger value="zone" className="data-[state=active]:bg-blue-600">
                <Layers className="w-4 h-4 mr-2" />
                Par Zone
              </TabsTrigger>
              <TabsTrigger value="city" className="data-[state=active]:bg-blue-600">
                <Building2 className="w-4 h-4 mr-2" />
                Par Ville
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Filtre par ville */}
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par zone */}
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                {filteredZones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par type */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="provider">Prestataires</SelectItem>
                <SelectItem value="request">Demandes</SelectItem>
                <SelectItem value="zone">Zones</SelectItem>
              </SelectContent>
            </Select>

            {/* Options d'affichage */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={showZones} onCheckedChange={setShowZones} id="zones" />
                <label htmlFor="zones" className="text-sm text-gray-300">
                  Zones
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showRoutes} onCheckedChange={setShowRoutes} id="routes" />
                <label htmlFor="routes" className="text-sm text-gray-300">
                  Routes
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Carte principale */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-800/50 border-gray-700 h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-lg relative overflow-hidden">
                {/* Simulation de carte avec marqueurs */}
                <div className="absolute inset-0 bg-gray-800/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold mb-2">Carte Interactive</h3>
                    <p className="text-gray-400 mb-4">
                      Visualisation {viewMode === "city" ? "par ville" : "par zone"} - {filteredMarkers.length} éléments
                    </p>

                    {/* Zones colorées */}
                    {showZones && viewMode === "zone" && (
                      <div className="absolute inset-0">
                        {filteredZones.map((zone, index) => (
                          <motion.div
                            key={zone.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            transition={{ delay: index * 0.1 }}
                            className="absolute border-2 rounded-lg"
                            style={{
                              borderColor: zone.color,
                              backgroundColor: zone.color + "20",
                              left: `${10 + index * 20}%`,
                              top: `${20 + (index % 2) * 30}%`,
                              width: "15%",
                              height: "20%",
                            }}
                          >
                            <div className="p-2 text-xs">
                              <div className="font-semibold">{zone.name}</div>
                              <div className="text-gray-300">{zone.markersCount} éléments</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Marqueurs */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {filteredMarkers.slice(0, 9).map((marker, index) => {
                        const Icon = getMarkerIcon(marker)
                        return (
                          <motion.div
                            key={marker.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`absolute ${getMarkerColor(marker)} rounded-full p-2 cursor-pointer hover:scale-110 transition-transform`}
                            style={{
                              left: `${15 + (index % 3) * 25}%`,
                              top: `${25 + Math.floor(index / 3) * 20}%`,
                            }}
                            onClick={() => setSelectedMarker(marker)}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Légende */}
                <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-white">
                        Prestataires ({filteredMarkers.filter((m) => m.type === "provider").length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-white">
                        Demandes ({filteredMarkers.filter((m) => m.type === "request").length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <span className="text-white">
                        Zones ({filteredMarkers.filter((m) => m.type === "zone").length})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contrôles de zoom */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="sm" className="bg-gray-900/80 hover:bg-gray-800">
                    +
                  </Button>
                  <Button size="sm" className="bg-gray-900/80 hover:bg-gray-800">
                    -
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau d'informations */}
        <div className="space-y-4">
          {/* Statistiques par zone/ville */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Statistiques {viewMode === "city" ? "Villes" : "Zones"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {viewMode === "zone"
                ? getZoneStats().map((zone) => (
                    <div key={zone.id} className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{zone.name}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Prestataires:</span>
                          <Badge className="bg-blue-500">{zone.providers}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Demandes:</span>
                          <Badge className="bg-red-500">{zone.requests}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                : getCityStats().map((city) => (
                    <div key={city.id} className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{city.name}</span>
                        <Badge className="bg-purple-500">{city.zones.length} zones</Badge>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Prestataires:</span>
                          <Badge className="bg-blue-500">{city.providers}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Demandes:</span>
                          <Badge className="bg-red-500">{city.requests}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Détails du marqueur sélectionné */}
          {selectedMarker && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  {(() => {
                    const Icon = getMarkerIcon(selectedMarker)
                    return <Icon className="w-5 h-5 text-blue-400" />
                  })()}
                  {selectedMarker.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-400">{selectedMarker.description}</p>

                <div className="flex items-center gap-2">
                  <Badge className={getMarkerColor(selectedMarker).replace("bg-", "bg-") + " text-white"}>
                    {selectedMarker.status}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {selectedMarker.type}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zone:</span>
                    <span className="text-white capitalize">{selectedMarker.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ville:</span>
                    <span className="text-white capitalize">{selectedMarker.city}</span>
                  </div>
                </div>

                {Object.entries(selectedMarker.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{key}:</span>
                    <span className="text-white">{Array.isArray(value) ? value.join(", ") : value}</span>
                  </div>
                ))}

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Navigation className="w-4 h-4 mr-2" />
                  Naviguer vers
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700 justify-start">
                <Navigation className="w-4 h-4 mr-2" />
                Optimiser les routes
              </Button>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                onClick={() => router.push("/providers")}
              >
                <Users className="w-4 h-4 mr-2" />
                Voir prestataires proches
              </Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                <MapPin className="w-4 h-4 mr-2" />
                Centrer sur ma position
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

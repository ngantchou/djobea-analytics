"use client"

import { Suspense, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { InteractiveMap } from "@/components/geolocation/interactive-map"
import { MapPin, Navigation, Layers, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"

interface MapStats {
  providers: number
  requests: number
  pending: number
  zones: number
  activityRate: number
}

interface City {
  name: string
  requests: number
}

export default function MapPage() {
  const [stats, setStats] = useState<MapStats>({
    providers: 0,
    requests: 0,
    pending: 0,
    zones: 0,
    activityRate: 0
  })
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true)
        const [statsResponse, citiesResponse] = await Promise.all([
          apiClient.getMapStats(),
          apiClient.getActiveCities()
        ])
        
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }
        
        if (citiesResponse.success) {
          setCities(citiesResponse.data)
        }
      } catch (error) {
        console.error('Error loading map data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMapData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Carte Interactive</h1>
                <p className="text-muted-foreground">
                  Visualisez en temps réel les prestataires, demandes et zones de service
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Temps réel
              </Badge>
              <Button variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-2" />
                Ma position
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">Prestataires</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : stats.providers}
                </p>
                <p className="text-xs text-muted-foreground">Actifs dans le système</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">Demandes</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? "..." : stats.requests}
                </p>
                <p className="text-xs text-muted-foreground">
                  {loading ? "..." : stats.pending} en attente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm font-medium">Zones</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? "..." : stats.zones}
                </p>
                <p className="text-xs text-muted-foreground">Zones couvertes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Actifs</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : `${stats.activityRate}%`}
                </p>
                <p className="text-xs text-muted-foreground">Taux d'activité</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Map Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  Carte en Temps Réel
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                  <Button size="sm">
                    <Navigation className="w-4 h-4 mr-2" />
                    Optimiser routes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense
                fallback={
                  <div className="animate-pulse bg-muted h-[600px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Chargement de la carte...</p>
                      <p className="text-sm">Initialisation des données géographiques</p>
                    </div>
                  </div>
                }
              >
                <InteractiveMap />
              </Suspense>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zones de service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zones actives</span>
                  <Badge className="bg-blue-100 text-blue-700">
                    {loading ? "..." : stats.zones}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prestataires total</span>
                  <Badge className="bg-green-100 text-green-700">
                    {loading ? "..." : stats.providers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taux d'activité</span>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    {loading ? "..." : `${stats.activityRate}%`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">État des demandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total des demandes</span>
                  <Badge variant="outline">
                    {loading ? "..." : stats.requests}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">En attente</span>
                  <Badge variant="destructive">
                    {loading ? "..." : stats.pending}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">En cours</span>
                  <Badge variant="secondary">
                    {loading ? "..." : Math.max(0, stats.requests - stats.pending)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Couverture géographique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Villes couvertes</span>
                  <span className="text-sm font-medium text-green-600">
                    {loading ? "..." : cities.length > 0 ? cities.slice(0, 3).map(c => c.name).join(", ") : "Aucune"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Zones de service</span>
                  <span className="text-sm font-medium text-blue-600">
                    {loading ? "..." : stats.zones} régions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Densité de prestataires</span>
                  <span className="text-sm font-medium text-purple-600">
                    {loading ? "..." : Math.round(stats.providers / Math.max(1, stats.zones))} par zone
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

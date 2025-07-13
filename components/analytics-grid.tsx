"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Star, TrendingUp, Activity } from "lucide-react"
import { useAnalyticsData, useServicesData, useGeographicData } from "@/hooks/use-api-data"

interface ServiceData {
  name: string
  requests: number
  revenue: number
  satisfaction: number
  color: string
}

interface GeographicData {
  zone: string
  requests: number
  providers: number
  satisfaction: number
}

export function AnalyticsGrid({ period }: { period: string }) {
  const [selectedView, setSelectedView] = useState<"services" | "geographic" | "trends">("services")

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData(period)
  const { data: servicesData, isLoading: servicesLoading } = useServicesData(period)
  const { data: geographicData, isLoading: geographicLoading } = useGeographicData(period)

  // Données par défaut
  const defaultServices: ServiceData[] = [
    { name: "Électricité", requests: 145, revenue: 2850000, satisfaction: 4.3, color: "#3B82F6" },
    { name: "Plomberie", requests: 98, revenue: 1960000, satisfaction: 4.1, color: "#10B981" },
    { name: "Climatisation", requests: 76, revenue: 2280000, satisfaction: 4.5, color: "#8B5CF6" },
    { name: "Jardinage", requests: 54, revenue: 810000, satisfaction: 4.2, color: "#F59E0B" },
    { name: "Nettoyage", requests: 123, revenue: 1230000, satisfaction: 4.0, color: "#EF4444" },
    { name: "Réparations", requests: 87, revenue: 1740000, satisfaction: 4.4, color: "#06B6D4" },
  ]

  const defaultGeographic: GeographicData[] = [
    { zone: "Bonamoussadi", requests: 156, providers: 23, satisfaction: 4.3 },
    { zone: "Akwa", requests: 134, providers: 19, satisfaction: 4.1 },
    { zone: "Bonapriso", requests: 98, providers: 15, satisfaction: 4.5 },
    { zone: "Deido", requests: 87, providers: 12, satisfaction: 4.2 },
    { zone: "New Bell", requests: 76, providers: 14, satisfaction: 4.0 },
    { zone: "Bali", requests: 65, providers: 11, satisfaction: 4.4 },
  ]

  const services = servicesData?.data || defaultServices
  const geographic = geographicData?.data || defaultGeographic

  const views = [
    { key: "services" as const, label: "Services", icon: Activity },
    { key: "geographic" as const, label: "Géographique", icon: MapPin },
    { key: "trends" as const, label: "Tendances", icon: TrendingUp },
  ]

  const isLoading = analyticsLoading || servicesLoading || geographicLoading

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      {/* Sélecteur de vue */}
      <div className="lg:col-span-3">
        <div className="flex flex-wrap gap-2 mb-6">
          {views.map((view) => {
            const Icon = view.icon
            return (
              <Button
                key={view.key}
                size="sm"
                variant={selectedView === view.key ? "default" : "outline"}
                onClick={() => setSelectedView(view.key)}
                className={`${
                  selectedView === view.key
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-gray-600 text-gray-300 hover:text-white bg-transparent"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {view.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Vue Services */}
      {selectedView === "services" && (
        <>
          {/* Graphique en barres des services */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Demandes par Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isLoading ? (
                    <div className="h-full bg-gray-700/20 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-gray-400">Chargement...</div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={services}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#F9FAFB",
                          }}
                        />
                        <Bar dataKey="requests" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Répartition en camembert */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Répartition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full bg-gray-700/20 rounded-lg animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={services}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="requests"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                        fill="#8884d8"
                      >
                        {services.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top services */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.slice(0, 6).map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{service.name}</h3>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Demandes:</span>
                          <span className="text-white">{service.requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenus:</span>
                          <span className="text-green-400">{(service.revenue / 1000000).toFixed(1)}M FCFA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Satisfaction:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-white">{service.satisfaction}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Vue Géographique */}
      {selectedView === "geographic" && (
        <>
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  Activité par Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {isLoading ? (
                    <div className="h-full bg-gray-700/20 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-gray-400">Chargement...</div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geographic}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="zone" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#F9FAFB",
                          }}
                        />
                        <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Prestataires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographic.slice(0, 6).map((zone, index) => (
                  <div key={zone.zone} className="flex items-center justify-between">
                    <span className="text-gray-300">{zone.zone}</span>
                    <Badge className="bg-blue-500">{zone.providers}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Détails par Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {geographic.map((zone, index) => (
                    <motion.div
                      key={zone.zone}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700/30 rounded-lg p-4"
                    >
                      <h3 className="text-white font-medium mb-3">{zone.zone}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Demandes:</span>
                          <span className="text-white">{zone.requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prestataires:</span>
                          <span className="text-blue-400">{zone.providers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Satisfaction:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-white">{zone.satisfaction}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ratio:</span>
                          <span className="text-green-400">
                            {(zone.requests / zone.providers).toFixed(1)} req/prest
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Vue Tendances */}
      {selectedView === "trends" && (
        <div className="lg:col-span-3">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Tendances et Prédictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">+23%</div>
                  <div className="text-sm text-gray-400">Croissance demandes</div>
                  <div className="text-xs text-gray-500 mt-1">vs mois dernier</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">87%</div>
                  <div className="text-sm text-gray-400">Taux de satisfaction</div>
                  <div className="text-xs text-gray-500 mt-1">moyenne générale</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">15min</div>
                  <div className="text-sm text-gray-400">Temps de réponse</div>
                  <div className="text-xs text-gray-500 mt-1">moyenne</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">156</div>
                  <div className="text-sm text-gray-400">Prestataires actifs</div>
                  <div className="text-xs text-gray-500 mt-1">ce mois</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

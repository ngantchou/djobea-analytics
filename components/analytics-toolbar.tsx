"use client"

import { useState } from "react"
import { Calendar, Download, Share2, RefreshCw, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface AnalyticsToolbarProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
}

export function AnalyticsToolbar({ selectedPeriod, onPeriodChange }: AnalyticsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const periods = [
    { value: "1d", label: "24h" },
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "90d", label: "3 mois" },
    { value: "1y", label: "1 an" },
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simuler un refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    console.log("Export des données")
  }

  const handleShare = () => {
    console.log("Partage du rapport")
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Titre et période */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Analyse complète de votre plateforme Djobea</p>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions et recherche */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>

            <Button size="sm" onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres actifs */}
      {searchQuery && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filtres actifs:</span>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Recherche: "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className="ml-2 text-gray-400 hover:text-white">
                ×
              </button>
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

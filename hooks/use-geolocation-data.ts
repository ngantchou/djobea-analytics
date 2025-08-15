"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"

// Colors for regions - moved outside component to prevent recreation
const REGION_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
]

export interface GeoLocation {
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

export interface GeoSummary {
  totalRegions: number
  totalRequests: number
  totalProviders: number
  totalRevenue: number
  averageSatisfaction: number
}

export interface RegionData {
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

export interface City {
  id: string
  name: string
  center: { lat: number; lng: number }
  regions: string[]
  requests: number
  providers: number
  revenue: number
}

export interface MapStats {
  providers: number
  requests: number
  pending: number
  zones: number
  activityRate: number
}

export function useGeolocationData() {
  const [regions, setRegions] = useState<RegionData[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [mapStats, setMapStats] = useState<MapStats>({
    providers: 0,
    requests: 0,
    pending: 0,
    zones: 0,
    activityRate: 0
  })
  const [summary, setSummary] = useState<GeoSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()

  const fetchGeolocationData = useCallback(async (params?: {
    period?: string
    level?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching geolocation data...")
      
      const response = await apiClient.getGeolocationData(params)
      
      if (response.success && response.data) {
        // Handle different API response structures
        let dataArray: any[] = []
        
        // If response.data is an array (mock data)
        if (Array.isArray(response.data)) {
          dataArray = response.data
        }
        // If response.data has topLocations (real backend API)
        else if (response.data.topLocations && Array.isArray(response.data.topLocations)) {
          // Convert backend structure to expected structure
          dataArray = response.data.topLocations.map((item: any, index: number) => {
            // Default coordinates for Cameroon cities
            const cityCoordinates: { [key: string]: [number, number] } = {
              "bonamoussadi": [4.0669, 9.7370],
              "douala": [4.0511, 9.7679],
              "yaoundé": [3.8480, 11.5021],
              "yaunde": [3.8480, 11.5021],
              "bamenda": [5.9597, 10.1480],
              "bafoussam": [5.4781, 10.4167],
              "garoua": [9.3265, 13.3978],
              "maroua": [10.5906, 14.3156]
            }
            
            const locationKey = item.location.toLowerCase().split(',')[0].trim()
            const coordinates = cityCoordinates[locationKey] || [4.0511, 9.7679] // Default to Douala
            
            return {
              region: item.location,
              requests: item.count || 0,
              providers: Math.floor((item.count || 0) * 0.3), // Estimate providers
              revenue: (item.count || 0) * 15000, // Estimate revenue
              satisfaction: 4.0 + Math.random() * 1.0, // Random satisfaction
              responseTime: 15 + Math.random() * 20, // Random response time
              coordinates: coordinates,
              growth: (Math.random() - 0.5) * 40, // Random growth
              marketShare: Math.min(100, (item.count || 0) * 5) // Estimate market share
            }
          })
        }
        // If no data found, use empty array
        else {
          console.warn("Unknown API response structure:", response.data)
          dataArray = []
        }
        
        // Process regions from API data
        const apiRegions = dataArray?.map((item: GeoLocation, index: number) => {
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
            color: REGION_COLORS[index % REGION_COLORS.length],
            city: item.region.split(',')[0] || item.region,
          }
        }) || []
        
        setRegions(apiRegions)
        
        // Extract cities from regions
        const citiesMap = new Map<string, City>()
        
        apiRegions.forEach((region) => {
          const cityName = region.city
          if (!cityName) return
          const cityId = cityName.toLowerCase().replace(/[^a-z0-9]/g, "-")
          
          if (!citiesMap.has(cityId)) {
            citiesMap.set(cityId, {
              id: cityId,
              name: cityName,
              center: region.coordinates,
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
        
        // Set summary if available
        if (response.summary) {
          setSummary(response.summary)
        }
        
        console.log("✅ Geolocation data loaded successfully")
      } else {
        throw new Error(response.error || "Failed to fetch geolocation data")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement des données géographiques"
      setError(message)
      console.error("❌ Failed to fetch geolocation data:", err)
      
      // Set fallback data
      setRegions([])
      setCities([])
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchMapStats = useCallback(async () => {
    try {
      console.log("🔄 Fetching map stats...")
      
      const response = await apiClient.getMapStats()
      
      if (response.success && response.data) {
        setMapStats(response.data)
        console.log("✅ Map stats loaded successfully")
      } else {
        // Set fallback stats
        setMapStats({
          providers: regions.reduce((acc, r) => acc + r.providers, 0),
          requests: regions.reduce((acc, r) => acc + r.requests, 0),
          pending: Math.floor(regions.reduce((acc, r) => acc + r.requests, 0) * 0.3),
          zones: regions.length,
          activityRate: regions.length > 0 ? Math.round((regions.filter(r => r.requests > 0).length / regions.length) * 100) : 0
        })
      }
    } catch (err) {
      console.error("❌ Failed to fetch map stats:", err)
      // Set fallback stats based on regions data
      setMapStats({
        providers: regions.reduce((acc, r) => acc + r.providers, 0),
        requests: regions.reduce((acc, r) => acc + r.requests, 0),
        pending: Math.floor(regions.reduce((acc, r) => acc + r.requests, 0) * 0.3),
        zones: regions.length,
        activityRate: regions.length > 0 ? Math.round((regions.filter(r => r.requests > 0).length / regions.length) * 100) : 0
      })
    }
  }, [regions])

  const fetchActiveCities = useCallback(async () => {
    try {
      console.log("🔄 Fetching active cities...")
      
      const response = await apiClient.getActiveCities()
      
      if (response.success && response.data) {
        // Update cities with API data if needed
        const apiCities = response.data.map((city: any) => ({
          id: city.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: city.name,
          requests: city.requests || 0,
          center: city.center || { lat: 0, lng: 0 },
          regions: city.regions || [],
          providers: city.providers || 0,
          revenue: city.revenue || 0
        }))
        
        setCities(apiCities)
        console.log("✅ Active cities loaded successfully")
      }
    } catch (err) {
      console.error("❌ Failed to fetch active cities:", err)
      // Keep existing cities data
    }
  }, [])

  const getRegionsByCity = useCallback((cityId: string) => {
    return regions.filter(region => 
      region.city.toLowerCase().replace(/[^a-z0-9]/g, "-") === cityId
    )
  }, [regions])

  const getTopRegions = useCallback((limit: number = 5) => {
    return regions
      .sort((a, b) => b.requests - a.requests)
      .slice(0, limit)
  }, [regions])

  const getTopCities = useCallback((limit: number = 5) => {
    return cities
      .sort((a, b) => b.requests - a.requests)
      .slice(0, limit)
  }, [cities])

  const filterRegions = useCallback((filters: {
    city?: string
    zone?: string
    search?: string
    type?: "all" | "providers" | "requests"
  }) => {
    return regions.filter(region => {
      const matchesCity = !filters.city || filters.city === "all" || 
        region.city.toLowerCase() === filters.city
      const matchesZone = !filters.zone || filters.zone === "all" || 
        region.id === filters.zone
      const matchesSearch = !filters.search || 
        region.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesType = !filters.type || filters.type === "all" || 
        (filters.type === "providers" && region.providers > 0) ||
        (filters.type === "requests" && region.requests > 0)
      
      return matchesCity && matchesZone && matchesSearch && matchesType
    })
  }, [regions])

  // Auto-fetch data on mount
  useEffect(() => {
    fetchGeolocationData()
  }, [fetchGeolocationData])

  // Fetch stats when regions change
  useEffect(() => {
    if (regions.length > 0) {
      fetchMapStats()
    }
  }, [regions, fetchMapStats])

  return {
    // Data
    regions,
    cities,
    mapStats,
    summary,
    
    // State
    loading,
    error,
    
    // Actions
    fetchGeolocationData,
    fetchMapStats,
    fetchActiveCities,
    
    // Computed data
    getRegionsByCity,
    getTopRegions,
    getTopCities,
    filterRegions,
  }
}
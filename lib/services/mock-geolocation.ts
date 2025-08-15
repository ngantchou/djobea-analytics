"use client"

import { GeoLocation, GeoSummary, MapStats } from "@/hooks/use-geolocation-data"

// Mock data pour les tests
export const mockGeolocationData: GeoLocation[] = [
  {
    region: "Bonamoussadi, Douala",
    requests: 145,
    providers: 23,
    revenue: 2450000,
    satisfaction: 4.5,
    responseTime: 15,
    coordinates: [4.0511, 9.7679],
    growth: 12.5,
    marketShare: 18.3
  },
  {
    region: "Akwa, Douala", 
    requests: 132,
    providers: 19,
    revenue: 2100000,
    satisfaction: 4.2,
    responseTime: 18,
    coordinates: [4.0469, 9.7019],
    growth: 8.7,
    marketShare: 16.7
  },
  {
    region: "Bassa, Douala",
    requests: 98,
    providers: 15,
    revenue: 1680000,
    satisfaction: 4.1,
    responseTime: 22,
    coordinates: [4.0383, 9.7489],
    growth: 15.2,
    marketShare: 12.4
  },
  {
    region: "Deido, Douala",
    requests: 87,
    providers: 12,
    revenue: 1420000,
    satisfaction: 3.9,
    responseTime: 25,
    coordinates: [4.0702, 9.7290],
    growth: 6.8,
    marketShare: 11.0
  },
  {
    region: "Bastos, Yaoundé",
    requests: 76,
    providers: 14,
    revenue: 1350000,
    satisfaction: 4.6,
    responseTime: 12,
    coordinates: [3.8480, 11.5021],
    growth: 22.1,
    marketShare: 9.6
  },
  {
    region: "Mfoundi, Yaoundé",
    requests: 69,
    providers: 11,
    revenue: 1180000,
    satisfaction: 4.3,
    responseTime: 16,
    coordinates: [3.8667, 11.5167],
    growth: 18.5,
    marketShare: 8.7
  },
  {
    region: "Essos, Yaoundé",
    requests: 54,
    providers: 8,
    revenue: 890000,
    satisfaction: 4.0,
    responseTime: 20,
    coordinates: [3.8953, 11.5418],
    growth: 13.2,
    marketShare: 6.8
  },
  {
    region: "Ngousso, Yaoundé",
    requests: 43,
    providers: 6,
    revenue: 720000,
    satisfaction: 3.8,
    responseTime: 28,
    coordinates: [3.8333, 11.5500],
    growth: 9.4,
    marketShare: 5.4
  }
]

export const mockGeoSummary: GeoSummary = {
  totalRegions: mockGeolocationData.length,
  totalRequests: mockGeolocationData.reduce((acc, region) => acc + region.requests, 0),
  totalProviders: mockGeolocationData.reduce((acc, region) => acc + region.providers, 0),
  totalRevenue: mockGeolocationData.reduce((acc, region) => acc + region.revenue, 0),
  averageSatisfaction: mockGeolocationData.reduce((acc, region) => acc + region.satisfaction, 0) / mockGeolocationData.length
}

export const mockMapStats: MapStats = {
  providers: mockGeoSummary.totalProviders,
  requests: mockGeoSummary.totalRequests,
  pending: Math.floor(mockGeoSummary.totalRequests * 0.25), // 25% en attente
  zones: mockGeoSummary.totalRegions,
  activityRate: Math.round((mockGeolocationData.filter(r => r.requests > 50).length / mockGeoSummary.totalRegions) * 100)
}

export const mockActiveCities = [
  {
    name: "Douala",
    requests: mockGeolocationData.filter(r => r.region.includes("Douala")).reduce((acc, r) => acc + r.requests, 0)
  },
  {
    name: "Yaoundé", 
    requests: mockGeolocationData.filter(r => r.region.includes("Yaoundé")).reduce((acc, r) => acc + r.requests, 0)
  }
]

// Simule une API response avec délai
export const simulateApiDelay = (data: any, delay: number = 1000): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
        message: "Data loaded successfully"
      })
    }, delay)
  })
}
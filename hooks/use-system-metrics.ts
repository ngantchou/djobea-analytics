"use client"

import { useState, useEffect } from "react"

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
  uptime: number
  errorRate: number
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 25,
    responseTime: 156,
    uptime: 99.8,
    errorRate: 0.05,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/metrics/system")
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error("Erreur récupération métriques:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()

    // Mise à jour toutes les 30 secondes
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshMetrics = async () => {
    setIsLoading(true)
    try {
      // Simulation de nouvelles métriques
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 40) + 40,
        disk: Math.floor(Math.random() * 20) + 30,
        network: Math.floor(Math.random() * 30) + 20,
        responseTime: Math.floor(Math.random() * 100) + 100,
        uptime: 99.8 + Math.random() * 0.2,
        errorRate: Math.random() * 0.1,
      })
    } catch (error) {
      console.error("Erreur refresh métriques:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    metrics,
    isLoading,
    refreshMetrics,
  }
}

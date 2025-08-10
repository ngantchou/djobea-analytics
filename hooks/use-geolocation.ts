"use client"

import { useState, useEffect, useCallback } from "react"
import { MapsService, type LocationData } from "@/lib/services/maps-service"

export interface GeolocationState {
  location: LocationData | null
  loading: boolean
  error: string | null
  supported: boolean
}

export function useGeolocation(autoFetch = false) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    supported: typeof navigator !== "undefined" && "geolocation" in navigator,
  })

  const getCurrentLocation = useCallback(async () => {
    if (!state.supported) {
      setState((prev) => ({
        ...prev,
        error: "La géolocalisation n'est pas supportée par ce navigateur",
      }))
      return null
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const location = await MapsService.getCurrentPosition()

      if (location) {
        setState((prev) => ({
          ...prev,
          location,
          loading: false,
          error: null,
        }))
        return location
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Impossible d'obtenir votre position",
        }))
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de géolocalisation"
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      return null
    }
  }, [state.supported])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const clearLocation = useCallback(() => {
    setState((prev) => ({ ...prev, location: null }))
  }, [])

  // Auto-fetch location on mount if requested
  useEffect(() => {
    if (autoFetch && state.supported && !state.location && !state.loading) {
      getCurrentLocation()
    }
  }, [autoFetch, state.supported, state.location, state.loading, getCurrentLocation])

  return {
    ...state,
    getCurrentLocation,
    clearError,
    clearLocation,
    refresh: getCurrentLocation,
  }
}

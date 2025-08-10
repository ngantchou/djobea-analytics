import { apiClient } from "@/lib/api-client"

export interface GeocodeResult {
  lat: number
  lng: number
  formatted_address: string
  place_id: string
  address_components: any[]
}

export interface ReverseGeocodeResult {
  formatted_address: string
  place_id: string
  address_components: any[]
  types: string[]
}

export interface LocationData {
  lat: number
  lng: number
  address?: string
  accuracy?: number
  timestamp?: number
}

export class MapsService {
  /**
   * Géocode une adresse en coordonnées
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await apiClient.get(`/api/maps/geocode?address=${encodeURIComponent(address)}`)

      if (response.success && response.data) {
        return response.data
      }

      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  /**
   * Géocode inverse des coordonnées en adresse
   */
  static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await apiClient.get(`/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`)

      if (response.success && response.data) {
        return response.data
      }

      return null
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return null
    }
  }

  /**
   * Obtient la position actuelle de l'utilisateur
   */
  static async getCurrentPosition(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser")
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords

          // Essayer d'obtenir l'adresse
          const reverseResult = await this.reverseGeocode(latitude, longitude)

          resolve({
            lat: latitude,
            lng: longitude,
            address: reverseResult?.formatted_address,
            accuracy,
            timestamp: position.timestamp,
          })
        },
        (error) => {
          console.error("Error getting current position:", error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  /**
   * Calcule la distance entre deux points (en km)
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convertit les degrés en radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Formate une distance en texte lisible
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)} km`
    } else {
      return `${Math.round(distanceKm)} km`
    }
  }

  /**
   * Extrait les composants d'adresse utiles
   */
  static parseAddressComponents(components: any[]): {
    street?: string
    city?: string
    district?: string
    region?: string
    country?: string
    postalCode?: string
  } {
    const result: any = {}

    components.forEach((component) => {
      const types = component.types

      if (types.includes("street_number") || types.includes("route")) {
        result.street = (result.street || "") + " " + component.long_name
      } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        result.city = component.long_name
      } else if (types.includes("administrative_area_level_3")) {
        result.district = component.long_name
      } else if (types.includes("administrative_area_level_1")) {
        result.region = component.long_name
      } else if (types.includes("country")) {
        result.country = component.long_name
      } else if (types.includes("postal_code")) {
        result.postalCode = component.long_name
      }
    })

    // Nettoyer la rue
    if (result.street) {
      result.street = result.street.trim()
    }

    return result
  }
}

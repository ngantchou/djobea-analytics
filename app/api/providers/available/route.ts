import { NextResponse } from "next/server"

// Mock available providers
const availableProviders = [
  {
    id: "PROV-001",
    name: "Jean-Baptiste Électricité",
    specialty: "Électricité",
    rating: 4.8,
    responseTime: 15,
    distance: 2.5,
    availability: "available",
    status: "active",
  },
  {
    id: "PROV-002",
    name: "Marie Réparation",
    specialty: "Électroménager",
    rating: 4.9,
    responseTime: 12,
    distance: 1.8,
    availability: "available",
    status: "active",
  },
]

export async function POST(request: Request) {
  try {
    const filters = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real app, this would:
    // 1. Query database for available providers
    // 2. Apply location-based filtering
    // 3. Apply service type filtering
    // 4. Sort by distance, rating, response time
    // 5. Return matched providers

    let filteredProviders = [...availableProviders]

    // Apply service type filter
    if (filters.serviceType) {
      filteredProviders = filteredProviders.filter((provider) =>
        provider.specialty.toLowerCase().includes(filters.serviceType.toLowerCase()),
      )
    }

    // Apply location filter (mock implementation)
    if (filters.location && filters.location.radius) {
      filteredProviders = filteredProviders.filter((provider) => provider.distance <= filters.location.radius)
    }

    // Sort by rating and response time
    filteredProviders.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating
      return a.responseTime - b.responseTime
    })

    return NextResponse.json({
      success: true,
      data: filteredProviders,
      total: filteredProviders.length,
    })
  } catch (error) {
    console.error("Error fetching available providers:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des prestataires disponibles" }, { status: 500 })
  }
}

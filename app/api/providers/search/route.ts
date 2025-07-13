import { NextResponse } from "next/server"

// Mock providers for search
const searchableProviders = [
  {
    id: "PROV-001",
    name: "Jean-Baptiste Électricité",
    email: "jb.electricite@email.com",
    phone: "+237 6 12 34 56 78",
    specialty: "Électricité",
    services: ["Électricité", "Installation", "Réparation"],
    zone: "Bonamoussadi Centre",
    rating: 4.8,
    status: "active",
  },
  {
    id: "PROV-002",
    name: "Marie Réparation",
    email: "marie.reparation@email.com",
    phone: "+237 6 98 76 54 32",
    specialty: "Électroménager",
    services: ["Électroménager", "Réparation", "Maintenance"],
    zone: "Bonamoussadi Nord",
    rating: 4.9,
    status: "active",
  },
  // Add more providers...
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Requête de recherche trop courte (minimum 2 caractères)",
      })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const queryLower = query.toLowerCase()

    const results = searchableProviders.filter(
      (provider) =>
        provider.name.toLowerCase().includes(queryLower) ||
        provider.email.toLowerCase().includes(queryLower) ||
        provider.specialty.toLowerCase().includes(queryLower) ||
        provider.zone.toLowerCase().includes(queryLower) ||
        provider.services.some((service) => service.toLowerCase().includes(queryLower)),
    )

    // Sort by relevance (name matches first, then specialty, then services)
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(queryLower)
      const bNameMatch = b.name.toLowerCase().includes(queryLower)

      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1

      const aSpecialtyMatch = a.specialty.toLowerCase().includes(queryLower)
      const bSpecialtyMatch = b.specialty.toLowerCase().includes(queryLower)

      if (aSpecialtyMatch && !bSpecialtyMatch) return -1
      if (!aSpecialtyMatch && bSpecialtyMatch) return 1

      return b.rating - a.rating
    })

    return NextResponse.json({
      success: true,
      data: results.slice(0, 10), // Limit to 10 results
      total: results.length,
      query,
    })
  } catch (error) {
    console.error("Error searching providers:", error)
    return NextResponse.json({ error: "Erreur lors de la recherche" }, { status: 500 })
  }
}

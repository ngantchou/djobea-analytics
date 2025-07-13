import { NextResponse } from "next/server"

// Mock providers database - in real app this would be from database
const mockProviders = [
  {
    id: "PROV-001",
    name: "Jean-Baptiste Électricité",
    email: "jb.electricite@email.com",
    phone: "+237 6 12 34 56 78",
    whatsapp: "+237 6 12 34 56 78",
    services: ["Électricité", "Installation", "Réparation"],
    coverageAreas: ["Bonamoussadi Centre", "Bonamoussadi Nord"],
    specialty: "Électricité",
    zone: "Bonamoussadi Centre",
    rating: 4.8,
    reviewCount: 45,
    totalMissions: 67,
    completedJobs: 62,
    cancelledJobs: 5,
    successRate: 92,
    responseTime: 15,
    performanceStatus: "excellent" as const,
    status: "active" as const,
    availability: "available" as const,
    joinDate: "2023-01-15",
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hourlyRate: 6500,
    experience: 8,
    acceptanceRate: 95,
    description: "Électricien professionnel avec 8 ans d'expérience.",
  },
  // Add other providers here...
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const providerId = params.id

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Find provider by ID
    const provider = mockProviders.find((p) => p.id === providerId)

    if (!provider) {
      return NextResponse.json({ error: "Prestataire non trouvé" }, { status: 404 })
    }

    return NextResponse.json(provider)
  } catch (error) {
    console.error("Error fetching provider:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du prestataire" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const providerId = params.id

    // Validate required fields
    if (!data.name || !data.phone || !data.services || !data.coverage) {
      return NextResponse.json(
        { error: "Champs requis manquants: nom, téléphone, services, zones de couverture" },
        { status: 400 },
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Find provider index
    const providerIndex = mockProviders.findIndex((p) => p.id === providerId)

    if (providerIndex === -1) {
      return NextResponse.json({ error: "Prestataire non trouvé" }, { status: 404 })
    }

    // Update provider data
    const updatedProvider = {
      ...mockProviders[providerIndex],
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      email: data.email || "",
      services: data.services
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      coverageAreas: data.coverage
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      specialty: data.services.split(",")[0]?.trim() || mockProviders[providerIndex].specialty,
      zone: data.coverage.split(",")[0]?.trim() || mockProviders[providerIndex].zone,
      hourlyRate: data.rate ? Number.parseInt(data.rate) : mockProviders[providerIndex].hourlyRate,
      experience: data.experience ? Number.parseInt(data.experience) : mockProviders[providerIndex].experience,
      description: data.description || "",
      lastActivity: new Date().toISOString(),
    }

    mockProviders[providerIndex] = updatedProvider

    return NextResponse.json({
      success: true,
      message: "Prestataire mis à jour avec succès",
      data: updatedProvider,
    })
  } catch (error) {
    console.error("Error updating provider:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const providerId = params.id

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Find provider index
    const providerIndex = mockProviders.findIndex((p) => p.id === providerId)

    if (providerIndex === -1) {
      return NextResponse.json({ error: "Prestataire non trouvé" }, { status: 404 })
    }

    // Remove provider from array
    const deletedProvider = mockProviders.splice(providerIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: "Prestataire supprimé avec succès",
      data: deletedProvider,
    })
  } catch (error) {
    console.error("Error deleting provider:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}

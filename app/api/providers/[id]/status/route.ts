import { NextResponse } from "next/server"

// Mock providers database
const mockProviders = [
  // Same mock data as in main route...
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const providerId = params.id

    // Validate status
    if (!["active", "inactive", "suspended"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide. Valeurs autorisées: active, inactive, suspended" },
        { status: 400 },
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Find provider index
    const providerIndex = mockProviders.findIndex((p) => p.id === providerId)

    if (providerIndex === -1) {
      return NextResponse.json({ error: "Prestataire non trouvé" }, { status: 404 })
    }

    // Update provider status
    mockProviders[providerIndex] = {
      ...mockProviders[providerIndex],
      status,
      lastActivity: new Date().toISOString(),
      availability: status === "active" ? "available" : "offline",
    }

    return NextResponse.json({
      success: true,
      message: `Statut du prestataire mis à jour: ${status}`,
      data: mockProviders[providerIndex],
    })
  } catch (error) {
    console.error("Error updating provider status:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du statut" }, { status: 500 })
  }
}

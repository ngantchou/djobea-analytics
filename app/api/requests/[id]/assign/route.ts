import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { providerId } = await request.json()
    const requestId = params.id

    // Simuler l'assignation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Ici vous feriez la vraie assignation en base de données
    const assignedRequest = {
      id: requestId,
      status: "assigned",
      assignedProvider: {
        id: providerId,
        name: "Prestataire Assigné",
        rating: 4.5,
      },
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: assignedRequest,
      message: "Demande assignée avec succès",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'assignation",
      },
      { status: 500 },
    )
  }
}

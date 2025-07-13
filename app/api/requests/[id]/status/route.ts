import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const requestId = params.id

    // Simuler la mise à jour du statut
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Ici vous feriez la vraie mise à jour en base de données
    const updatedRequest = {
      id: requestId,
      status,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "Statut mis à jour avec succès",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la mise à jour du statut",
      },
      { status: 500 },
    )
  }
}

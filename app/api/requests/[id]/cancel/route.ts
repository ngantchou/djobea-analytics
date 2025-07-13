import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason } = await request.json()
    const requestId = params.id

    // Simuler l'annulation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Ici vous feriez la vraie annulation en base de données
    const cancelledRequest = {
      id: requestId,
      status: "cancelled",
      cancelReason: reason,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: cancelledRequest,
      message: "Demande annulée avec succès",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'annulation",
      },
      { status: 500 },
    )
  }
}

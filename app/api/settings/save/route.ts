import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const settings = await request.json()

    // Simulation de sauvegarde en base de données
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Ici vous pourriez sauvegarder en base de données
    console.log("Paramètres sauvegardés:", settings)

    return NextResponse.json({
      success: true,
      message: "Paramètres sauvegardés avec succès",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur sauvegarde:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la sauvegarde" }, { status: 500 })
  }
}

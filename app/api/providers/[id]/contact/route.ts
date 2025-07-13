import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { method, message } = await request.json()
    const providerId = params.id

    // Validate contact method
    if (!["call", "whatsapp", "email"].includes(method)) {
      return NextResponse.json(
        { error: "Méthode de contact invalide. Valeurs autorisées: call, whatsapp, email" },
        { status: 400 },
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real app, this would:
    // 1. Find the provider
    // 2. Initiate the contact based on method
    // 3. Log the contact attempt
    // 4. Send notification to provider

    const contactActions = {
      call: "Appel téléphonique initié",
      whatsapp: "Message WhatsApp envoyé",
      email: "Email envoyé",
    }

    return NextResponse.json({
      success: true,
      message: contactActions[method as keyof typeof contactActions],
      data: {
        providerId,
        method,
        message,
        timestamp: new Date().toISOString(),
        status: "sent",
      },
    })
  } catch (error) {
    console.error("Error contacting provider:", error)
    return NextResponse.json({ error: "Erreur lors du contact du prestataire" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json()

    // Mock email sending logic - replace with actual email service
    const emailData = {
      to: email,
      subject: "Rapport Financier - Djobea AI",
      html: `
        <h2>Rapport Financier</h2>
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint le rapport financier demandé.</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        <p>Cordialement,<br>L'équipe Djobea AI</p>
      `,
      attachments: [
        {
          filename: "rapport-financier.pdf",
          content: "PDF content would go here",
        },
      ],
    }

    // Simulate email sending
    console.log("Envoi d'email:", emailData)

    // In a real implementation, you would use a service like:
    // - SendGrid
    // - Nodemailer
    // - AWS SES
    // - etc.

    return NextResponse.json({
      success: true,
      message: "Rapport envoyé avec succès",
    })
  } catch (error) {
    console.error("Erreur partage finances:", error)
    return NextResponse.json({ error: "Erreur lors du partage du rapport" }, { status: 500 })
  }
}

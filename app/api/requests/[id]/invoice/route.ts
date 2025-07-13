import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create a simple PDF-like content (in real app, use jsPDF or similar)
    const pdfContent = `
      FACTURE #${requestId}
      ==================
      
      Date: ${new Date().toLocaleDateString()}
      Client: Mme Ngo Célestine
      Service: Plomberie - Réparation fuite
      Montant: 25,000 FCFA
      
      Merci pour votre confiance !
    `

    // Convert to blob
    const blob = new Blob([pdfContent], { type: "application/pdf" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${requestId}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}

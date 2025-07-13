import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { type, settings } = await request.json()

    // Simulate test delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock test results based on type
    const testResult = {
      success: Math.random() > 0.2, // 80% success rate
      message: "",
      details: {},
    }

    switch (type) {
      case "push":
        testResult.message = testResult.success
          ? "Notification push envoyée avec succès"
          : "Erreur: Clé Firebase invalide"
        testResult.details = {
          devicesTested: 5,
          delivered: testResult.success ? 5 : 0,
          failed: testResult.success ? 0 : 5,
        }
        break

      case "email":
        testResult.message = testResult.success
          ? "Email de test envoyé avec succès"
          : "Erreur: Configuration SendGrid invalide"
        testResult.details = {
          recipient: "test@djobea.com",
          deliveryTime: "2.3s",
          status: testResult.success ? "delivered" : "failed",
        }
        break

      case "sms":
        testResult.message = testResult.success
          ? "SMS de test envoyé avec succès"
          : "Erreur: Crédit insuffisant ou API invalide"
        testResult.details = {
          recipient: "+237 6XX XXX XXX",
          cost: "25 FCFA",
          status: testResult.success ? "delivered" : "failed",
        }
        break

      default:
        testResult.success = false
        testResult.message = "Type de test non reconnu"
    }

    return NextResponse.json(testResult)
  } catch (error) {
    return NextResponse.json({ success: false, message: "Erreur lors du test" }, { status: 500 })
  }
}

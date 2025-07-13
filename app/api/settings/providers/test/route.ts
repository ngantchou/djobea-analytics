import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const settings = await request.json()

    // Simulate testing configuration
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate validation tests
    const tests = [
      {
        name: "Validation des seuils de notation",
        status: settings.rating.suspensionThreshold < settings.rating.probationThreshold ? "success" : "error",
        message:
          settings.rating.suspensionThreshold < settings.rating.probationThreshold
            ? "Seuils correctement configurés"
            : "Seuil de suspension doit être inférieur au seuil de probation",
      },
      {
        name: "Configuration des horaires de travail",
        status: settings.availability.workingHours.start < settings.availability.workingHours.end ? "success" : "error",
        message:
          settings.availability.workingHours.start < settings.availability.workingHours.end
            ? "Horaires valides"
            : "Heure de début doit être antérieure à l'heure de fin",
      },
      {
        name: "Validation des taux de commission",
        status: settings.commission.premiumRate <= settings.commission.standardRate ? "success" : "error",
        message:
          settings.commission.premiumRate <= settings.commission.standardRate
            ? "Taux de commission cohérents"
            : "Le taux premium doit être inférieur ou égal au taux standard",
      },
      {
        name: "Documents requis",
        status: settings.validation.requiredDocuments.length > 0 ? "success" : "warning",
        message:
          settings.validation.requiredDocuments.length > 0
            ? `${settings.validation.requiredDocuments.length} documents configurés`
            : "Aucun document requis configuré",
      },
    ]

    const failedTests = tests.filter((test) => test.status === "error")
    const warningTests = tests.filter((test) => test.status === "warning")

    return NextResponse.json({
      success: failedTests.length === 0,
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((test) => test.status === "success").length,
        failed: failedTests.length,
        warnings: warningTests.length,
      },
      message:
        failedTests.length === 0
          ? "Tous les tests de configuration ont réussi"
          : `${failedTests.length} test(s) ont échoué`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du test de configuration" }, { status: 500 })
  }
}

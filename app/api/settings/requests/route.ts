import { NextResponse } from "next/server"

const defaultRequestSettings = {
  automaticProcessing: {
    enabled: true,
    timeoutAssignment: 10,
    maxProvidersContacted: 3,
    geographicPriority: true,
    ratingPriority: true,
    availabilityPriority: true,
  },
  matchingAlgorithm: {
    distanceWeight: 40,
    ratingWeight: 30,
    responseTimeWeight: 20,
    specializationWeight: 10,
    newProviderBoost: 10,
  },
  timeouts: {
    providerResponse: 10,
    automaticFallback: true,
    adminEscalation: 180,
    autoCancel: 120,
    clientNotification: true,
  },
  statuses: {
    pending: true,
    providerNotified: true,
    assigned: true,
    inProgress: true,
    completed: true,
    cancelled: true,
    failed: true,
  },
}

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json(defaultRequestSettings)
  } catch (error) {
    console.error("Error loading request settings:", error)
    return NextResponse.json({ success: false, message: "Erreur lors du chargement des paramètres" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()

    // Validation
    if (!settings.automaticProcessing || !settings.matchingAlgorithm || !settings.timeouts || !settings.statuses) {
      return NextResponse.json({ success: false, message: "Données de configuration incomplètes" }, { status: 400 })
    }

    // Validate matching algorithm weights
    const totalWeight =
      settings.matchingAlgorithm.distanceWeight +
      settings.matchingAlgorithm.ratingWeight +
      settings.matchingAlgorithm.responseTimeWeight +
      settings.matchingAlgorithm.specializationWeight

    if (totalWeight !== 100) {
      return NextResponse.json(
        { success: false, message: "La somme des poids de l'algorithme doit être égale à 100%" },
        { status: 400 },
      )
    }

    // Validate timeout values
    if (settings.timeouts.providerResponse < 1 || settings.timeouts.providerResponse > 120) {
      return NextResponse.json(
        { success: false, message: "Le timeout de réponse prestataire doit être entre 1 et 120 minutes" },
        { status: 400 },
      )
    }

    if (settings.timeouts.adminEscalation < 30 || settings.timeouts.adminEscalation > 1440) {
      return NextResponse.json(
        { success: false, message: "Le délai d'escalation admin doit être entre 30 et 1440 minutes" },
        { status: 400 },
      )
    }

    if (settings.timeouts.autoCancel < 60 || settings.timeouts.autoCancel > 2880) {
      return NextResponse.json(
        { success: false, message: "Le délai d'annulation automatique doit être entre 60 et 2880 minutes" },
        { status: 400 },
      )
    }

    // Validate automatic processing settings
    if (settings.automaticProcessing.timeoutAssignment < 1 || settings.automaticProcessing.timeoutAssignment > 60) {
      return NextResponse.json(
        { success: false, message: "Le timeout d'assignation doit être entre 1 et 60 minutes" },
        { status: 400 },
      )
    }

    if (
      settings.automaticProcessing.maxProvidersContacted < 1 ||
      settings.automaticProcessing.maxProvidersContacted > 10
    ) {
      return NextResponse.json(
        { success: false, message: "Le nombre max de prestataires contactés doit être entre 1 et 10" },
        { status: 400 },
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Here you would typically save to database
    console.log("Saving request settings:", JSON.stringify(settings, null, 2))

    // Simulate potential database error (5% chance)
    if (Math.random() < 0.05) {
      throw new Error("Database connection failed")
    }

    return NextResponse.json({
      success: true,
      message: "Paramètres de demandes sauvegardés avec succès",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error saving request settings:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la sauvegarde des paramètres" },
      { status: 500 },
    )
  }
}

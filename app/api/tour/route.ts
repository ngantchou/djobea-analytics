import { type NextRequest, NextResponse } from "next/server"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  page: string
  action?: string
  optional?: boolean
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bienvenue sur Djobea Analytics",
    description: "Découvrez toutes les fonctionnalités de votre plateforme de gestion de services à domicile.",
    target: "body",
    position: "top",
    page: "/",
  },
  {
    id: "dashboard-stats",
    title: "Tableau de Bord Principal",
    description: "Visualisez vos KPIs en temps réel : demandes totales, taux de réussite, prestataires actifs.",
    target: "[data-tour='dashboard-stats']",
    position: "bottom",
    page: "/",
  },
  {
    id: "dashboard-charts",
    title: "Graphiques d'Activité",
    description: "Analysez les tendances avec des graphiques interactifs d'activité et de répartition des services.",
    target: "[data-tour='dashboard-charts']",
    position: "top",
    page: "/",
  },
  {
    id: "recent-activity",
    title: "Activité Récente",
    description: "Suivez les dernières demandes et alertes système en temps réel.",
    target: "[data-tour='recent-activity']",
    position: "top",
    page: "/",
  },
  {
    id: "requests-page",
    title: "Gestion des Demandes",
    description: "Gérez toutes les demandes de service : assignation, suivi, annulation.",
    target: "body",
    position: "top",
    page: "/requests",
  },
  {
    id: "requests-filters",
    title: "Filtres Avancés",
    description: "Filtrez les demandes par statut, service, localisation, priorité et période.",
    target: "[data-tour='requests-filters']",
    position: "bottom",
    page: "/requests",
  },
  {
    id: "providers-page",
    title: "Gestion des Prestataires",
    description: "Gérez votre réseau de prestataires : ajout, modification, évaluation.",
    target: "body",
    position: "top",
    page: "/providers",
  },
  {
    id: "analytics-page",
    title: "Analytics IA",
    description: "Exploitez l'intelligence artificielle pour des insights avancés sur vos performances.",
    target: "body",
    position: "top",
    page: "/analytics",
  },
  {
    id: "messages-page",
    title: "Système de Messagerie",
    description: "Communiquez directement avec vos clients et prestataires via le chat intégré.",
    target: "body",
    position: "top",
    page: "/messages",
  },
  {
    id: "help-page",
    title: "Centre d'Aide",
    description: "Accédez à la documentation complète et au support technique.",
    target: "body",
    position: "top",
    page: "/help",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")
    const stepId = searchParams.get("stepId")

    if (stepId) {
      const step = tourSteps.find((s) => s.id === stepId)
      if (!step) {
        return NextResponse.json(
          {
            success: false,
            error: "Tour step not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: step,
      })
    }

    let filteredSteps = tourSteps

    if (page) {
      filteredSteps = tourSteps.filter((step) => step.page === page)
    }

    return NextResponse.json({
      success: true,
      data: filteredSteps,
      total: filteredSteps.length,
    })
  } catch (error) {
    console.error("Tour API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, stepId, userId } = body

    if (action === "complete") {
      // Here you would typically save the user's tour progress to a database
      console.log(`User ${userId} completed tour step: ${stepId}`)

      return NextResponse.json({
        success: true,
        message: "Tour step completed",
      })
    }

    if (action === "skip") {
      console.log(`User ${userId} skipped tour step: ${stepId}`)

      return NextResponse.json({
        success: true,
        message: "Tour step skipped",
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Tour API POST Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"

interface RoadmapPhase {
  id: number
  title: string
  duration: string
  status: "current" | "next" | "planned" | "completed"
  features: string[]
  color: string
  startDate?: string
  endDate?: string
  progress?: number
}

interface ImplementationItem {
  id: string
  name: string
  category: string
  status: "implemented" | "in-progress" | "planned" | "not-started"
  complexity: "low" | "medium" | "high"
  businessImpact: "low" | "medium" | "high"
  technicalDebt: "low" | "medium" | "high"
  estimatedHours: number
  dependencies: string[]
  description: string
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: 1,
    title: "Core Business",
    duration: "2-3 semaines",
    status: "current",
    features: ["Dashboard Drag & Drop", "Carte Interactive", "Recherche Globale"],
    color: "from-red-500 to-orange-500",
    startDate: "2024-01-15",
    endDate: "2024-02-05",
    progress: 75,
  },
  {
    id: 2,
    title: "IA & Productivité",
    duration: "3-4 semaines",
    status: "next",
    features: ["Prédictions IA", "Raccourcis Clavier", "Actions en Lot"],
    color: "from-orange-500 to-yellow-500",
    startDate: "2024-02-06",
    endDate: "2024-03-05",
    progress: 0,
  },
  {
    id: 3,
    title: "Sécurité",
    duration: "2-3 semaines",
    status: "planned",
    features: ["2FA", "Journaux d'Audit", "Gestion Rôles"],
    color: "from-yellow-500 to-green-500",
    startDate: "2024-03-06",
    endDate: "2024-03-26",
    progress: 0,
  },
  {
    id: 4,
    title: "Mobile & Communication",
    duration: "4-5 semaines",
    status: "planned",
    features: ["PWA", "WhatsApp Avancé", "App Mobile"],
    color: "from-green-500 to-blue-500",
    startDate: "2024-03-27",
    endDate: "2024-04-30",
    progress: 0,
  },
  {
    id: 5,
    title: "Analytics Avancés",
    duration: "3-4 semaines",
    status: "planned",
    features: ["Rapports Auto", "Monitoring", "Cohortes"],
    color: "from-blue-500 to-purple-500",
    startDate: "2024-05-01",
    endDate: "2024-05-28",
    progress: 0,
  },
]

const implementationItems: ImplementationItem[] = [
  {
    id: "dashboard-drag-drop",
    name: "Dashboard Drag & Drop",
    category: "Core Business",
    status: "in-progress",
    complexity: "medium",
    businessImpact: "high",
    technicalDebt: "low",
    estimatedHours: 40,
    dependencies: ["dashboard-widgets"],
    description: "Permettre aux utilisateurs de personnaliser leur dashboard en glissant-déposant les widgets",
  },
  {
    id: "interactive-map",
    name: "Carte Interactive",
    category: "Core Business",
    status: "implemented",
    complexity: "high",
    businessImpact: "high",
    technicalDebt: "medium",
    estimatedHours: 60,
    dependencies: ["geolocation-api"],
    description: "Carte interactive pour visualiser les demandes et prestataires par zone géographique",
  },
  {
    id: "global-search",
    name: "Recherche Globale",
    category: "Core Business",
    status: "implemented",
    complexity: "medium",
    businessImpact: "medium",
    technicalDebt: "low",
    estimatedHours: 30,
    dependencies: [],
    description: "Recherche unifiée dans toutes les sections de l'application",
  },
  {
    id: "ai-predictions",
    name: "Prédictions IA",
    category: "IA & Productivité",
    status: "planned",
    complexity: "high",
    businessImpact: "high",
    technicalDebt: "low",
    estimatedHours: 80,
    dependencies: ["analytics-data", "ml-models"],
    description: "Utiliser l'IA pour prédire la demande et optimiser l'allocation des ressources",
  },
  {
    id: "keyboard-shortcuts",
    name: "Raccourcis Clavier",
    category: "IA & Productivité",
    status: "not-started",
    complexity: "low",
    businessImpact: "medium",
    technicalDebt: "low",
    estimatedHours: 20,
    dependencies: [],
    description: "Raccourcis clavier pour accélérer la navigation et les actions courantes",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "phases"
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    if (type === "phases") {
      let filteredPhases = [...roadmapPhases]

      if (status) {
        filteredPhases = filteredPhases.filter((phase) => phase.status === status)
      }

      return NextResponse.json({
        success: true,
        data: filteredPhases,
      })
    }

    if (type === "implementation") {
      let filteredItems = [...implementationItems]

      if (category) {
        filteredItems = filteredItems.filter((item) => item.category === category)
      }

      if (status) {
        filteredItems = filteredItems.filter((item) => item.status === status)
      }

      return NextResponse.json({
        success: true,
        data: filteredItems,
      })
    }

    if (type === "metrics") {
      const totalItems = implementationItems.length
      const completedItems = implementationItems.filter((item) => item.status === "implemented").length
      const inProgressItems = implementationItems.filter((item) => item.status === "in-progress").length
      const plannedItems = implementationItems.filter((item) => item.status === "planned").length

      const totalHours = implementationItems.reduce((sum, item) => sum + item.estimatedHours, 0)
      const completedHours = implementationItems
        .filter((item) => item.status === "implemented")
        .reduce((sum, item) => sum + item.estimatedHours, 0)

      return NextResponse.json({
        success: true,
        data: {
          totalItems,
          completedItems,
          inProgressItems,
          plannedItems,
          completionPercentage: Math.round((completedItems / totalItems) * 100),
          totalHours,
          completedHours,
          remainingHours: totalHours - completedHours,
          phases: roadmapPhases.length,
          currentPhase: roadmapPhases.find((p) => p.status === "current")?.title || "N/A",
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid type parameter",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Roadmap API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, status, progress } = body

    if (itemId && status) {
      const item = implementationItems.find((i) => i.id === itemId)
      if (!item) {
        return NextResponse.json(
          {
            success: false,
            error: "Implementation item not found",
          },
          { status: 404 },
        )
      }

      item.status = status

      return NextResponse.json({
        success: true,
        data: item,
      })
    }

    if (itemId && progress !== undefined) {
      const phase = roadmapPhases.find((p) => p.id === Number.parseInt(itemId))
      if (!phase) {
        return NextResponse.json(
          {
            success: false,
            error: "Phase not found",
          },
          { status: 404 },
        )
      }

      phase.progress = progress

      return NextResponse.json({
        success: true,
        data: phase,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid parameters",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Roadmap API PATCH Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

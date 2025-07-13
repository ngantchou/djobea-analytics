import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate database queries with realistic data
    const stats = {
      totalRequests: 247,
      successRate: 89.2,
      pendingRequests: 15,
      activeProviders: 23,
      completedToday: 12,
      revenue: 1250000,
      avgResponseTime: 14.5,
      customerSatisfaction: 4.8,
    }

    const charts = {
      activity: {
        labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        data: [12, 19, 15, 25, 22, 18, 24],
      },
      services: {
        labels: ["Plomberie", "Électricité", "Électroménager", "Maintenance"],
        data: [45, 35, 15, 5],
      },
      revenue: {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        data: [850000, 920000, 1100000, 980000, 1150000, 1250000],
      },
    }

    const activity = {
      requests: [
        {
          id: "REQ-001",
          client: "Mme Ngo Balla",
          service: "Fuite robinet cuisine",
          location: "Bonamoussadi Centre",
          time: "Il y a 5 min",
          status: "pending",
          avatar: "MN",
          priority: "urgent",
        },
        {
          id: "REQ-002",
          client: "M. Biya Etienne",
          service: "Réparation climatisation",
          location: "Bonamoussadi Nord",
          time: "Il y a 12 min",
          status: "active",
          avatar: "BE",
          priority: "high",
        },
        {
          id: "REQ-003",
          client: "Mme Kono Esther",
          service: "Installation prises électriques",
          location: "Bonamoussadi Sud",
          time: "Il y a 25 min",
          status: "completed",
          avatar: "KE",
          priority: "normal",
        },
        {
          id: "REQ-004",
          client: "M. Ateba Paul",
          service: "Débouchage évier",
          location: "Bonamoussadi Centre",
          time: "Il y a 1h",
          status: "active",
          avatar: "AP",
          priority: "normal",
        },
        {
          id: "REQ-005",
          client: "Mme Essomba Marie",
          service: "Réparation porte d'entrée",
          location: "Bonamoussadi Est",
          time: "Il y a 2h",
          status: "pending",
          avatar: "EM",
          priority: "low",
        },
      ],
      alerts: [
        {
          id: "ALT-001",
          title: "Temps de réponse élevé",
          description: "Prestataire M. Foko - Zone Bonamoussadi Centre",
          time: "Il y a 10 min",
          type: "warning",
          status: "Non résolu",
          severity: "medium",
        },
        {
          id: "ALT-002",
          title: "Nouveau prestataire validé",
          description: "Jean-Baptiste Electricité - Bonamoussadi Centre",
          time: "Il y a 1h",
          type: "success",
          status: "Validé",
          severity: "low",
        },
        {
          id: "ALT-003",
          title: "Erreur API WhatsApp",
          description: "Webhook timeout - Service de notification",
          time: "Il y a 2h",
          type: "error",
          status: "En cours",
          severity: "high",
        },
        {
          id: "ALT-004",
          title: "Pic d'activité détecté",
          description: "15 nouvelles demandes en 30 min",
          time: "Il y a 3h",
          type: "warning",
          status: "Surveillé",
          severity: "medium",
        },
        {
          id: "ALT-005",
          title: "Maintenance programmée",
          description: "Mise à jour système prévue à 02:00",
          time: "Il y a 4h",
          type: "info",
          status: "Planifié",
          severity: "low",
        },
      ],
    }

    const response = {
      success: true,
      data: {
        stats,
        charts,
        activity,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

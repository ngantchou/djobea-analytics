import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id

    // Simulate API call to get request details
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock detailed request data
    const requestDetails = {
      id: requestId,
      client: {
        name: "Mme Ngo Célestine",
        phone: "+237 6XX XXX XXX",
        email: "celestine.ngo@email.com",
        address: "Bonamoussadi Centre, Douala",
      },
      service: {
        type: "Plomberie",
        description:
          "Fuite robinet cuisine urgente - Le robinet de la cuisine fuit depuis ce matin, l'eau coule en continu",
        category: "Urgence",
        estimatedDuration: "2 heures",
      },
      location: {
        address: "Bonamoussadi Centre",
        coordinates: { lat: 4.0511, lng: 9.7679 },
        accessInstructions: "Maison bleue, portail noir",
      },
      status: "assigned",
      priority: "urgent",
      createdAt: "2024-01-15T08:30:00Z",
      assignedAt: "2024-01-15T09:15:00Z",
      provider: {
        id: "1",
        name: "Jean Dupont",
        phone: "+237 6XX XXX XXX",
        rating: 4.8,
        specialty: "Plomberie",
      },
      timeline: [
        {
          id: 1,
          title: "Demande créée",
          description: "Demande soumise par le client",
          timestamp: "2024-01-15T08:30:00Z",
          status: "completed",
        },
        {
          id: 2,
          title: "Prestataire assigné",
          description: "Jean Dupont assigné à cette demande",
          timestamp: "2024-01-15T09:15:00Z",
          status: "completed",
        },
        {
          id: 3,
          title: "En route",
          description: "Le prestataire est en route",
          timestamp: "2024-01-15T09:45:00Z",
          status: "current",
        },
      ],
      estimatedCost: {
        min: 15000,
        max: 30000,
        currency: "FCFA",
      },
    }

    return NextResponse.json(requestDetails)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch request details" }, { status: 500 })
  }
}

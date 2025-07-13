import { type NextRequest, NextResponse } from "next/server"

// Mock requests database
const mockRequests = [
  {
    id: "REQ-001",
    clientName: "Marie Dubois",
    clientPhone: "+237 6 12 34 56 78",
    clientEmail: "marie.dubois@email.com",
    serviceType: "Électricité",
    description: "Réparation d'une prise électrique défectueuse dans la cuisine",
    location: "Bonamoussadi Centre",
    address: "123 Rue de la Paix, Bonamoussadi",
    priority: "high",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    scheduledDate: "2024-01-16T14:00:00Z",
    urgency: true,
    estimatedCost: 15000,
    images: ["/placeholder.svg?height=200&width=300"],
    notes: "Client disponible après 14h",
  },
  {
    id: "REQ-002",
    clientName: "Jean Kono",
    clientPhone: "+237 6 98 76 54 32",
    clientEmail: "jean.kono@email.com",
    serviceType: "Plomberie",
    description: "Fuite d'eau sous l'évier de la salle de bain",
    location: "Bonamoussadi Nord",
    address: "456 Avenue des Palmiers, Bonamoussadi",
    priority: "urgent",
    status: "assigned",
    createdAt: "2024-01-14T08:15:00Z",
    updatedAt: "2024-01-14T09:30:00Z",
    scheduledDate: "2024-01-15T09:00:00Z",
    assignedProvider: {
      id: "PROV-003",
      name: "Paul Plomberie",
      rating: 4.6,
    },
    urgency: true,
    estimatedCost: 25000,
    images: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "REQ-003",
    clientName: "Fatou Ngo",
    clientPhone: "+237 6 11 22 33 44",
    clientEmail: "fatou.ngo@email.com",
    serviceType: "Ménage",
    description: "Grand ménage de printemps pour un appartement 3 pièces",
    location: "Bonamoussadi Sud",
    address: "789 Boulevard du Soleil, Bonamoussadi",
    priority: "normal",
    status: "in-progress",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    scheduledDate: "2024-01-15T08:00:00Z",
    assignedProvider: {
      id: "PROV-004",
      name: "Alain Maintenance",
      rating: 4.5,
    },
    urgency: false,
    estimatedCost: 20000,
  },
  {
    id: "REQ-004",
    clientName: "Paul Ateba",
    clientPhone: "+237 6 55 66 77 88",
    clientEmail: "paul.ateba@email.com",
    serviceType: "Jardinage",
    description: "Taille des haies et entretien du jardin",
    location: "Bonamoussadi Est",
    address: "321 Rue des Fleurs, Bonamoussadi",
    priority: "low",
    status: "completed",
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-12T17:30:00Z",
    scheduledDate: "2024-01-12T08:00:00Z",
    completedDate: "2024-01-12T17:30:00Z",
    assignedProvider: {
      id: "PROV-004",
      name: "Alain Maintenance",
      rating: 4.5,
    },
    urgency: false,
    estimatedCost: 18000,
    finalCost: 18000,
    rating: 5,
    feedback: "Excellent travail, très professionnel et ponctuel",
  },
  {
    id: "REQ-005",
    clientName: "Sophie Biya",
    clientPhone: "+237 6 99 88 77 66",
    clientEmail: "sophie.biya@email.com",
    serviceType: "Électroménager",
    description: "Réparation d'un réfrigérateur qui ne refroidit plus",
    location: "Bonamoussadi Centre",
    address: "654 Place du Marché, Bonamoussadi",
    priority: "high",
    status: "cancelled",
    createdAt: "2024-01-08T11:10:00Z",
    updatedAt: "2024-01-09T10:00:00Z",
    urgency: false,
    estimatedCost: 30000,
    notes: "Client a annulé - a acheté un nouveau réfrigérateur",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const priority = searchParams.get("priority") || ""
    const serviceType = searchParams.get("serviceType") || ""
    const location = searchParams.get("location") || ""
    const dateRange = searchParams.get("dateRange") || ""

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    let filteredRequests = [...mockRequests]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRequests = filteredRequests.filter(
        (request) =>
          request.clientName.toLowerCase().includes(searchLower) ||
          request.serviceType.toLowerCase().includes(searchLower) ||
          request.location.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower),
      )
    }

    if (status && status !== "all") {
      filteredRequests = filteredRequests.filter((request) => request.status === status)
    }

    if (priority && priority !== "all") {
      filteredRequests = filteredRequests.filter((request) => request.priority === priority)
    }

    if (serviceType && serviceType !== "all") {
      filteredRequests = filteredRequests.filter((request) => request.serviceType === serviceType)
    }

    if (location && location !== "all") {
      filteredRequests = filteredRequests.filter((request) => request.location.includes(location))
    }

    // Date range filtering
    if (dateRange && dateRange !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "quarter":
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          break
        default:
          startDate = new Date(0)
      }

      filteredRequests = filteredRequests.filter((request) => new Date(request.createdAt) >= startDate)
    }

    // Sort by creation date (newest first)
    filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const total = filteredRequests.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

    // Calculate stats
    const stats = {
      total: mockRequests.length,
      pending: mockRequests.filter((r) => r.status === "pending").length,
      assigned: mockRequests.filter((r) => r.status === "assigned").length,
      inProgress: mockRequests.filter((r) => r.status === "in-progress").length,
      completed: mockRequests.filter((r) => r.status === "completed").length,
      cancelled: mockRequests.filter((r) => r.status === "cancelled").length,
      avgResponseTime: "2.5h",
      completionRate: 85,
    }

    return NextResponse.json({
      data: paginatedRequests,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error in requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRequest = {
      id: `REQ-${Date.now()}`,
      clientName: body.clientName || "",
      clientPhone: body.clientPhone || "",
      clientEmail: body.clientEmail || "",
      serviceType: body.serviceType || "",
      description: body.description || "",
      location: body.location || "",
      address: body.address || "",
      priority: body.priority || "normal",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      urgency: body.urgency || false,
      estimatedCost: body.estimatedCost || 0,
      images: body.images || [],
      notes: body.notes || "",
    }

    // In a real app, save to database
    mockRequests.push(newRequest)

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

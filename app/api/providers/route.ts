import { type NextRequest, NextResponse } from "next/server"

// Enhanced mock providers database with more realistic data
const mockProviders = [
  {
    id: "PROV-001",
    name: "Jean-Baptiste Électricité",
    email: "jb.electricite@email.com",
    phone: "+237 6 12 34 56 78",
    whatsapp: "+237 6 12 34 56 78",
    services: ["Électricité", "Installation", "Réparation"],
    coverageAreas: ["Bonamoussadi Centre", "Bonamoussadi Nord"],
    specialty: "Électricité",
    zone: "Bonamoussadi Centre",
    rating: 4.8,
    reviewCount: 45,
    totalMissions: 67,
    completedJobs: 62,
    cancelledJobs: 5,
    successRate: 92,
    responseTime: 15,
    performanceStatus: "excellent" as const,
    status: "active" as const,
    availability: "available" as const,
    joinDate: "2023-01-15",
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hourlyRate: 6500,
    experience: 8,
    acceptanceRate: 95,
    description:
      "Électricien professionnel avec 8 ans d'expérience. Spécialisé dans les installations résidentielles et commerciales.",
  },
  {
    id: "PROV-002",
    name: "Marie Réparation",
    email: "marie.reparation@email.com",
    phone: "+237 6 98 76 54 32",
    whatsapp: "+237 6 98 76 54 32",
    services: ["Électroménager", "Réparation", "Maintenance"],
    coverageAreas: ["Bonamoussadi Nord", "Bonamoussadi Est"],
    specialty: "Électroménager",
    zone: "Bonamoussadi Nord",
    rating: 4.9,
    reviewCount: 38,
    totalMissions: 45,
    completedJobs: 43,
    cancelledJobs: 2,
    successRate: 96,
    responseTime: 12,
    performanceStatus: "excellent" as const,
    status: "active" as const,
    availability: "available" as const,
    joinDate: "2023-03-20",
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    hourlyRate: 5500,
    experience: 6,
    acceptanceRate: 98,
    description: "Technicienne spécialisée en réparation d'électroménager. Service rapide et efficace.",
  },
  {
    id: "PROV-003",
    name: "Paul Plomberie",
    email: "paul.plomberie@email.com",
    phone: "+237 6 11 22 33 44",
    whatsapp: "+237 6 11 22 33 44",
    services: ["Plomberie", "Débouchage", "Installation sanitaire"],
    coverageAreas: ["Bonamoussadi Sud", "Bonamoussadi Centre"],
    specialty: "Plomberie",
    zone: "Bonamoussadi Sud",
    rating: 4.6,
    reviewCount: 52,
    totalMissions: 78,
    completedJobs: 70,
    cancelledJobs: 8,
    successRate: 90,
    responseTime: 20,
    performanceStatus: "good" as const,
    status: "active" as const,
    availability: "busy" as const,
    joinDate: "2022-11-10",
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    hourlyRate: 5500,
    experience: 12,
    acceptanceRate: 88,
    description: "Plombier expérimenté disponible 7j/7 pour urgences et installations.",
  },
  {
    id: "PROV-004",
    name: "Alain Maintenance",
    email: "alain.maintenance@email.com",
    phone: "+237 6 55 66 77 88",
    whatsapp: "+237 6 55 66 77 88",
    services: ["Maintenance", "Jardinage", "Réparations diverses"],
    coverageAreas: ["Bonamoussadi Est", "Bonamoussadi Nord"],
    specialty: "Maintenance",
    zone: "Bonamoussadi Est",
    rating: 4.5,
    reviewCount: 28,
    totalMissions: 35,
    completedJobs: 32,
    cancelledJobs: 3,
    successRate: 91,
    responseTime: 25,
    performanceStatus: "good" as const,
    status: "active" as const,
    availability: "available" as const,
    joinDate: "2023-06-01",
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    hourlyRate: 4500,
    experience: 5,
    acceptanceRate: 85,
    description: "Agent de maintenance polyvalent pour tous vos besoins domestiques.",
  },
  {
    id: "PROV-005",
    name: "Francis Kono",
    email: "francis.kono@email.com",
    phone: "+237 6 99 88 77 66",
    whatsapp: "+237 6 99 88 77 66",
    services: ["Menuiserie", "Réparation portes", "Installation"],
    coverageAreas: ["Bonamoussadi Centre"],
    specialty: "Menuiserie",
    zone: "Bonamoussadi Centre",
    rating: 3.2,
    reviewCount: 15,
    totalMissions: 20,
    completedJobs: 15,
    cancelledJobs: 5,
    successRate: 75,
    responseTime: 45,
    performanceStatus: "warning" as const,
    status: "inactive" as const,
    availability: "offline" as const,
    joinDate: "2023-08-15",
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    hourlyRate: 5000,
    experience: 3,
    acceptanceRate: 70,
    description: "Menuisier en formation, tarifs compétitifs.",
  },
  {
    id: "PROV-006",
    name: "Sophie Ménage",
    email: "sophie.menage@email.com",
    phone: "+237 6 77 88 99 00",
    whatsapp: "+237 6 77 88 99 00",
    services: ["Ménage", "Repassage", "Nettoyage"],
    coverageAreas: ["Bonamoussadi Centre", "Bonamoussadi Nord", "Bonamoussadi Sud"],
    specialty: "Ménage",
    zone: "Bonamoussadi Centre",
    rating: 4.7,
    reviewCount: 89,
    totalMissions: 156,
    completedJobs: 148,
    cancelledJobs: 8,
    successRate: 95,
    responseTime: 10,
    performanceStatus: "excellent" as const,
    status: "active" as const,
    availability: "available" as const,
    joinDate: "2022-09-05",
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    hourlyRate: 3500,
    experience: 10,
    acceptanceRate: 92,
    description: "Service de ménage professionnel, ponctuelle et soigneuse.",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const specialty = searchParams.get("specialty") || ""
    const zone = searchParams.get("zone") || ""
    const minRating = Number.parseFloat(searchParams.get("minRating") || "0")
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredProviders = [...mockProviders]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProviders = filteredProviders.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchLower) ||
          provider.email.toLowerCase().includes(searchLower) ||
          provider.specialty.toLowerCase().includes(searchLower) ||
          provider.zone.toLowerCase().includes(searchLower) ||
          provider.services.some((service) => service.toLowerCase().includes(searchLower)),
      )
    }

    if (status && status !== "all") {
      filteredProviders = filteredProviders.filter((provider) => provider.status === status)
    }

    if (specialty && specialty !== "all") {
      filteredProviders = filteredProviders.filter((provider) => provider.specialty === specialty)
    }

    if (zone && zone !== "all") {
      filteredProviders = filteredProviders.filter((provider) => provider.zone === zone)
    }

    if (minRating > 0) {
      filteredProviders = filteredProviders.filter((provider) => provider.rating >= minRating)
    }

    // Apply sorting
    filteredProviders.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "rating":
          aValue = a.rating
          bValue = b.rating
          break
        case "missions":
          aValue = a.totalMissions
          bValue = b.totalMissions
          break
        case "joinDate":
          aValue = new Date(a.joinDate)
          bValue = new Date(b.joinDate)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === "desc") {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })

    // Pagination
    const total = filteredProviders.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProviders = filteredProviders.slice(startIndex, endIndex)

    // Calculate stats
    const stats = {
      total: mockProviders.length,
      active: mockProviders.filter((p) => p.status === "active").length,
      inactive: mockProviders.filter((p) => p.status === "inactive").length,
      suspended: mockProviders.filter((p) => p.status === "suspended").length,
      available: mockProviders.filter((p) => p.availability === "available").length,
      avgRating: mockProviders.reduce((sum, p) => sum + p.rating, 0) / mockProviders.length,
      newThisMonth: mockProviders.filter((p) => {
        const joinDate = new Date(p.joinDate)
        const now = new Date()
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
      }).length,
      topPerformers: mockProviders
        .filter((p) => p.rating >= 4.5 && p.status === "active")
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5),
    }

    return NextResponse.json({
      data: paginatedProviders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats,
    })
  } catch (error) {
    console.error("Error in providers API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.phone || !body.services || !body.coverage) {
      return NextResponse.json(
        { error: "Champs requis manquants: nom, téléphone, services, zones de couverture" },
        { status: 400 },
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newProvider = {
      id: `PROV-${String(Date.now()).slice(-6)}`,
      name: body.name,
      email: body.email || "",
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      services: body.services
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      coverageAreas: body.coverage
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      specialty: body.services.split(",")[0]?.trim() || "Général",
      zone: body.coverage.split(",")[0]?.trim() || "Non spécifié",
      rating: 0,
      reviewCount: 0,
      totalMissions: 0,
      completedJobs: 0,
      cancelledJobs: 0,
      successRate: 0,
      responseTime: 30,
      performanceStatus: "good" as const,
      status: "active" as const,
      availability: "available" as const,
      joinDate: new Date().toISOString().split("T")[0],
      lastActivity: new Date().toISOString(),
      hourlyRate: body.rate ? Number.parseInt(body.rate) : 0,
      experience: body.experience ? Number.parseInt(body.experience) : 0,
      acceptanceRate: 100,
      description: body.description || "",
    }

    // In a real app, save to database
    mockProviders.push(newProvider)

    return NextResponse.json(newProvider, { status: 201 })
  } catch (error) {
    console.error("Error creating provider:", error)
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 })
  }
}

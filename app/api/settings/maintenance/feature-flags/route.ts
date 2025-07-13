import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate loading feature flags from database
    const featureFlags = [
      {
        id: "new-matching-algorithm",
        name: "Nouvel algorithme de matching",
        description: "Amélioration de l'algorithme de matching prestataires",
        enabled: true,
        rolloutPercentage: 50,
        environments: ["staging", "production"],
        createdAt: "2025-01-01T10:00:00Z",
        updatedAt: "2025-01-07T15:30:00Z",
        conditions: {
          userSegment: "premium",
          region: "cameroon",
        },
      },
      {
        id: "enhanced-notifications",
        name: "Notifications améliorées",
        description: "Nouveau système de notifications push",
        enabled: false,
        rolloutPercentage: 0,
        environments: ["development"],
        createdAt: "2025-01-05T14:00:00Z",
        updatedAt: "2025-01-05T14:00:00Z",
      },
    ]

    return NextResponse.json(featureFlags)
  } catch (error) {
    console.error("Error loading feature flags:", error)
    return NextResponse.json({ error: "Failed to load feature flags" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, enabled, rolloutPercentage, environments, conditions } = body

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    if (rolloutPercentage < 0 || rolloutPercentage > 100) {
      return NextResponse.json({ error: "Rollout percentage must be between 0 and 100" }, { status: 400 })
    }

    const featureFlag = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      description,
      enabled: enabled || false,
      rolloutPercentage: rolloutPercentage || 0,
      environments: environments || ["development"],
      conditions: conditions || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("Creating feature flag:", featureFlag)

    // Simulate saving to database
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(featureFlag, { status: 201 })
  } catch (error) {
    console.error("Error creating feature flag:", error)
    return NextResponse.json({ error: "Failed to create feature flag" }, { status: 500 })
  }
}

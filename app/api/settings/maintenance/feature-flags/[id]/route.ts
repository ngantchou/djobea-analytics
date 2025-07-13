import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate loading feature flag from database
    const featureFlag = {
      id,
      name: "Sample Feature Flag",
      description: "This is a sample feature flag",
      enabled: true,
      rolloutPercentage: 50,
      environments: ["development", "staging"],
      createdAt: "2025-01-01T10:00:00Z",
      updatedAt: "2025-01-07T15:30:00Z",
    }

    return NextResponse.json(featureFlag)
  } catch (error) {
    console.error("Error loading feature flag:", error)
    return NextResponse.json({ error: "Failed to load feature flag" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    console.log(`Updating feature flag ${id}:`, body)

    // Simulate updating in database
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedFlag = {
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedFlag)
  } catch (error) {
    console.error("Error updating feature flag:", error)
    return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log(`Deleting feature flag: ${id}`)

    // Simulate deleting from database
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: `Feature flag ${id} deleted successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error deleting feature flag:", error)
    return NextResponse.json({ error: "Failed to delete feature flag" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import swaggerDoc from "@/docs/swagger.json"

interface ApiEndpoint {
  path: string
  method: string
  summary: string
  description: string
  tags: string[]
  parameters?: any[]
  requestBody?: any
  responses: any
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")

    if (format === "swagger") {
      return NextResponse.json(swaggerDoc)
    }

    // Extract endpoints from swagger doc
    const endpoints: ApiEndpoint[] = []

    Object.entries(swaggerDoc.paths).forEach(([path, pathData]) => {
      Object.entries(pathData as any).forEach(([method, methodData]: [string, any]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: methodData.summary || "",
          description: methodData.description || "",
          tags: methodData.tags || [],
          parameters: methodData.parameters,
          requestBody: methodData.requestBody,
          responses: methodData.responses,
        })
      })
    })

    let filteredEndpoints = endpoints

    if (tag) {
      filteredEndpoints = filteredEndpoints.filter((endpoint) => endpoint.tags.includes(tag))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredEndpoints = filteredEndpoints.filter(
        (endpoint) =>
          endpoint.path.toLowerCase().includes(searchLower) ||
          endpoint.summary.toLowerCase().includes(searchLower) ||
          endpoint.description.toLowerCase().includes(searchLower),
      )
    }

    // Get unique tags
    const allTags = new Set<string>()
    endpoints.forEach((endpoint) => {
      endpoint.tags.forEach((tag) => allTags.add(tag))
    })

    return NextResponse.json({
      success: true,
      data: {
        info: swaggerDoc.info,
        servers: swaggerDoc.servers,
        endpoints: filteredEndpoints,
        tags: Array.from(allTags).sort(),
        totalEndpoints: endpoints.length,
      },
    })
  } catch (error) {
    console.error("API Docs Error:", error)
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
    const { action, endpoint, method, feedback } = body

    if (action === "test") {
      // Simulate API endpoint testing
      const testResult = {
        endpoint: `${method} ${endpoint}`,
        status: "success",
        responseTime: Math.floor(Math.random() * 500) + 100,
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: testResult,
      })
    }

    if (action === "feedback") {
      // Save feedback about API documentation
      console.log("API Documentation Feedback:", { endpoint, method, feedback })

      return NextResponse.json({
        success: true,
        message: "Feedback submitted successfully",
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
    console.error("API Docs POST Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

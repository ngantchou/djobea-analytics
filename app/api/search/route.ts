import { type NextRequest, NextResponse } from "next/server"
import { searchService } from "@/lib/services/search-service"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const sortBy = searchParams.get("sortBy") || "relevance"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    // Parse filters
    const filters: any = {}
    const typeFilter = searchParams.get("type")
    if (typeFilter) {
      try {
        filters.type = JSON.parse(typeFilter)
      } catch {
        filters.type = [typeFilter]
      }
    }

    const dateRangeFilter = searchParams.get("dateRange")
    if (dateRangeFilter) {
      try {
        filters.dateRange = JSON.parse(dateRangeFilter)
      } catch {
        // Ignore invalid date range
      }
    }

    const locationFilter = searchParams.get("location")
    if (locationFilter) {
      filters.location = locationFilter
    }

    const statusFilter = searchParams.get("status")
    if (statusFilter) {
      filters.status = statusFilter
    }

    const categoryFilter = searchParams.get("category")
    if (categoryFilter) {
      filters.category = categoryFilter
    }

    logger.info("Search API called", { query, filters, page, limit })

    const results = await searchService.search(query, filters, {
      page,
      limit,
      sortBy,
      sortOrder,
    })

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    logger.error("Search API error", { error })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || !content.id || !content.title || !content.type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id, title, type",
        },
        { status: 400 },
      )
    }

    logger.info("Indexing content via API", { id: content.id, type: content.type })

    await searchService.indexContent(content)

    return NextResponse.json({
      success: true,
      message: "Content indexed successfully",
    })
  } catch (error) {
    logger.error("Content indexing API error", { error })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to index content",
      },
      { status: 500 },
    )
  }
}

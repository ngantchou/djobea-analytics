import { type NextRequest, NextResponse } from "next/server"
import { searchService } from "@/lib/services/search-service"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || undefined

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    logger.info("Search suggestions API called", { query, type })

    const suggestions = await searchService.getSuggestions(query, type)

    return NextResponse.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    logger.error("Search suggestions API error", { error })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch suggestions",
      },
      { status: 500 },
    )
  }
}

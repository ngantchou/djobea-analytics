"use client"
import { logger } from "@/lib/logger"

export interface SearchResult {
  id: string
  title: string
  description: string
  type: "provider" | "request" | "message" | "setting" | "page"
  url: string
  metadata?: Record<string, any>
  relevance: number
  createdAt?: string
  updatedAt?: string
}

export interface SearchSuggestion {
  text: string
  type: "query" | "filter" | "entity"
  count?: number
  category?: string
}

export interface SearchFilters {
  type?: string[]
  dateRange?: {
    start: string
    end: string
  }
  location?: string
  status?: string
  category?: string
}

export interface SearchResponse {
  results: SearchResult[]
  suggestions: SearchSuggestion[]
  total: number
  took: number
  filters: Record<string, any>
}

class SearchService {
  private searchHistory: string[] = []
  private popularSearches: string[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadSearchHistory()
    }
  }

  private loadSearchHistory() {
    try {
      const history = localStorage.getItem("search_history")
      if (history) {
        this.searchHistory = JSON.parse(history)
      }
    } catch (error) {
      logger.error("Failed to load search history", { error })
    }
  }

  private saveSearchHistory() {
    try {
      localStorage.setItem("search_history", JSON.stringify(this.searchHistory))
    } catch (error) {
      logger.error("Failed to save search history", { error })
    }
  }

  private addToHistory(query: string) {
    if (!query.trim()) return

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter((item) => item !== query)

    // Add to beginning
    this.searchHistory.unshift(query)

    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20)

    this.saveSearchHistory()
  }

  async search(
    query: string,
    filters?: SearchFilters,
    options?: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: "asc" | "desc"
    },
  ): Promise<SearchResponse> {
    try {
      logger.info("Performing search", { query, filters, options })

      const params = new URLSearchParams({
        q: query,
        page: (options?.page || 1).toString(),
        limit: (options?.limit || 20).toString(),
      })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, JSON.stringify(value))
          }
        })
      }

      if (options?.sortBy) {
        params.append("sortBy", options.sortBy)
        params.append("sortOrder", options.sortOrder || "desc")
      }

      const response = await fetch(`/api/search?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Search failed")
      }

      if (result.success && result.data) {
        // Add to search history
        this.addToHistory(query)

        logger.info("Search completed successfully", {
          query,
          resultsCount: result.data.results.length,
          took: result.data.took,
        })

        return result.data
      }

      throw new Error(result.error || "Search failed")
    } catch (error) {
      logger.error("Search failed", { error, query, filters })
      throw error
    }
  }

  async getSuggestions(query: string, type?: string): Promise<SearchSuggestion[]> {
    try {
      logger.info("Fetching search suggestions", { query, type })

      const params = new URLSearchParams({ q: query })
      if (type) {
        params.append("type", type)
      }

      const response = await fetch(`/api/search/suggestions?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch suggestions")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch suggestions")
    } catch (error) {
      logger.error("Failed to fetch search suggestions", { error, query })
      throw error
    }
  }

  async getPopularSearches(): Promise<string[]> {
    try {
      logger.info("Fetching popular searches")

      const response = await fetch("/api/search/popular")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch popular searches")
      }

      if (result.success && result.data) {
        this.popularSearches = result.data
        return result.data
      }

      throw new Error(result.error || "Failed to fetch popular searches")
    } catch (error) {
      logger.error("Failed to fetch popular searches", { error })
      throw error
    }
  }

  getSearchHistory(): string[] {
    return this.searchHistory
  }

  clearSearchHistory(): void {
    this.searchHistory = []
    this.saveSearchHistory()
    logger.info("Search history cleared")
  }

  removeFromHistory(query: string): void {
    this.searchHistory = this.searchHistory.filter((item) => item !== query)
    this.saveSearchHistory()
    logger.info("Removed from search history", { query })
  }

  async indexContent(content: {
    id: string
    title: string
    description: string
    type: string
    url: string
    metadata?: Record<string, any>
  }): Promise<void> {
    try {
      logger.info("Indexing content", { id: content.id, type: content.type })

      const response = await fetch("/api/search/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to index content")
      }

      if (result.success) {
        logger.info("Content indexed successfully", { id: content.id })
        return
      }

      throw new Error(result.error || "Failed to index content")
    } catch (error) {
      logger.error("Failed to index content", { error, content })
      throw error
    }
  }

  async removeFromIndex(id: string): Promise<void> {
    try {
      logger.info("Removing content from index", { id })

      const response = await fetch(`/api/search/index/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to remove from index")
      }

      if (result.success) {
        logger.info("Content removed from index", { id })
        return
      }

      throw new Error(result.error || "Failed to remove from index")
    } catch (error) {
      logger.error("Failed to remove content from index", { error, id })
      throw error
    }
  }

  async getSearchAnalytics(period = "7d"): Promise<{
    totalSearches: number
    uniqueQueries: number
    avgResultsPerSearch: number
    topQueries: Array<{ query: string; count: number }>
    searchTrends: Array<{ date: string; count: number }>
    noResultsQueries: Array<{ query: string; count: number }>
  }> {
    try {
      logger.info("Fetching search analytics", { period })

      const response = await fetch(`/api/search/analytics?period=${period}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch search analytics")
      }

      if (result.success && result.data) {
        return result.data
      }

      throw new Error(result.error || "Failed to fetch search analytics")
    } catch (error) {
      logger.error("Failed to fetch search analytics", { error, period })
      throw error
    }
  }
}

export const searchService = new SearchService()
export default searchService

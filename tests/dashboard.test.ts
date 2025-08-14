import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '@/hooks/use-dashboard-data'

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getDashboardData: vi.fn()
  }
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn()
  }
}))

import { apiClient } from '@/lib/api-client'

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch dashboard data successfully', async () => {
    const mockData = {
      stats: {
        totalProviders: 150,
        activeProviders: 120,
        providersChange: 5.2,
        totalRequests: 2500,
        pendingRequests: 75,
        requestsChange: 12.3,
        totalRevenue: 125000,
        monthlyRevenue: 45000,
        revenueChange: 8.7,
        completionRate: 95,
        rateChange: 2.1
      }
    }

    vi.mocked(apiClient.getDashboardData).mockResolvedValueOnce({
      success: true,
      data: mockData
    })

    const { result } = renderHook(() => useDashboardData('7d'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
    expect(apiClient.getDashboardData).toHaveBeenCalledWith('7d')
  })

  it('should handle API errors gracefully', async () => {
    const mockError = 'Dashboard service unavailable'

    vi.mocked(apiClient.getDashboardData).mockResolvedValueOnce({
      success: false,
      error: mockError
    })

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(mockError)
  })

  it('should handle network errors', async () => {
    vi.mocked(apiClient.getDashboardData).mockRejectedValueOnce(
      new Error('Network connection failed')
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Network connection failed')
  })

  it('should refetch data when refetch is called', async () => {
    const mockData = { stats: { totalProviders: 100 } }

    vi.mocked(apiClient.getDashboardData).mockResolvedValue({
      success: true,
      data: mockData
    })

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call refetch
    result.current.refetch()

    await waitFor(() => {
      expect(apiClient.getDashboardData).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle different time periods', async () => {
    const mockData = { stats: { totalProviders: 75 } }

    vi.mocked(apiClient.getDashboardData).mockResolvedValue({
      success: true,
      data: mockData
    })

    const { result } = renderHook(() => useDashboardData('30d'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiClient.getDashboardData).toHaveBeenCalledWith('30d')
  })
})
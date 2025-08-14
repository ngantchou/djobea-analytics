import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useProvidersData } from '@/hooks/use-providers-data'

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getProviders: vi.fn(),
    createProvider: vi.fn(),
    updateProvider: vi.fn(),
    deleteProvider: vi.fn()
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

describe('useProvidersData', () => {
  const mockProvider = {
    id: '1',
    name: 'Jean Plombier',
    phone: '+237612345678',
    email: 'jean@example.com',
    services: ['Plomberie', 'Électricité'],
    coverageAreas: ['Douala', 'Yaoundé'],
    rating: 4.8,
    reviewCount: 125,
    totalMissions: 250,
    status: 'active' as const,
    availability: 'available' as const,
    specialty: 'Plomberie',
    zone: 'Centre',
    joinDate: '2023-01-15T00:00:00Z',
    lastActivity: '2024-01-15T10:30:00Z',
    hourlyRate: 2500,
    experience: 5
  }

  const mockApiResponse = {
    success: true,
    data: [mockProvider],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    },
    stats: {
      total: 1,
      active: 1,
      inactive: 0,
      suspended: 0,
      available: 1,
      avgRating: 4.8,
      newThisMonth: 0
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch providers data successfully', async () => {
    vi.mocked(apiClient.getProviders).mockResolvedValueOnce(mockApiResponse)

    const { result } = renderHook(() => useProvidersData())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockApiResponse)
    expect(result.current.error).toBe(null)
    expect(apiClient.getProviders).toHaveBeenCalledWith({})
  })

  it('should handle filters correctly', async () => {
    const filters = {
      search: 'Jean',
      service: 'Plomberie',
      status: 'active',
      page: 2,
      limit: 10
    }

    vi.mocked(apiClient.getProviders).mockResolvedValueOnce(mockApiResponse)

    const { result } = renderHook(() => useProvidersData(filters))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(apiClient.getProviders).toHaveBeenCalledWith(filters)
  })

  it('should handle API errors', async () => {
    const mockError = 'Failed to fetch providers'

    vi.mocked(apiClient.getProviders).mockResolvedValueOnce({
      success: false,
      error: mockError
    })

    const { result } = renderHook(() => useProvidersData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(mockError)
  })

  it('should create provider successfully', async () => {
    const newProviderData = {
      name: 'Marie Electricienne',
      phone: '+237698765432',
      email: 'marie@example.com',
      services: ['Électricité'],
      specialty: 'Électricité'
    }

    vi.mocked(apiClient.getProviders).mockResolvedValue(mockApiResponse)
    vi.mocked(apiClient.createProvider).mockResolvedValueOnce({
      success: true,
      data: { ...mockProvider, id: '2', ...newProviderData }
    })

    const { result } = renderHook(() => useProvidersData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call create provider
    await result.current.createProvider(newProviderData)

    expect(apiClient.createProvider).toHaveBeenCalledWith(newProviderData)
    // Should refetch data after creation
    expect(apiClient.getProviders).toHaveBeenCalledTimes(2)
  })

  it('should update provider successfully', async () => {
    const updateData = { name: 'Jean Plombier Senior' }

    vi.mocked(apiClient.getProviders).mockResolvedValue(mockApiResponse)
    vi.mocked(apiClient.updateProvider).mockResolvedValueOnce({
      success: true,
      data: { ...mockProvider, ...updateData }
    })

    const { result } = renderHook(() => useProvidersData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call update provider
    await result.current.updateProvider('1', updateData)

    expect(apiClient.updateProvider).toHaveBeenCalledWith('1', updateData)
    // Should refetch data after update
    expect(apiClient.getProviders).toHaveBeenCalledTimes(2)
  })

  it('should delete provider successfully', async () => {
    vi.mocked(apiClient.getProviders).mockResolvedValue(mockApiResponse)
    vi.mocked(apiClient.deleteProvider).mockResolvedValueOnce({
      success: true,
      data: {}
    })

    const { result } = renderHook(() => useProvidersData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call delete provider
    await result.current.deleteProvider('1')

    expect(apiClient.deleteProvider).toHaveBeenCalledWith('1')
    // Should refetch data after deletion
    expect(apiClient.getProviders).toHaveBeenCalledTimes(2)
  })

  it('should handle create provider errors', async () => {
    vi.mocked(apiClient.getProviders).mockResolvedValue(mockApiResponse)
    vi.mocked(apiClient.createProvider).mockResolvedValueOnce({
      success: false,
      error: 'Validation failed'
    })

    const { result } = renderHook(() => useProvidersData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(result.current.createProvider({})).rejects.toThrow('Validation failed')
  })
})
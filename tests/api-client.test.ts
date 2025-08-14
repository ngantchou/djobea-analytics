import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiClient } from '@/lib/api-client'

// Mock fetch globally
global.fetch = vi.fn()

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset any stored tokens
    localStorage.clear()
  })

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: '1', name: 'Test User' }
        }
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response)

      const result = await apiClient.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle login failure', async () => {
      const mockError = {
        success: false,
        error: 'Invalid credentials'
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve(mockError),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response)

      const result = await apiClient.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid credentials')
    })
  })

  describe('Dashboard Data', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockData = {
        success: true,
        data: {
          stats: {
            totalProviders: 150,
            activeProviders: 120,
            totalRequests: 2500,
            completionRate: 95
          }
        }
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response)

      const result = await apiClient.getDashboardData('7d')

      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard'),
        expect.objectContaining({
          method: 'GET'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiClient.getDashboardData()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('should handle timeout', async () => {
      vi.mocked(fetch).mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 5000))
      )

      const result = await apiClient.healthCheck()

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })
  })

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      // First call fails, second succeeds
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
          headers: new Headers({ 'content-type': 'application/json' })
        } as Response)

      const result = await apiClient.healthCheck()

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })
  })
})
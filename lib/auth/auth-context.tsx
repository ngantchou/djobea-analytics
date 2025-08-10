"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, AuthContextType, LoginCredentials, AuthResponse, Permission, UserRole } from "./types"
import { authService } from "./auth-service"
import { ROLE_PERMISSIONS } from "./config"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false
      return user.permissions?.includes(permission) || false
    },
    [user],
  )

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false
      return user.role === role
    },
    [user],
  )

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(credentials)

      if (response.success && response.user) {
        // Ensure user has permissions based on role
        const userWithPermissions = {
          ...response.user,
          permissions: ROLE_PERMISSIONS[response.user.role] || [],
        }
        setUser(userWithPermissions)
      } else {
        setError(response.error || "Login failed")
      }

      return response
    } catch (error) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setError(null)
      setIsLoading(false)
    }
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken()
      if (!success) {
        setUser(null)
        setError("Session expired. Please login again.")
      }
      return success
    } catch (error) {
      console.error("Token refresh error:", error)
      setUser(null)
      setError("Session expired. Please login again.")
      return false
    }
  }, [])

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Check for stored user
        const storedUser = authService.getStoredUser()
        const storedTokens = authService.getStoredTokens()

        if (storedUser && storedTokens) {
          // Check if token is expired
          if (authService.isTokenExpired(storedTokens)) {
            // Try to refresh token
            const refreshed = await authService.refreshToken()
            if (!refreshed) {
              setUser(null)
              setIsLoading(false)
              return
            }
          }

          // Verify user with server
          const currentUser = await authService.getCurrentUser()
          if (currentUser) {
            const userWithPermissions = {
              ...currentUser,
              permissions: ROLE_PERMISSIONS[currentUser.role] || [],
            }
            setUser(userWithPermissions)
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh token
  useEffect(() => {
    if (!user) return

    const tokens = authService.getStoredTokens()
    if (!tokens) return

    const refreshInterval = setInterval(async () => {
      if (authService.shouldRefreshToken(tokens)) {
        await refreshToken()
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshInterval)
  }, [user, refreshToken])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    clearError,
    hasPermission,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  permissions?: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userStr = localStorage.getItem("auth_user")

        if (token && userStr) {
          const user = JSON.parse(userStr)

          // Verify token with backend
          const response = await apiClient.getUserProfile()

          if (response.success && response.data) {
            setState({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })

            // Update stored user data
            localStorage.setItem("auth_user", JSON.stringify(response.data))
          } else {
            // Token is invalid, clear auth data
            localStorage.removeItem("auth_token")
            localStorage.removeItem("auth_user")
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        logger.error("Auth initialization failed", error)
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to initialize authentication",
        })
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.login(email, password)

      if (response.success && response.data) {
        const { user, token } = response.data

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        logger.info("User logged in successfully", { userId: user.id })
        return { success: true, user }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || "Login failed",
        }))
        return { success: false, error: response.error || "Login failed" }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      logger.error("Login failed", error)
      return { success: false, error: errorMessage }
    }
  }, [])

  const register = useCallback(async (userData: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.register(userData)

      if (response.success && response.data) {
        const { user, token } = response.data

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        logger.info("User registered successfully", { userId: user.id })
        return { success: true, user }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || "Registration failed",
        }))
        return { success: false, error: response.error || "Registration failed" }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      logger.error("Registration failed", error)
      return { success: false, error: errorMessage }
    }
  }, [])

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      await apiClient.logout()
    } catch (error) {
      logger.error("Logout API call failed", error)
    } finally {
      // Always clear local state regardless of API response
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      logger.info("User logged out")
    }
  }, [])

  const updateProfile = useCallback(
    async (profileData: any) => {
      if (!state.user) return { success: false, error: "Not authenticated" }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await apiClient.updateUserProfile(profileData)

        if (response.success && response.data) {
          const updatedUser = { ...state.user, ...response.data }

          setState((prev) => ({
            ...prev,
            user: updatedUser,
            isLoading: false,
            error: null,
          }))

          // Update stored user data
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))

          logger.info("Profile updated successfully", { userId: updatedUser.id })
          return { success: true, user: updatedUser }
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.error || "Profile update failed",
          }))
          return { success: false, error: response.error || "Profile update failed" }
        }
      } catch (error: any) {
        const errorMessage = error.message || "Profile update failed"
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
        logger.error("Profile update failed", error)
        return { success: false, error: errorMessage }
      }
    },
    [state.user],
  )

  const changePassword = useCallback(async (passwordData: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.changePassword(passwordData)

      setState((prev) => ({ ...prev, isLoading: false }))

      if (response.success) {
        logger.info("Password changed successfully")
        return { success: true }
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Password change failed",
        }))
        return { success: false, error: response.error || "Password change failed" }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Password change failed"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      logger.error("Password change failed", error)
      return { success: false, error: errorMessage }
    }
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.forgotPassword(email)

      setState((prev) => ({ ...prev, isLoading: false }))

      if (response.success) {
        logger.info("Password reset email sent", { email })
        return { success: true }
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to send reset email",
        }))
        return { success: false, error: response.error || "Failed to send reset email" }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send reset email"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      logger.error("Forgot password failed", error)
      return { success: false, error: errorMessage }
    }
  }, [])

  const resetPassword = useCallback(async (resetData: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await apiClient.resetPassword(resetData)

      setState((prev) => ({ ...prev, isLoading: false }))

      if (response.success) {
        logger.info("Password reset successfully")
        return { success: true }
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Password reset failed",
        }))
        return { success: false, error: response.error || "Password reset failed" }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Password reset failed"
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      logger.error("Password reset failed", error)
      return { success: false, error: errorMessage }
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const hasPermission = useCallback(
    (permission: string) => {
      return state.user?.permissions?.includes(permission) || false
    },
    [state.user],
  )

  const hasRole = useCallback(
    (role: string) => {
      return state.user?.role === role
    },
    [state.user],
  )

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasPermission,
    hasRole,
  }
}

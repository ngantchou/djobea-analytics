"use client"

import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "user" | "provider"
  permissions: string[]
  lastLogin?: string
  isActive: boolean
  profile?: {
    phone?: string
    address?: string
    preferences?: Record<string, any>
  }
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

class AuthService {
  private currentUser: User | null = null
  private token: string | null = null
  private refreshToken: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const token = localStorage.getItem("auth_token")
      const refreshToken = localStorage.getItem("refresh_token")
      const userData = localStorage.getItem("user_data")

      if (token && userData) {
        this.token = token
        this.refreshToken = refreshToken
        this.currentUser = JSON.parse(userData)
      }
    } catch (error) {
      logger.error("Failed to load auth data from storage", { error })
      this.clearStorage()
    }
  }

  private saveToStorage(authData: AuthResponse) {
    try {
      localStorage.setItem("auth_token", authData.token)
      localStorage.setItem("user_data", JSON.stringify(authData.user))

      if (authData.refreshToken) {
        localStorage.setItem("refresh_token", authData.refreshToken)
      }

      this.token = authData.token
      this.refreshToken = authData.refreshToken
      this.currentUser = authData.user
    } catch (error) {
      logger.error("Failed to save auth data to storage", { error })
    }
  }

  private clearStorage() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    this.token = null
    this.refreshToken = null
    this.currentUser = null
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.info("Attempting login", { email: credentials.email })

      const response = await apiClient.login(credentials)

      if (response.success && response.data) {
        this.saveToStorage(response.data)
        logger.info("Login successful", { userId: response.data.user.id })
        return response.data
      }

      throw new Error(response.error || "Login failed")
    } catch (error) {
      logger.error("Login failed", { error, email: credentials.email })
      throw error
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      logger.info("Attempting registration", { email: data.email })

      if (data.password !== data.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas")
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || "user",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Registration failed")
      }

      if (result.success && result.data) {
        this.saveToStorage(result.data)
        logger.info("Registration successful", { userId: result.data.user.id })
        return result.data
      }

      throw new Error(result.error || "Registration failed")
    } catch (error) {
      logger.error("Registration failed", { error, email: data.email })
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      logger.info("Attempting logout", { userId: this.currentUser?.id })

      if (this.token) {
        await apiClient.logout()
      }

      this.clearStorage()
      logger.info("Logout successful")
    } catch (error) {
      logger.error("Logout failed", { error })
      // Clear storage anyway
      this.clearStorage()
    }
  }

  async refreshAuthToken(): Promise<string> {
    try {
      if (!this.refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await apiClient.refreshToken()

      if (response.success && response.data) {
        this.token = response.data.token
        localStorage.setItem("auth_token", response.data.token)
        return response.data.token
      }

      throw new Error(response.error || "Token refresh failed")
    } catch (error) {
      logger.error("Token refresh failed", { error })
      this.clearStorage()
      throw error
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      logger.info("Updating profile", { userId: this.currentUser?.id })

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Profile update failed")
      }

      if (result.success && result.data) {
        this.currentUser = { ...this.currentUser, ...result.data }
        localStorage.setItem("user_data", JSON.stringify(this.currentUser))
        logger.info("Profile updated successfully")
        return this.currentUser
      }

      throw new Error(result.error || "Profile update failed")
    } catch (error) {
      logger.error("Profile update failed", { error })
      throw error
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      logger.info("Changing password", { userId: this.currentUser?.id })

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Password change failed")
      }

      if (!result.success) {
        throw new Error(result.error || "Password change failed")
      }

      logger.info("Password changed successfully")
    } catch (error) {
      logger.error("Password change failed", { error })
      throw error
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      logger.info("Requesting password reset", { email })

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Password reset request failed")
      }

      if (!result.success) {
        throw new Error(result.error || "Password reset request failed")
      }

      logger.info("Password reset email sent")
    } catch (error) {
      logger.error("Password reset request failed", { error })
      throw error
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      logger.info("Resetting password with token")

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Password reset failed")
      }

      if (!result.success) {
        throw new Error(result.error || "Password reset failed")
      }

      logger.info("Password reset successful")
    } catch (error) {
      logger.error("Password reset failed", { error })
      throw error
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.currentUser)
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false
    return this.currentUser.permissions.includes(permission) || this.currentUser.role === "admin"
  }

  hasRole(role: string): boolean {
    if (!this.currentUser) return false
    return this.currentUser.role === role
  }

  isAdmin(): boolean {
    return this.hasRole("admin")
  }
}

export const authService = new AuthService()
export default authService

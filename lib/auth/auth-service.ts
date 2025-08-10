import type { User, LoginCredentials, RegisterData, AuthTokens, AuthResponse } from "./types"
import { AUTH_CONFIG, ROLE_PERMISSIONS } from "./config"
import { logger } from "@/lib/logger"

class AuthService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private user: User | null = null
  private baseURL = AUTH_CONFIG.API_BASE_URL

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage(): void {
    try {
      const storedTokens = localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY)
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens)
        this.accessToken = tokens.accessToken
        this.refreshToken = tokens.refreshToken
      }

      const userData = localStorage.getItem(AUTH_CONFIG.USER_STORAGE_KEY)
      if (userData) {
        this.user = JSON.parse(userData)
      }
    } catch (error) {
      logger.error("Failed to load auth data from storage", error as Error)
      this.clearStorage()
    }
  }

  private saveToStorage(tokens: AuthTokens, user: User): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(tokens))
      localStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(user))

      this.accessToken = tokens.accessToken
      this.refreshToken = tokens.refreshToken
      this.user = user
    } catch (error) {
      logger.error("Failed to save auth data to storage", error as Error)
    }
  }

  private clearStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY)
      localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY)
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Login failed",
        }
      }

      // Store tokens and user data
      if (data.tokens) {
        this.storeTokens(data.tokens)
      }

      if (data.user) {
        this.storeUser(data.user)
      }

      return {
        success: true,
        user: data.user,
        tokens: data.tokens,
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: "Network error. Please check your connection.",
      }
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.message || "Registration failed",
        }
      }

      // Store tokens and user data
      if (result.tokens) {
        this.storeTokens(result.tokens)
      }

      if (result.user) {
        this.storeUser(result.user)
      }

      return {
        success: true,
        user: result.user,
        tokens: result.tokens,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        error: "Network error. Please try again.",
      }
    }
  }

  async logout(): Promise<void> {
    try {
      const tokens = this.getStoredTokens()
      if (tokens?.accessToken) {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearStorage()
      logger.info("User logged out")
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const tokens = this.getStoredTokens()
      if (!tokens?.refreshToken) {
        return false
      }

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      })

      if (!response.ok) {
        this.clearStorage()
        return false
      }

      const data = await response.json()

      if (data.tokens) {
        this.storeTokens(data.tokens)
        return true
      }

      return false
    } catch (error) {
      console.error("Token refresh error:", error)
      this.clearStorage()
      return false
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const tokens = this.getStoredTokens()
      if (!tokens?.accessToken) {
        return null
      }

      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshToken()
          if (refreshed) {
            return this.getCurrentUser()
          }
        }
        return null
      }

      const data = await response.json()
      const user = data.user || data

      // Add permissions based on role
      if (user.role && ROLE_PERMISSIONS[user.role]) {
        user.permissions = ROLE_PERMISSIONS[user.role]
      }

      this.storeUser(user)
      return user
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  private storeTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(tokens))
    }
  }

  private storeUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(user))
    }
  }

  private getStoredTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  private getStoredUser(): User | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(AUTH_CONFIG.USER_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.user)
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions.includes(permission as any) || false
  }

  hasRole(role: string): boolean {
    return this.user?.role === role
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission))
  }

  isTokenExpired(token: AuthTokens): boolean {
    return Date.now() >= token.expiresAt
  }

  shouldRefreshToken(token: AuthTokens): boolean {
    return Date.now() >= token.expiresAt - AUTH_CONFIG.TOKEN_REFRESH_THRESHOLD
  }
}

export const authService = new AuthService()

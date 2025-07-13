"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  permissions: string[]
  department?: string
  status: "active" | "inactive" | "suspended"
  lastLogin?: Date
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize with mock user for development
    const initializeAuth = async () => {
      try {
        // Simulate checking for existing session
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Mock user data
        const mockUser: User = {
          id: "1",
          name: "Admin User",
          email: "admin@djobea.com",
          role: "admin",
          avatar: "/placeholder.svg?height=32&width=32",
          permissions: [
            "users.read",
            "users.create",
            "users.update",
            "users.delete",
            "providers.read",
            "providers.create",
            "providers.update",
            "providers.delete",
            "requests.read",
            "requests.create",
            "requests.update",
            "requests.delete",
            "analytics.read",
            "analytics.export",
            "finances.read",
            "settings.read",
            "settings.update",
            "admin.access",
          ],
          department: "IT",
          status: "active",
          lastLogin: new Date(),
          createdAt: new Date(),
        }

        setUser(mockUser)
      } catch (error) {
        console.error("Auth initialization failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      // Mock login - in production, make API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        name: "Admin User",
        email: email,
        role: "admin",
        avatar: "/placeholder.svg?height=32&width=32",
        permissions: ["users.read", "users.create", "providers.read", "admin.access"],
        department: "IT",
        status: "active",
        lastLogin: new Date(),
        createdAt: new Date(),
      }

      setUser(mockUser)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      // Mock logout - in production, make API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

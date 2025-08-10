"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { AuthService, type User, type LoginCredentials } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored authentication on mount
    const initAuth = async () => {
      try {
        const storedUser = AuthService.getStoredUser()
        const token = AuthService.getStoredToken()

        if (storedUser && token) {
          setUser(storedUser)
        } else {
          // Try to refresh token if we have a refresh token
          const refreshed = await AuthService.refreshToken()
          if (refreshed) {
            const refreshedUser = AuthService.getStoredUser()
            if (refreshedUser) {
              setUser(refreshedUser)
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        AuthService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await AuthService.login(credentials)

      if (response.success && response.data) {
        setUser(response.data.user)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.name}!`,
        })
        return true
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  const isAuthenticated = user !== null && AuthService.isAuthenticated()

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

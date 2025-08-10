"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading || isRedirecting) return

    const isPublicRoute = publicRoutes.includes(pathname)

    console.log("AuthGuard - Debug Info:", {
      isAuthenticated,
      loading,
      mounted,
      pathname,
      isPublicRoute,
      user: user ? { id: user.id, email: user.email } : null,
    })

    if (!isAuthenticated && !isPublicRoute) {
      // User is not authenticated and trying to access protected route
      console.log("AuthGuard - Redirecting to login from:", pathname)
      setIsRedirecting(true)
      const redirectUrl = `/login${pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : ""}`
      router.replace(redirectUrl)
      return
    }

    if (isAuthenticated && isPublicRoute) {
      // User is authenticated and trying to access public route (like login page)
      console.log("AuthGuard - Redirecting authenticated user from public route:", pathname)
      setIsRedirecting(true)
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get("redirect") || "/"
      router.replace(redirectTo)
      return
    }

    // Reset redirecting state if we're on the correct route
    if (isRedirecting) {
      setIsRedirecting(false)
    }
  }, [isAuthenticated, loading, mounted, pathname, router, user, isRedirecting])

  // Show loading while checking authentication or during redirects
  if (!mounted || loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{loading ? "Chargement..." : isRedirecting ? "Redirection..." : "Initialisation..."}</span>
        </div>
      </div>
    )
  }

  const isPublicRoute = publicRoutes.includes(pathname)

  // Don't render anything while redirecting
  if ((!isAuthenticated && !isPublicRoute) || (isAuthenticated && isPublicRoute)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirection...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

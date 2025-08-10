"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { AUTH_CONFIG, ROUTE_PERMISSIONS } from "@/lib/auth/config"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = () => {
      // Don't check while auth is loading
      if (isLoading) {
        return
      }

      // Check if current route is public
      const isPublicRoute = AUTH_CONFIG.PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

      if (isPublicRoute) {
        setIsChecking(false)
        return
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        const loginUrl = `${AUTH_CONFIG.LOGIN_REDIRECT}?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
        return
      }

      // Check route permissions
      const routePermission = ROUTE_PERMISSIONS.find((route) => pathname.startsWith(route.path))

      if (routePermission) {
        // Check if user has required permissions
        const hasRequiredPermission = routePermission.permissions.some((permission) => hasPermission(permission))

        // Check if user has required role (if specified)
        const hasRequiredRole = routePermission.roles ? routePermission.roles.some((role) => hasRole(role)) : true

        if (!hasRequiredPermission || !hasRequiredRole) {
          // Redirect to dashboard if no permission
          router.push("/")
          return
        }
      }

      setIsChecking(false)
    }

    checkAccess()
  }, [isAuthenticated, isLoading, pathname, router, user, hasPermission, hasRole])

  // Show loading while checking authentication or route access
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render children if not authenticated and not on public route
  const isPublicRoute = AUTH_CONFIG.PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  if (!isAuthenticated && !isPublicRoute) {
    return null
  }

  return <>{children}</>
}

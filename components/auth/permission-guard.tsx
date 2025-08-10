"use client"

import type React from "react"

import { useAuth } from "@/lib/auth/auth-context"
import type { Permission, UserRole } from "@/lib/auth/types"

interface PermissionGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: UserRole[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = useAuth()

  // Check permissions
  const hasRequiredPermissions =
    permissions.length === 0 ||
    (requireAll
      ? permissions.every((permission) => hasPermission(permission))
      : permissions.some((permission) => hasPermission(permission)))

  // Check roles
  const hasRequiredRoles =
    roles.length === 0 || (requireAll ? roles.every((role) => hasRole(role)) : roles.some((role) => hasRole(role)))

  // Show children if user has required permissions and roles
  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>
  }

  // Show fallback or nothing
  return <>{fallback}</>
}

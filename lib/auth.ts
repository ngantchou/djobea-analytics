import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { AuthenticationError, AuthorizationError } from "./error-handler"
import { logger } from "./logger"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "operator" | "viewer"
  permissions: string[]
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      logger.error("Token verification failed", error as Error)
      throw new AuthenticationError("Invalid or expired token")
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }

    // Also check for token in cookies
    const tokenCookie = request.cookies.get("auth-token")
    return tokenCookie?.value || null
  }

  static async authenticateRequest(request: NextRequest): Promise<User> {
    const token = this.extractTokenFromRequest(request)

    if (!token) {
      throw new AuthenticationError("No authentication token provided")
    }

    const payload = this.verifyToken(token)

    // In a real app, you would fetch the user from the database
    // For now, we'll create a mock user based on the token payload
    const user: User = {
      id: payload.userId,
      email: payload.email,
      name: "Mock User", // This should come from database
      role: payload.role as "admin" | "operator" | "viewer",
      permissions: this.getRolePermissions(payload.role),
    }

    return user
  }

  static getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      admin: [
        "read:all",
        "write:all",
        "delete:all",
        "manage:users",
        "manage:settings",
        "manage:providers",
        "manage:requests",
      ],
      operator: ["read:requests", "write:requests", "read:providers", "write:providers", "read:analytics"],
      viewer: ["read:requests", "read:providers", "read:analytics"],
    }

    return rolePermissions[role] || []
  }

  static checkPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes("write:all")
  }

  static requirePermission(user: User, permission: string): void {
    if (!this.checkPermission(user, permission)) {
      logger.logSecurityEvent("Unauthorized access attempt", {
        userId: user.id,
        requiredPermission: permission,
        userPermissions: user.permissions,
      })
      throw new AuthorizationError(`Permission required: ${permission}`)
    }
  }
}

// Middleware helper for protecting API routes
export function withAuth(handler: (request: NextRequest, user: User) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      const user = await AuthService.authenticateRequest(request)
      return handler(request, user)
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.constructor.name.replace("Error", "").toUpperCase(),
            message: error.message,
          }),
          {
            status: error.statusCode,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
      throw error
    }
  }
}

// Permission-based middleware
export function withPermission(permission: string) {
  return (handler: (request: NextRequest, user: User) => Promise<Response>) =>
    withAuth(async (request: NextRequest, user: User) => {
      AuthService.requirePermission(user, permission)
      return handler(request, user)
    })
}

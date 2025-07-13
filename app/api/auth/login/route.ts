import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { AuthService } from "@/lib/auth"
import { validateData } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"
import { withRateLimit, rateLimitConfigs } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"
import { db } from "@/lib/database"

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateData(loginSchema, body)

    if (!validation.success) {
      throw validation.errors
    }

    const { email, password, rememberMe } = validation.data

    // Find user in database
    const users = await db.query(
      "SELECT id, email, name, role, password_hash FROM users WHERE email = ? AND active = true",
      [email],
    )

    if (users.length === 0) {
      logger.logSecurityEvent("Login attempt with invalid email", { email })
      throw new Error("Invalid credentials")
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      logger.logSecurityEvent("Login attempt with invalid password", { email, userId: user.id })
      throw new Error("Invalid credentials")
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: AuthService.getRolePermissions(user.role),
    })

    // Log successful login
    logger.info("User logged in successfully", { userId: user.id, email: user.email })

    // Update last login timestamp
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    })

    // Set HTTP-only cookie if remember me is checked
    if (rememberMe) {
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    }

    return response
  } catch (error) {
    return handleApiError(error)
  }
}

export const POST = withRateLimit(rateLimitConfigs.auth)(loginHandler)

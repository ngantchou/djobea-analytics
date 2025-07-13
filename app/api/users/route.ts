import { type NextRequest, NextResponse } from "next/server"
import { userManagementService } from "@/lib/services/user-management-service"
import { withAuth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { ValidationError } from "@/lib/error-handler"

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Check permissions
    if (!user.permissions.includes("users:read") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") as "active" | "inactive" | "suspended" | undefined,
      department: searchParams.get("department") || undefined,
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") as "name" | "email" | "role" | "lastLogin" | "createdAt" | undefined,
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    }

    const result = await userManagementService.getUsers(filters)

    logger.info("Users fetched via API", {
      userId: user.id,
      filters,
      resultCount: result.users.length,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error("Failed to fetch users via API", { error, userId: user.id })
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to fetch users" },
      { status: 500 },
    )
  }
})

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Check permissions
    if (!user.permissions.includes("users:create") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Name, email, password, and role are required" },
        { status: 400 },
      )
    }

    const newUser = await userManagementService.createUser(data)

    logger.info("User created via API", {
      createdBy: user.id,
      newUserId: newUser.id,
      email: newUser.email,
    })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User created successfully",
    })
  } catch (error) {
    logger.error("Failed to create user via API", { error, userId: user.id })

    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: "VALIDATION_ERROR", message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to create user" },
      { status: 500 },
    )
  }
})

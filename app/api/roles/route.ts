import { type NextRequest, NextResponse } from "next/server"
import { userManagementService } from "@/lib/services/user-management-service"
import { withAuth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { ValidationError } from "@/lib/error-handler"

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Check permissions
    if (!user.permissions.includes("roles:read") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get("search") || undefined,
      isSystem: searchParams.get("isSystem") ? searchParams.get("isSystem") === "true" : undefined,
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy") as "name" | "userCount" | "createdAt" | undefined,
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    }

    const result = await userManagementService.getRoles(filters)

    logger.info("Roles fetched via API", {
      userId: user.id,
      filters,
      resultCount: result.roles.length,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error("Failed to fetch roles via API", { error, userId: user.id })
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to fetch roles" },
      { status: 500 },
    )
  }
})

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Check permissions
    if (!user.permissions.includes("roles:create") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.description || !Array.isArray(data.permissions)) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Name, description, and permissions are required" },
        { status: 400 },
      )
    }

    const newRole = await userManagementService.createRole(data)

    logger.info("Role created via API", {
      createdBy: user.id,
      newRoleId: newRole.id,
      name: newRole.name,
    })

    return NextResponse.json({
      success: true,
      data: newRole,
      message: "Role created successfully",
    })
  } catch (error) {
    logger.error("Failed to create role via API", { error, userId: user.id })

    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: "VALIDATION_ERROR", message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to create role" },
      { status: 500 },
    )
  }
})

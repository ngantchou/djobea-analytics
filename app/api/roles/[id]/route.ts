import { type NextRequest, NextResponse } from "next/server"
import { userManagementService } from "@/lib/services/user-management-service"
import { withAuth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { ValidationError, NotFoundError } from "@/lib/error-handler"

export const GET = withAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params

    // Check permissions
    if (!user.permissions.includes("roles:read") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const role = await userManagementService.getRoleById(id)

    logger.info("Role fetched via API", {
      requestedBy: user.id,
      roleId: id,
    })

    return NextResponse.json({
      success: true,
      data: role,
    })
  } catch (error) {
    logger.error("Failed to fetch role via API", { error, userId: user.id, roleId: params.id })

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: "NOT_FOUND", message: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to fetch role" },
      { status: 500 },
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params

    // Check permissions
    if (!user.permissions.includes("roles:update") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const data = await request.json()

    const updatedRole = await userManagementService.updateRole(id, data)

    logger.info("Role updated via API", {
      updatedBy: user.id,
      roleId: id,
      updates: Object.keys(data),
    })

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: "Role updated successfully",
    })
  } catch (error) {
    logger.error("Failed to update role via API", { error, userId: user.id, roleId: params.id })

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.constructor.name.replace("Error", "").toUpperCase(), message: error.message },
        { status: error instanceof NotFoundError ? 404 : 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to update role" },
      { status: 500 },
    )
  }
})

export const DELETE = withAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params

    // Check permissions
    if (!user.permissions.includes("roles:delete") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    await userManagementService.deleteRole(id)

    logger.info("Role deleted via API", {
      deletedBy: user.id,
      roleId: id,
    })

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully",
    })
  } catch (error) {
    logger.error("Failed to delete role via API", { error, userId: user.id, roleId: params.id })

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.constructor.name.replace("Error", "").toUpperCase(), message: error.message },
        { status: error instanceof NotFoundError ? 404 : 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to delete role" },
      { status: 500 },
    )
  }
})

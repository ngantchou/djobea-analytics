import { type NextRequest, NextResponse } from "next/server"
import { userManagementService } from "@/lib/services/user-management-service"
import { withAuth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { ValidationError, NotFoundError } from "@/lib/error-handler"

export const GET = withAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params

    // Check permissions
    if (!user.permissions.includes("users:read") && user.role !== "admin" && user.id !== id) {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const userData = await userManagementService.getUserById(id)

    logger.info("User fetched via API", {
      requestedBy: user.id,
      targetUserId: id,
    })

    return NextResponse.json({
      success: true,
      data: userData,
    })
  } catch (error) {
    logger.error("Failed to fetch user via API", { error, userId: user.id, targetId: params.id })

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: "NOT_FOUND", message: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to fetch user" },
      { status: 500 },
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params

    // Check permissions
    if (!user.permissions.includes("users:update") && user.role !== "admin" && user.id !== id) {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    const data = await request.json()

    // If user is updating themselves, restrict certain fields
    if (user.id === id) {
      delete data.role
      delete data.permissions
      delete data.status
    }

    const updatedUser = await userManagementService.updateUser(id, data)

    logger.info("User updated via API", {
      updatedBy: user.id,
      targetUserId: id,
      updates: Object.keys(data),
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    })
  } catch (error) {
    logger.error("Failed to update user via API", { error, userId: user.id, targetId: params.id })

    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.constructor.name.replace("Error", "").toUpperCase(), message: error.message },
        { status: error instanceof NotFoundError ? 404 : 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to update user" },
      { status: 500 },
    )
  }
})

export const DELETE = withAuth(async (request: NextRequest, user, { params }) => {
  try {
    const { id } = params

    // Check permissions
    if (!user.permissions.includes("users:delete") && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN", message: "Insufficient permissions" },
        { status: 403 },
      )
    }

    // Prevent self-deletion
    if (user.id === id) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_ERROR", message: "Cannot delete your own account" },
        { status: 400 },
      )
    }

    await userManagementService.deleteUser(id)

    logger.info("User deleted via API", {
      deletedBy: user.id,
      targetUserId: id,
    })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    logger.error("Failed to delete user via API", { error, userId: user.id, targetId: params.id })

    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: "NOT_FOUND", message: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Failed to delete user" },
      { status: 500 },
    )
  }
})

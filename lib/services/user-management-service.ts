import { logger } from "@/lib/logger"
import { ValidationError, NotFoundError, ConflictError } from "@/lib/error-handler"

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "suspended"
  permissions: string[]
  lastLogin?: string
  createdAt: string
  updatedAt: string
  loginAttempts: number
  avatar?: string
  profile?: {
    phone?: string
    address?: string
    department?: string
    preferences?: Record<string, any>
  }
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
  permissions?: string[]
  profile?: {
    phone?: string
    address?: string
    department?: string
  }
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  status?: "active" | "inactive" | "suspended"
  permissions?: string[]
  profile?: {
    phone?: string
    address?: string
    department?: string
    preferences?: Record<string, any>
  }
}

export interface CreateRoleData {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
}

export interface UserFilters {
  search?: string
  role?: string
  status?: "active" | "inactive" | "suspended"
  department?: string
  page?: number
  limit?: number
  sortBy?: "name" | "email" | "role" | "lastLogin" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface RoleFilters {
  search?: string
  isSystem?: boolean
  page?: number
  limit?: number
  sortBy?: "name" | "userCount" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export const AVAILABLE_PERMISSIONS = [
  // User Management
  "users:read",
  "users:create",
  "users:update",
  "users:delete",
  "users:manage_roles",
  "users:manage_permissions",

  // Role Management
  "roles:read",
  "roles:create",
  "roles:update",
  "roles:delete",

  // Provider Management
  "providers:read",
  "providers:create",
  "providers:update",
  "providers:delete",
  "providers:contact",
  "providers:manage_status",

  // Request Management
  "requests:read",
  "requests:create",
  "requests:update",
  "requests:delete",
  "requests:assign",
  "requests:cancel",

  // Analytics
  "analytics:read",
  "analytics:export",
  "analytics:advanced",

  // Finances
  "finances:read",
  "finances:manage",
  "finances:export",

  // Settings
  "settings:read",
  "settings:update",
  "settings:system",
  "settings:security",
  "settings:integrations",

  // System
  "system:admin",
  "system:maintenance",
  "system:debug",
  "system:logs",
  "system:backup",

  // Notifications
  "notifications:read",
  "notifications:send",
  "notifications:manage",

  // Messages
  "messages:read",
  "messages:send",
  "messages:manage",

  // AI
  "ai:read",
  "ai:configure",
  "ai:advanced",
]

class UserManagementService {
  // Mock database - in production, this would be replaced with actual database calls
  private users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@djobea.com",
      role: "super_admin",
      status: "active",
      permissions: AVAILABLE_PERMISSIONS,
      lastLogin: "2025-01-13 14:30",
      createdAt: "2024-01-15",
      updatedAt: "2025-01-13",
      loginAttempts: 0,
      avatar: "/avatars/john.jpg",
      profile: {
        phone: "+237 6 XX XX XX XX",
        address: "Douala, Cameroun",
        department: "Administration",
      },
    },
    {
      id: "2",
      name: "Marie Kamga",
      email: "marie@djobea.com",
      role: "admin",
      status: "active",
      permissions: AVAILABLE_PERMISSIONS.slice(0, 30),
      lastLogin: "2025-01-13 12:15",
      createdAt: "2024-03-20",
      updatedAt: "2025-01-13",
      loginAttempts: 0,
      profile: {
        phone: "+237 6 XX XX XX XX",
        department: "Opérations",
      },
    },
    {
      id: "3",
      name: "Paul Ndongo",
      email: "paul@djobea.com",
      role: "manager",
      status: "inactive",
      permissions: AVAILABLE_PERMISSIONS.slice(0, 20),
      lastLogin: "2025-01-12 09:45",
      createdAt: "2024-06-10",
      updatedAt: "2025-01-12",
      loginAttempts: 2,
      profile: {
        department: "Support",
      },
    },
  ]

  private roles: Role[] = [
    {
      id: "super_admin",
      name: "Super Admin",
      description: "Accès complet au système avec tous les privilèges",
      permissions: AVAILABLE_PERMISSIONS,
      userCount: 1,
      isSystem: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "admin",
      name: "Administrateur",
      description: "Gestion complète sauf paramètres système critiques",
      permissions: AVAILABLE_PERMISSIONS.filter((p) => !p.startsWith("system:")),
      userCount: 3,
      isSystem: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "manager",
      name: "Manager",
      description: "Gestion opérationnelle des prestataires et demandes",
      permissions: [
        "providers:read",
        "providers:update",
        "providers:contact",
        "requests:read",
        "requests:update",
        "requests:assign",
        "analytics:read",
        "messages:read",
        "messages:send",
      ],
      userCount: 5,
      isSystem: false,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "operator",
      name: "Opérateur",
      description: "Gestion des demandes et communication avec prestataires",
      permissions: [
        "requests:read",
        "requests:update",
        "providers:read",
        "messages:read",
        "messages:send",
        "analytics:read",
      ],
      userCount: 8,
      isSystem: false,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "support",
      name: "Support",
      description: "Support client et assistance technique",
      permissions: ["requests:read", "providers:read", "messages:read", "messages:send", "analytics:read"],
      userCount: 3,
      isSystem: false,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ]

  // User Management Methods
  async getUsers(filters: UserFilters = {}): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      logger.info("Fetching users", { filters })

      let filteredUsers = [...this.users]

      // Apply filters
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.profile?.department?.toLowerCase().includes(search),
        )
      }

      if (filters.role) {
        filteredUsers = filteredUsers.filter((user) => user.role === filters.role)
      }

      if (filters.status) {
        filteredUsers = filteredUsers.filter((user) => user.status === filters.status)
      }

      if (filters.department) {
        filteredUsers = filteredUsers.filter((user) => user.profile?.department === filters.department)
      }

      // Apply sorting
      const sortBy = filters.sortBy || "name"
      const sortOrder = filters.sortOrder || "asc"

      filteredUsers.sort((a, b) => {
        let aValue: any = a[sortBy as keyof User]
        let bValue: any = b[sortBy as keyof User]

        if (sortBy === "lastLogin") {
          aValue = new Date(aValue || 0).getTime()
          bValue = new Date(bValue || 0).getTime()
        }

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sortOrder === "desc") {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
      const totalPages = Math.ceil(filteredUsers.length / limit)

      logger.info("Users fetched successfully", {
        total: filteredUsers.length,
        page,
        limit,
        totalPages,
      })

      return {
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit,
        totalPages,
      }
    } catch (error) {
      logger.error("Failed to fetch users", { error, filters })
      throw error
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      logger.info("Fetching user by ID", { userId: id })

      const user = this.users.find((u) => u.id === id)
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }

      logger.info("User fetched successfully", { userId: id })
      return user
    } catch (error) {
      logger.error("Failed to fetch user", { error, userId: id })
      throw error
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      logger.info("Creating new user", { email: data.email, role: data.role })

      // Validate required fields
      if (!data.name || !data.email || !data.password || !data.role) {
        throw new ValidationError("Name, email, password, and role are required")
      }

      // Check if email already exists
      const existingUser = this.users.find((u) => u.email === data.email)
      if (existingUser) {
        throw new ConflictError("User with this email already exists")
      }

      // Validate role exists
      const role = this.roles.find((r) => r.id === data.role)
      if (!role) {
        throw new ValidationError("Invalid role specified")
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        status: "active",
        permissions: data.permissions || role.permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        loginAttempts: 0,
        profile: data.profile,
      }

      this.users.push(newUser)

      // Update role user count
      const roleIndex = this.roles.findIndex((r) => r.id === data.role)
      if (roleIndex !== -1) {
        this.roles[roleIndex].userCount++
      }

      logger.info("User created successfully", { userId: newUser.id, email: data.email })
      return newUser
    } catch (error) {
      logger.error("Failed to create user", { error, email: data.email })
      throw error
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      logger.info("Updating user", { userId: id, updates: Object.keys(data) })

      const userIndex = this.users.findIndex((u) => u.id === id)
      if (userIndex === -1) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }

      const user = this.users[userIndex]

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== user.email) {
        const existingUser = this.users.find((u) => u.email === data.email && u.id !== id)
        if (existingUser) {
          throw new ConflictError("User with this email already exists")
        }
      }

      // Validate role if being updated
      if (data.role) {
        const role = this.roles.find((r) => r.id === data.role)
        if (!role) {
          throw new ValidationError("Invalid role specified")
        }

        // Update role user counts
        if (data.role !== user.role) {
          const oldRoleIndex = this.roles.findIndex((r) => r.id === user.role)
          const newRoleIndex = this.roles.findIndex((r) => r.id === data.role)

          if (oldRoleIndex !== -1) this.roles[oldRoleIndex].userCount--
          if (newRoleIndex !== -1) this.roles[newRoleIndex].userCount++
        }
      }

      // Update user
      const updatedUser: User = {
        ...user,
        ...data,
        updatedAt: new Date().toISOString(),
        profile: data.profile ? { ...user.profile, ...data.profile } : user.profile,
      }

      this.users[userIndex] = updatedUser

      logger.info("User updated successfully", { userId: id })
      return updatedUser
    } catch (error) {
      logger.error("Failed to update user", { error, userId: id })
      throw error
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      logger.info("Deleting user", { userId: id })

      const userIndex = this.users.findIndex((u) => u.id === id)
      if (userIndex === -1) {
        throw new NotFoundError(`User with ID ${id} not found`)
      }

      const user = this.users[userIndex]

      // Update role user count
      const roleIndex = this.roles.findIndex((r) => r.id === user.role)
      if (roleIndex !== -1) {
        this.roles[roleIndex].userCount--
      }

      this.users.splice(userIndex, 1)

      logger.info("User deleted successfully", { userId: id })
    } catch (error) {
      logger.error("Failed to delete user", { error, userId: id })
      throw error
    }
  }

  // Role Management Methods
  async getRoles(filters: RoleFilters = {}): Promise<{
    roles: Role[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      logger.info("Fetching roles", { filters })

      let filteredRoles = [...this.roles]

      // Apply filters
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filteredRoles = filteredRoles.filter(
          (role) => role.name.toLowerCase().includes(search) || role.description.toLowerCase().includes(search),
        )
      }

      if (filters.isSystem !== undefined) {
        filteredRoles = filteredRoles.filter((role) => role.isSystem === filters.isSystem)
      }

      // Apply sorting
      const sortBy = filters.sortBy || "name"
      const sortOrder = filters.sortOrder || "asc"

      filteredRoles.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Role]
        let bValue: any = b[sortBy as keyof Role]

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sortOrder === "desc") {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const paginatedRoles = filteredRoles.slice(startIndex, endIndex)
      const totalPages = Math.ceil(filteredRoles.length / limit)

      logger.info("Roles fetched successfully", {
        total: filteredRoles.length,
        page,
        limit,
        totalPages,
      })

      return {
        roles: paginatedRoles,
        total: filteredRoles.length,
        page,
        limit,
        totalPages,
      }
    } catch (error) {
      logger.error("Failed to fetch roles", { error, filters })
      throw error
    }
  }

  async getRoleById(id: string): Promise<Role> {
    try {
      logger.info("Fetching role by ID", { roleId: id })

      const role = this.roles.find((r) => r.id === id)
      if (!role) {
        throw new NotFoundError(`Role with ID ${id} not found`)
      }

      logger.info("Role fetched successfully", { roleId: id })
      return role
    } catch (error) {
      logger.error("Failed to fetch role", { error, roleId: id })
      throw error
    }
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    try {
      logger.info("Creating new role", { name: data.name })

      // Validate required fields
      if (!data.name || !data.description) {
        throw new ValidationError("Name and description are required")
      }

      // Check if role name already exists
      const existingRole = this.roles.find((r) => r.name.toLowerCase() === data.name.toLowerCase())
      if (existingRole) {
        throw new ConflictError("Role with this name already exists")
      }

      // Validate permissions
      const invalidPermissions = data.permissions.filter((p) => !AVAILABLE_PERMISSIONS.includes(p))
      if (invalidPermissions.length > 0) {
        throw new ValidationError(`Invalid permissions: ${invalidPermissions.join(", ")}`)
      }

      // Create new role
      const newRole: Role = {
        id: data.name.toLowerCase().replace(/\s+/g, "_"),
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        userCount: 0,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      this.roles.push(newRole)

      logger.info("Role created successfully", { roleId: newRole.id, name: data.name })
      return newRole
    } catch (error) {
      logger.error("Failed to create role", { error, name: data.name })
      throw error
    }
  }

  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    try {
      logger.info("Updating role", { roleId: id, updates: Object.keys(data) })

      const roleIndex = this.roles.findIndex((r) => r.id === id)
      if (roleIndex === -1) {
        throw new NotFoundError(`Role with ID ${id} not found`)
      }

      const role = this.roles[roleIndex]

      // Check if it's a system role and prevent certain updates
      if (role.isSystem && (data.name || data.permissions)) {
        throw new ValidationError("Cannot modify name or permissions of system roles")
      }

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== role.name) {
        const existingRole = this.roles.find((r) => r.name.toLowerCase() === data.name.toLowerCase() && r.id !== id)
        if (existingRole) {
          throw new ConflictError("Role with this name already exists")
        }
      }

      // Validate permissions if being updated
      if (data.permissions) {
        const invalidPermissions = data.permissions.filter((p) => !AVAILABLE_PERMISSIONS.includes(p))
        if (invalidPermissions.length > 0) {
          throw new ValidationError(`Invalid permissions: ${invalidPermissions.join(", ")}`)
        }
      }

      // Update role
      const updatedRole: Role = {
        ...role,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      this.roles[roleIndex] = updatedRole

      // Update permissions for all users with this role if permissions changed
      if (data.permissions) {
        this.users.forEach((user, index) => {
          if (user.role === id) {
            this.users[index] = {
              ...user,
              permissions: data.permissions!,
              updatedAt: new Date().toISOString(),
            }
          }
        })
      }

      logger.info("Role updated successfully", { roleId: id })
      return updatedRole
    } catch (error) {
      logger.error("Failed to update role", { error, roleId: id })
      throw error
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      logger.info("Deleting role", { roleId: id })

      const roleIndex = this.roles.findIndex((r) => r.id === id)
      if (roleIndex === -1) {
        throw new NotFoundError(`Role with ID ${id} not found`)
      }

      const role = this.roles[roleIndex]

      // Prevent deletion of system roles
      if (role.isSystem) {
        throw new ValidationError("Cannot delete system roles")
      }

      // Check if role is in use
      const usersWithRole = this.users.filter((u) => u.role === id)
      if (usersWithRole.length > 0) {
        throw new ValidationError(`Cannot delete role: ${usersWithRole.length} users are assigned to this role`)
      }

      this.roles.splice(roleIndex, 1)

      logger.info("Role deleted successfully", { roleId: id })
    } catch (error) {
      logger.error("Failed to delete role", { error, roleId: id })
      throw error
    }
  }

  // Utility Methods
  getAvailablePermissions(): string[] {
    return [...AVAILABLE_PERMISSIONS]
  }

  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    suspended: number
    byRole: Record<string, number>
    byDepartment: Record<string, number>
  }> {
    const stats = {
      total: this.users.length,
      active: this.users.filter((u) => u.status === "active").length,
      inactive: this.users.filter((u) => u.status === "inactive").length,
      suspended: this.users.filter((u) => u.status === "suspended").length,
      byRole: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
    }

    // Count by role
    this.users.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1
    })

    // Count by department
    this.users.forEach((user) => {
      const dept = user.profile?.department || "Non assigné"
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1
    })

    return stats
  }

  async getRoleStats(): Promise<{
    total: number
    system: number
    custom: number
    totalPermissions: number
  }> {
    return {
      total: this.roles.length,
      system: this.roles.filter((r) => r.isSystem).length,
      custom: this.roles.filter((r) => !r.isSystem).length,
      totalPermissions: AVAILABLE_PERMISSIONS.length,
    }
  }
}

export const userManagementService = new UserManagementService()
export default userManagementService

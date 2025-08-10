export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export type UserRole = "admin" | "operator" | "viewer"

export type Permission =
  | "dashboard.view"
  | "analytics.view"
  | "analytics.export"
  | "providers.view"
  | "providers.create"
  | "providers.edit"
  | "providers.delete"
  | "requests.view"
  | "requests.create"
  | "requests.edit"
  | "requests.delete"
  | "requests.assign"
  | "finances.view"
  | "finances.export"
  | "messages.view"
  | "messages.send"
  | "settings.view"
  | "settings.edit"
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "system.admin"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  tokens?: AuthTokens
  error?: string
  message?: string
}

export interface RoutePermission {
  path: string
  permissions: Permission[]
  roles?: UserRole[]
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  clearError: () => void
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
}

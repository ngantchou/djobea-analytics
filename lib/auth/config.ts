import type { Permission, RoutePermission, UserRole } from "./types"

export const AUTH_CONFIG = {
  API_BASE_URL: "",
  TOKEN_STORAGE_KEY: "djobea_auth_tokens",
  USER_STORAGE_KEY: "djobea_auth_user",
  REFRESH_TOKEN_KEY: "djobea_refresh_token",
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  LOGIN_REDIRECT: "/login",
  DEFAULT_REDIRECT: "/",
  PUBLIC_ROUTES: ["/login", "/register", "/forgot-password", "/reset-password"],
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "dashboard.view",
    "analytics.view",
    "analytics.export",
    "providers.view",
    "providers.create",
    "providers.edit",
    "providers.delete",
    "requests.view",
    "requests.create",
    "requests.edit",
    "requests.delete",
    "requests.assign",
    "finances.view",
    "finances.export",
    "messages.view",
    "messages.send",
    "settings.view",
    "settings.edit",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "system.admin",
  ],
  operator: [
    "dashboard.view",
    "analytics.view",
    "providers.view",
    "providers.edit",
    "requests.view",
    "requests.create",
    "requests.edit",
    "requests.assign",
    "finances.view",
    "messages.view",
    "messages.send",
    "settings.view",
  ],
  viewer: ["dashboard.view", "analytics.view", "providers.view", "requests.view", "finances.view", "messages.view"],
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: "/", permissions: ["dashboard.view"] },
  { path: "/analytics", permissions: ["analytics.view"] },
  { path: "/providers", permissions: ["providers.view"] },
  { path: "/requests", permissions: ["requests.view"] },
  { path: "/finances", permissions: ["finances.view"] },
  { path: "/messages", permissions: ["messages.view"] },
  { path: "/settings", permissions: ["settings.view"] },
  { path: "/settings/admin", permissions: ["system.admin"], roles: ["admin"] },
  { path: "/ai", permissions: ["analytics.view"] },
  { path: "/map", permissions: ["providers.view"] },
  { path: "/profile", permissions: ["dashboard.view"] },
]

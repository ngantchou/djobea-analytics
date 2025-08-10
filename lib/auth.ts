// lib/auth.ts

import type { NextRequest } from "next/server"
import { AuthenticationError, AuthorizationError } from "./error-handler"
import { logger } from "./logger"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import React from "react" // Add explicit React import

// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:5000",
  ENDPOINTS: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    ME: "/api/auth/me",
  },
  STORAGE_KEYS: {
    TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user_data",
    TOKEN_EXPIRATION: "token_expiration",
  },
}

// User interface based on API schema
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "operator" | "viewer"
  permissions: string[]
  profileImage?: string
}

// Auth response from API
export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    refreshToken: string
    expiresIn: number
  }
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface ProfileUpdateData {
  name?: string
  phone?: string
  address?: string
  profile?: Record<string, any>
}

export class AuthService {
  /**
   * Helper method to create API requests with appropriate headers
   */
  private static async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type") && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = this.getStoredToken();
      if (!token) {
        throw new AuthenticationError("Authentication required");
      }
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 by attempting to refresh token
        if (response.status === 401 && requiresAuth && endpoint !== API_CONFIG.ENDPOINTS.REFRESH) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            return this.apiRequest(endpoint, options, requiresAuth);
          }
        }
        
        throw new Error(data.message || `API error: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      logger.error(`API request error [${endpoint}]:`, error as Error);
      throw error;
    }
  }

  /**
   * Authenticates user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const data = await this.apiRequest<AuthResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
        false
      );

      // Store tokens in localStorage
      if (data.success && data.data) {
        this.setAuthData(data.data);
      }

      return data;
    } catch (error) {
      logger.error("Login error", error as Error);
      throw error;
    }
  }

  /**
   * Logout user and revoke refresh token
   */
  static async logout(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        await this.apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, { method: "POST" });
      }
    } catch (error) {
      logger.error("Logout API error", error as Error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current authentication token
   */
  static getStoredToken(): string | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    const expiration = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);

    if (!token || !expiration) return null;

    // Check if token is expired
    if (Date.now() > Number.parseInt(expiration)) {
      this.clearAuthData();
      return null;
    }

    return token;
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getStoredToken() !== null;
  }

  /**
   * Refresh the authentication token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const data = await this.apiRequest<AuthResponse>(
        API_CONFIG.ENDPOINTS.REFRESH,
        { method: "POST" }
      );

      if (data.success && data.data) {
        this.setAuthData(data.data);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Token refresh error", error as Error);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Get current user profile
   */
  static async getUserProfile(): Promise<User | null> {
    try {
      const data = await this.apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.PROFILE);

      if (data.success && data.data?.user) {
        // Update stored user data
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
        return data.data.user;
      }

      return null;
    } catch (error) {
      logger.error("Get profile error", error as Error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(profileData: ProfileUpdateData): Promise<boolean> {
    try {
      const data = await this.apiRequest<AuthResponse>(
        API_CONFIG.ENDPOINTS.PROFILE,
        {
          method: "PUT",
          body: JSON.stringify(profileData),
        }
      );

      if (data.success && data.data?.user) {
        // Update stored user data
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Update profile error", error as Error);
      return false;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const data = await this.apiRequest<AuthResponse>(
        API_CONFIG.ENDPOINTS.CHANGE_PASSWORD,
        {
          method: "POST",
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      
      return data.success;
    } catch (error) {
      logger.error("Change password error", error as Error);
      return false;
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<boolean> {
    try {
      const data = await this.apiRequest<AuthResponse>(
        API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        false
      );
      
      return data.success;
    } catch (error) {
      logger.error("Forgot password error", error as Error);
      return false;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const data = await this.apiRequest<AuthResponse>(
        API_CONFIG.ENDPOINTS.RESET_PASSWORD,
        {
          method: "POST",
          body: JSON.stringify({ token, newPassword }),
        },
        false
      );
      
      return data.success;
    } catch (error) {
      logger.error("Reset password error", error as Error);
      return false;
    }
  }

  /**
   * Store authentication data
   */
  private static setAuthData(data: AuthResponse["data"]): void {
    if (!data) return;
    
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

    const expirationTime = Date.now() + data.expiresIn * 1000;
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION, expirationTime.toString());
  }

  /**
   * Clear all authentication data
   */
  private static clearAuthData(): void {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
  }

  /**
   * Check if user has specific permission
   */
  static checkPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    return user.permissions.includes(permission) || user.permissions.includes("write:all");
  }

  /**
   * Get role permissions
   */
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
    };

    return rolePermissions[role] || [];
  }

  /**
   * Validate user has required permission
   */
  static requirePermission(user: User | null, permission: string): void {
    if (!user || !this.checkPermission(user, permission)) {
      logger.logSecurityEvent("Unauthorized access attempt", {
        userId: user?.id,
        requiredPermission: permission,
        userPermissions: user?.permissions,
      });
      throw new AuthorizationError(`Permission required: ${permission}`);
    }
  }
}

/**
 * HOC for protecting routes that require authentication
 */
export function withAuth<P>(Component: React.ComponentType<P>): React.FC<P> {
  return function AuthComponent(props: P) {
    const router = useRouter();
    const isAuthenticated = AuthService.isAuthenticated();
    
    useEffect(() => {
      if (!isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, router]);
    
    if (!isAuthenticated) {
      return null;
    }
    
    return React.createElement(Component, props);
  };
}

/**
 * HOC for protecting routes that require specific permissions
 */
export function withPermission(permission: string) {
  return function <P>(Component: React.ComponentType<P>): React.FC<P> {
    return function PermissionComponent(props: P) {
      const router = useRouter();
      const user = AuthService.getStoredUser();
      const hasPermission = user && AuthService.checkPermission(user, permission);
      
      useEffect(() => {
        if (!hasPermission) {
          router.push("/unauthorized");
        }
      }, [hasPermission, router]);
      
      if (!hasPermission) {
        return null;
      }
      
      return React.createElement(Component, props);
    };
  };
}
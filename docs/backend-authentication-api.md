# Backend Authentication API Implementation Guide

## Overview

This document provides comprehensive guidance for implementing the authentication module API for the Djobea Analytics platform. The authentication system uses JWT tokens with refresh token rotation for secure user management.

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "user"
}
\`\`\`

**Response (Success - 201):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "permissions": ["read:profile", "update:profile"],
      "isActive": true,
      "lastLogin": null,
      "profile": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
\`\`\`

**Response (Error - 400):**
\`\`\`json
{
  "success": false,
  "error": "Email already exists",
  "code": "EMAIL_EXISTS"
}
\`\`\`

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
\`\`\`json
{
  "email": "admin@djobea.ai",
  "password": "password123",
  "rememberMe": true
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "eb7624d2-6ee7-43bd-bc1a-b548f61d5a49",
      "name": "Admin User",
      "email": "admin@djobea.ai",
      "role": "admin",
      "permissions": [
        "manage:permissions",
        "manage:roles",
        "read:profile",
        "manage:system",
        "read:admin_dashboard",
        "manage:requests",
        "read:analytics",
        "manage:providers",
        "manage:users",
        "update:profile"
      ],
      "isActive": true,
      "lastLogin": "2025-07-16T17:17:51.337462",
      "profile": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
\`\`\`

### 3. Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
\`\`\`
Authorization: Bearer <refresh_token>
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
\`\`\`

### 4. Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Headers:**
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "eb7624d2-6ee7-43bd-bc1a-b548f61d5a49",
    "name": "Admin User",
    "email": "admin@djobea.ai",
    "role": "admin",
    "permissions": ["manage:permissions", "manage:roles", "read:profile"],
    "isActive": true,
    "lastLogin": "2025-07-16T17:17:51.337462",
    "profile": {
      "phone": "+237123456789",
      "address": "Douala, Cameroon"
    }
  }
}
\`\`\`

### 5. Update User Profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "Updated Name",
  "profile": {
    "phone": "+237987654321",
    "address": "Yaoundé, Cameroon"
  }
}
\`\`\`

### 6. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

**Request Body:**
\`\`\`json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456!"
}
\`\`\`

### 7. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

## Database Schema

### Users Table

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  profile JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
\`\`\`

### Permissions Table

\`\`\`sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
  role VARCHAR(50) NOT NULL,
  permission_id UUID NOT NULL,
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  PRIMARY KEY (role, permission_id)
);
\`\`\`

### Refresh Tokens Table

\`\`\`sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
\`\`\`

## JWT Token Structure

### Access Token Payload

\`\`\`json
{
  "sub": "eb7624d2-6ee7-43bd-bc1a-b548f61d5a49",
  "email": "admin@djobea.ai",
  "role": "admin",
  "permissions": ["manage:permissions", "manage:roles"],
  "iat": 1642694271,
  "exp": 1642697871,
  "type": "access"
}
\`\`\`

### Refresh Token Payload

\`\`\`json
{
  "sub": "eb7624d2-6ee7-43bd-bc1a-b548f61d5a49",
  "iat": 1642694271,
  "exp": 1645286271,
  "type": "refresh"
}
\`\`\`

## Implementation Example (Node.js/Express)

### Authentication Controller

\`\`\`javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role = 'user' } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required'
        });
      }

      // Check if user exists
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists',
          code: 'EMAIL_EXISTS'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const userId = uuidv4();
      await db.query(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        [userId, name, email, passwordHash, role]
      );

      // Get user with permissions
      const user = await this.getUserWithPermissions(userId);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      res.status(201).json({
        success: true,
        data: {
          user,
          ...tokens
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Get user
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      await db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Get user with permissions
      const userWithPermissions = await this.getUserWithPermissions(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(userWithPermissions, rememberMe);

      res.json({
        success: true,
        data: {
          user: userWithPermissions,
          ...tokens
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getUserWithPermissions(userId) {
    const userResult = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.is_active as "isActive",
        u.last_login as "lastLogin", u.profile,
        COALESCE(
          json_agg(p.name) FILTER (WHERE p.name IS NOT NULL), 
          '[]'::json
        ) as permissions
      FROM users u
      LEFT JOIN role_permissions rp ON u.role = rp.role
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.email, u.role, u.is_active, u.last_login, u.profile
    `, [userId]);

    return userResult.rows[0];
  }

  async generateTokens(user, rememberMe = false) {
    const accessTokenExpiry = '1h';
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        type: 'access'
      },
      process.env.JWT_SECRET,
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      {
        sub: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: refreshTokenExpiry }
    );

    // Store refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    return {
      token: accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }
}
\`\`\`

### Authentication Middleware

\`\`\`javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.role === 'admin' || req.user.permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
  };
};
\`\`\`

## Security Considerations

1. **Password Security**: Use bcrypt with at least 12 rounds
2. **JWT Secrets**: Use strong, unique secrets for access and refresh tokens
3. **Token Expiry**: Short-lived access tokens (1 hour), longer refresh tokens (7-30 days)
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Input Validation**: Validate and sanitize all inputs
6. **HTTPS Only**: Always use HTTPS in production
7. **CORS**: Configure CORS properly for your frontend domain

## Error Codes

- `EMAIL_EXISTS`: Email already registered
- `INVALID_CREDENTIALS`: Wrong email/password
- `TOKEN_EXPIRED`: JWT token has expired
- `TOKEN_INVALID`: JWT token is malformed
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `ACCOUNT_DISABLED`: User account is deactivated

## Testing

### Unit Tests
- Password hashing and verification
- JWT token generation and validation
- User creation and retrieval
- Permission checking

### Integration Tests
- Complete authentication flow
- Token refresh mechanism
- Protected route access
- Error handling scenarios

### Security Tests
- SQL injection attempts
- Brute force protection
- Token manipulation
- Permission escalation

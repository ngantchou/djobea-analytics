import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulation de récupération depuis la base de données
    await new Promise((resolve) => setTimeout(resolve, 500))

    const adminSettings = {
      users: [
        {
          id: "1",
          name: "John Doe",
          email: "john@djobea.com",
          role: "super_admin",
          status: "active",
          lastLogin: "2025-01-09 14:30",
          permissions: ["user_management", "role_management", "system_settings"],
          createdAt: "2024-01-15",
          loginAttempts: 0,
        },
      ],
      roles: [
        {
          id: "super_admin",
          name: "Super Admin",
          description: "Accès complet au système",
          permissions: ["user_management", "role_management", "system_settings"],
          userCount: 1,
          isSystem: true,
        },
      ],
      debugSettings: {
        debugMode: false,
        realTimeLogs: true,
        webhookTesting: true,
        aiPlayground: true,
        cacheReset: true,
        performanceMonitoring: true,
        logLevel: "info",
        maxLogSize: 100,
      },
      mobileAdminSettings: {
        pwaEnabled: true,
        pushNotifications: true,
        emergencyAccess: true,
        mobileOptimized: true,
        offlineMode: false,
        biometricAuth: true,
      },
      systemSettings: {
        sessionTimeout: 8,
        auditEnabled: true,
        slackNotifications: true,
        emailNotifications: true,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        twoFactorRequired: false,
      },
    }

    return NextResponse.json({
      success: true,
      data: adminSettings,
    })
  } catch (error) {
    console.error("Erreur récupération paramètres admin:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la récupération" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()

    // Validation des données
    const errors = []

    // Validation utilisateurs
    if (!settings.users || !Array.isArray(settings.users)) {
      errors.push("Liste des utilisateurs invalide")
    } else {
      settings.users.forEach((user: any, index: number) => {
        if (!user.name || !user.email || !user.role) {
          errors.push(`Utilisateur ${index + 1}: champs obligatoires manquants`)
        }
        if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          errors.push(`Utilisateur ${index + 1}: email invalide`)
        }
      })
    }

    // Validation rôles
    if (!settings.roles || !Array.isArray(settings.roles)) {
      errors.push("Liste des rôles invalide")
    } else {
      settings.roles.forEach((role: any, index: number) => {
        if (!role.name || !role.description) {
          errors.push(`Rôle ${index + 1}: nom et description requis`)
        }
        if (!Array.isArray(role.permissions)) {
          errors.push(`Rôle ${index + 1}: permissions invalides`)
        }
      })
    }

    // Validation paramètres système
    if (settings.systemSettings) {
      const sys = settings.systemSettings
      if (sys.sessionTimeout < 1 || sys.sessionTimeout > 24) {
        errors.push("Timeout de session doit être entre 1 et 24 heures")
      }
      if (sys.maxLoginAttempts < 3 || sys.maxLoginAttempts > 10) {
        errors.push("Tentatives de connexion doivent être entre 3 et 10")
      }
      if (sys.passwordExpiry < 30 || sys.passwordExpiry > 365) {
        errors.push("Expiration mot de passe doit être entre 30 et 365 jours")
      }
    }

    // Validation paramètres debug
    if (settings.debugSettings) {
      const debug = settings.debugSettings
      if (debug.maxLogSize < 10 || debug.maxLogSize > 1000) {
        errors.push("Taille max logs doit être entre 10 et 1000 MB")
      }
      if (!["error", "warn", "info", "debug"].includes(debug.logLevel)) {
        errors.push("Niveau de log invalide")
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, message: "Erreurs de validation", errors }, { status: 400 })
    }

    // Simulation de sauvegarde
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Log des modifications importantes
    console.log("Paramètres admin sauvegardés:", {
      usersCount: settings.users?.length || 0,
      rolesCount: settings.roles?.length || 0,
      debugMode: settings.debugSettings?.debugMode || false,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Configuration admin sauvegardée avec succès",
      timestamp: new Date().toISOString(),
      stats: {
        users: settings.users?.length || 0,
        roles: settings.roles?.length || 0,
        activeUsers: settings.users?.filter((u: any) => u.status === "active").length || 0,
      },
    })
  } catch (error) {
    console.error("Erreur sauvegarde paramètres admin:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la sauvegarde" }, { status: 500 })
  }
}

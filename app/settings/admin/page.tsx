"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  Users,
  Shield,
  Settings,
  Save,
  TestTube,
  Plus,
  Edit,
  Play,
  Pause,
  Smartphone,
  Bell,
  Bug,
  Activity,
  Zap,
  Database,
  Gamepad2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  MoreHorizontal,
  Monitor,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import {
  userManagementService,
  AVAILABLE_PERMISSIONS,
  type User,
  type Role,
  type CreateUserData,
  type CreateRoleData,
  type UserFilters,
  type RoleFilters,
} from "@/lib/services/user-management-service"

interface DebugSettings {
  debugMode: boolean
  realTimeLogs: boolean
  webhookTesting: boolean
  aiPlayground: boolean
  cacheReset: boolean
  performanceMonitoring: boolean
  logLevel: "error" | "warn" | "info" | "debug"
  maxLogSize: number
}

interface MobileAdminSettings {
  pwaEnabled: boolean
  pushNotifications: boolean
  emergencyAccess: boolean
  mobileOptimized: boolean
  offlineMode: boolean
  biometricAuth: boolean
}

interface SystemSettings {
  sessionTimeout: number
  auditEnabled: boolean
  slackNotifications: boolean
  emailNotifications: boolean
  maxLoginAttempts: number
  passwordExpiry: number
  twoFactorRequired: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Modal states
  const [showResetModal, setShowResetModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showTestResults, setShowTestResults] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [roleStats, setRoleStats] = useState<any>(null)

  // Filter states
  const [userFilters, setUserFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  })
  const [roleFilters, setRoleFilters] = useState<RoleFilters>({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  })

  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "user" | "role"; id: string; name: string } | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [importData, setImportData] = useState("")

  const [newUser, setNewUser] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "",
    permissions: [],
  })

  const [newRole, setNewRole] = useState<CreateRoleData>({
    name: "",
    description: "",
    permissions: [],
  })

  // Settings states
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    debugMode: false,
    realTimeLogs: true,
    webhookTesting: true,
    aiPlayground: true,
    cacheReset: true,
    performanceMonitoring: true,
    logLevel: "info",
    maxLogSize: 100,
  })

  const [mobileAdminSettings, setMobileAdminSettings] = useState<MobileAdminSettings>({
    pwaEnabled: true,
    pushNotifications: true,
    emergencyAccess: true,
    mobileOptimized: true,
    offlineMode: false,
    biometricAuth: true,
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    sessionTimeout: 8,
    auditEnabled: true,
    slackNotifications: true,
    emailNotifications: true,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    twoFactorRequired: false,
  })

  // Load data on component mount
  useEffect(() => {
    loadUsers()
    loadRoles()
    loadStats()
  }, [userFilters, roleFilters])

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const result = await userManagementService.getUsers(userFilters)
      setUsers(result.users)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const result = await userManagementService.getRoles(roleFilters)
      setRoles(result.roles)
    } catch (error) {
      console.error("Failed to load roles:", error)
      toast.error("Erreur lors du chargement des rôles")
    }
  }

  const loadStats = async () => {
    try {
      const [userStatsData, roleStatsData] = await Promise.all([
        userManagementService.getUserStats(),
        userManagementService.getRoleStats(),
      ])
      setUserStats(userStatsData)
      setRoleStats(roleStatsData)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debugSettings,
          mobileAdminSettings,
          systemSettings,
        }),
      })

      if (!response.ok) throw new Error("Erreur sauvegarde")

      setHasUnsavedChanges(false)
      toast.success("Configuration admin sauvegardée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset to default values
      setSystemSettings({
        sessionTimeout: 8,
        auditEnabled: true,
        slackNotifications: true,
        emailNotifications: true,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        twoFactorRequired: false,
      })

      setDebugSettings({
        debugMode: false,
        realTimeLogs: true,
        webhookTesting: true,
        aiPlayground: true,
        cacheReset: true,
        performanceMonitoring: true,
        logLevel: "info",
        maxLogSize: 100,
      })

      setHasUnsavedChanges(false)
      setShowResetModal(false)
      toast.success("Configuration réinitialisée")
    } catch (error) {
      toast.error("Erreur lors de la réinitialisation")
    } finally {
      setLoading(false)
    }
  }

  const handleTestAdminTools = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/admin/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debugSettings,
          systemSettings,
          mobileAdminSettings,
        }),
      })

      const results = await response.json()
      setTestResults(results)
      setShowTestResults(true)
      toast.success("Tests admin terminés")
    } catch (error) {
      toast.error("Erreur lors des tests")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setLoading(true)
      await userManagementService.createUser(newUser)
      setNewUser({ name: "", email: "", password: "", role: "", permissions: [] })
      setShowUserModal(false)
      setHasUnsavedChanges(true)
      toast.success(`Utilisateur ${newUser.name} ajouté`)
      loadUsers()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: "", // Don't pre-fill password
      role: user.role,
      permissions: user.permissions,
    })
    setShowUserModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      const updateData = { ...newUser }
      delete updateData.password // Don't update password unless specified

      await userManagementService.updateUser(selectedUser.id, updateData)
      setSelectedUser(null)
      setNewUser({ name: "", email: "", password: "", role: "", permissions: [] })
      setShowUserModal(false)
      setHasUnsavedChanges(true)
      toast.success("Utilisateur mis à jour")
      loadUsers()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return

    try {
      setLoading(true)
      await userManagementService.deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      setShowDeleteModal(false)
      setHasUnsavedChanges(true)
      toast.success(`Utilisateur ${deleteTarget.name} supprimé`)
      loadUsers()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression")
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setLoading(true)
      await userManagementService.createRole(newRole)
      setNewRole({ name: "", description: "", permissions: [] })
      setShowRoleModal(false)
      setHasUnsavedChanges(true)
      toast.success(`Rôle ${newRole.name} créé`)
      loadRoles()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return

    try {
      setLoading(true)
      await userManagementService.updateRole(selectedRole.id, newRole)
      setSelectedRole(null)
      setNewRole({ name: "", description: "", permissions: [] })
      setShowRoleModal(false)
      setHasUnsavedChanges(true)
      toast.success("Rôle mis à jour")
      loadRoles()
      loadUsers() // Reload users as their permissions might have changed
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteTarget) return

    try {
      setLoading(true)
      await userManagementService.deleteRole(deleteTarget.id)
      setDeleteTarget(null)
      setShowDeleteModal(false)
      setHasUnsavedChanges(true)
      toast.success(`Rôle ${deleteTarget.name} supprimé`)
      loadRoles()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression")
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId)
      if (!user) return

      const newStatus = user.status === "active" ? "inactive" : "active"
      await userManagementService.updateUser(userId, { status: newStatus })
      setHasUnsavedChanges(true)
      toast.success("Statut utilisateur mis à jour")
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handleExport = () => {
    const exportData = {
      users,
      roles,
      debugSettings,
      mobileAdminSettings,
      systemSettings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `djobea-admin-config-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowExportModal(false)
    toast.success("Configuration exportée")
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)

      if (data.debugSettings) setDebugSettings(data.debugSettings)
      if (data.mobileAdminSettings) setMobileAdminSettings(data.mobileAdminSettings)
      if (data.systemSettings) setSystemSettings(data.systemSettings)

      setHasUnsavedChanges(true)
      setShowImportModal(false)
      setImportData("")
      toast.success("Configuration importée")
    } catch (error) {
      toast.error("Format JSON invalide")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "suspended":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "inactive":
        return "Inactif"
      case "suspended":
        return "Suspendu"
      default:
        return "Inconnu"
    }
  }

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case "super_admin":
        return "bg-purple-500"
      case "admin":
        return "bg-blue-500"
      case "manager":
        return "bg-green-500"
      case "operator":
        return "bg-yellow-500"
      case "support":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  // Check if user has admin permissions
  if (!user || (user.role !== "admin" && !user.permissions.includes("system:admin"))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès Refusé</h2>
            <p className="text-gray-300 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <Button asChild>
              <Link href="/settings">Retour aux paramètres</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        </div>

        {/* Unsaved changes banner */}
        {hasUnsavedChanges && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-2 text-center text-sm font-medium">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Vous avez des modifications non sauvegardées
          </div>
        )}

        {/* Back button */}
        <div className="fixed top-20 left-4 z-50">
          <Link href="/settings">
            <Button
              variant="outline"
              className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Retour aux paramètres
            </Button>
          </Link>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/settings" className="hover:text-white transition-colors">
                Paramètres
              </Link>
              <span>/</span>
              <span className="text-white">Interface Admin</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Interface Admin
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Gestion des utilisateurs, rôles et outils de debug
            </p>

            {/* Stats Overview */}
            {userStats && roleStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{userStats.total}</div>
                    <div className="text-sm text-gray-400">Utilisateurs</div>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{userStats.active}</div>
                    <div className="text-sm text-gray-400">Actifs</div>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{roleStats.total}</div>
                    <div className="text-sm text-gray-400">Rôles</div>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{roleStats.totalPermissions}</div>
                    <div className="text-sm text-gray-400">Permissions</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions & Advanced Tools */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Outils d'Administration Avancés</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/system-monitor">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Monitor className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Monitoring Système</h3>
                      <p className="text-xs text-gray-400">Surveillance temps réel du serveur et des services</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/admin/api-logs">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Terminal className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Logs API</h3>
                      <p className="text-xs text-gray-400">Visualisation en temps réel des requêtes API</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/admin/database-health">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-1">Santé BD</h3>
                      <p className="text-xs text-gray-400">Monitoring et maintenance de la base de données</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="bg-black/40 backdrop-blur-sm border-white/10">
                <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="roles" className="data-[state=active]:bg-purple-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Rôles & Permissions
                </TabsTrigger>
                <TabsTrigger value="debug" className="data-[state=active]:bg-purple-600">
                  <Bug className="h-4 w-4 mr-2" />
                  Outils Debug
                </TabsTrigger>
                <TabsTrigger value="mobile" className="data-[state=active]:bg-purple-600">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Interface Mobile
                </TabsTrigger>
              </TabsList>

              {/* Gestion Utilisateurs */}
              <TabsContent value="users" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white">Gestion des Utilisateurs</CardTitle>
                            <CardDescription>Configuration des comptes utilisateurs</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            {userStats?.active || 0} actifs
                          </Badge>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              setSelectedUser(null)
                              setNewUser({ name: "", email: "", password: "", role: "", permissions: [] })
                              setShowUserModal(true)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Rechercher par nom, email..."
                              value={userFilters.search || ""}
                              onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value, page: 1 })}
                              className="pl-10 bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <Select
                          value={userFilters.status || "all"}
                          onValueChange={(value) =>
                            setUserFilters({
                              ...userFilters,
                              status: value === "all" ? undefined : (value as any),
                              page: 1,
                            })
                          }
                        >
                          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                            <SelectItem value="suspended">Suspendu</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={userFilters.role || "all"}
                          onValueChange={(value) =>
                            setUserFilters({ ...userFilters, role: value === "all" ? undefined : value, page: 1 })
                          }
                        >
                          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les rôles</SelectItem>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Users List */}
                      <div className="space-y-3">
                        {loading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Skeleton className="w-3 h-3 rounded-full" />
                                  <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                  </div>
                                  <Skeleton className="h-6 w-20" />
                                </div>
                                <div className="flex gap-1">
                                  <Skeleton className="h-8 w-8" />
                                  <Skeleton className="h-8 w-8" />
                                  <Skeleton className="h-8 w-8" />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : users.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Aucun utilisateur trouvé</h3>
                            <p className="text-gray-400 mb-4">Commencez par créer votre premier utilisateur.</p>
                            <Button
                              onClick={() => {
                                setSelectedUser(null)
                                setNewUser({ name: "", email: "", password: "", role: "", permissions: [] })
                                setShowUserModal(true)
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Créer un utilisateur
                            </Button>
                          </div>
                        ) : (
                          users.map((user) => (
                            <div
                              key={user.id}
                              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${getStatusColor(user.status)} animate-pulse`}
                                    />
                                    <span className="text-sm text-gray-400">{getStatusText(user.status)}</span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium">{user.name}</h4>
                                    <p className="text-sm text-gray-400">{user.email}</p>
                                  </div>
                                  <Badge className={`${getRoleColor(user.role)} text-white`}>
                                    {roles.find((r) => r.id === user.role)?.name || user.role}
                                  </Badge>
                                  {user.loginAttempts > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {user.loginAttempts} tentatives
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    Dernière connexion: {user.lastLogin || "Jamais"}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                                        {user.status === "active" ? (
                                          <>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Désactiver
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Activer
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setDeleteTarget({ type: "user", id: user.id, name: user.name })
                                          setShowDeleteModal(true)
                                        }}
                                        className="text-red-400"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-gray-400">Permissions:</span>
                                <span className="text-xs text-purple-400">
                                  {user.permissions.length}/{AVAILABLE_PERMISSIONS.length}
                                </span>
                                <Progress
                                  value={(user.permissions.length / AVAILABLE_PERMISSIONS.length) * 100}
                                  className="h-1 flex-1 max-w-32"
                                />
                                <span className="text-xs text-gray-400">Créé: {user.createdAt}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Rôles & Permissions */}
              <TabsContent value="roles" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Shield className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white">Rôles & Permissions</CardTitle>
                            <CardDescription>Configuration des rôles et permissions granulaires</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            {AVAILABLE_PERMISSIONS.length} permissions disponibles
                          </Badge>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              setSelectedRole(null)
                              setNewRole({ name: "", description: "", permissions: [] })
                              setShowRoleModal(true)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau rôle
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Rechercher par nom, description..."
                              value={roleFilters.search || ""}
                              onChange={(e) => setRoleFilters({ ...roleFilters, search: e.target.value, page: 1 })}
                              className="pl-10 bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <Select
                          value={
                            roleFilters.isSystem === undefined ? "all" : roleFilters.isSystem ? "system" : "custom"
                          }
                          onValueChange={(value) =>
                            setRoleFilters({
                              ...roleFilters,
                              isSystem: value === "all" ? undefined : value === "system",
                              page: 1,
                            })
                          }
                        >
                          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            <SelectItem value="system">Système</SelectItem>
                            <SelectItem value="custom">Personnalisé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Roles Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <Skeleton className="h-4 w-full mb-4" />
                              <div className="space-y-2">
                                <Skeleton className="h-2 w-full" />
                                <div className="grid grid-cols-2 gap-1">
                                  {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-3 w-full" />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : roles.length === 0 ? (
                          <div className="col-span-2 text-center py-8">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Aucun rôle trouvé</h3>
                            <p className="text-gray-400 mb-4">Créez votre premier rôle personnalisé.</p>
                            <Button
                              onClick={() => {
                                setSelectedRole(null)
                                setNewRole({ name: "", description: "", permissions: [] })
                                setShowRoleModal(true)
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Créer un rôle
                            </Button>
                          </div>
                        ) : (
                          roles.map((role) => (
                            <div
                              key={role.id}
                              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge className={`${getRoleColor(role.id)} text-white`}>{role.name}</Badge>
                                  <span className="text-sm text-gray-400">{role.userCount} utilisateurs</span>
                                  {role.isSystem && (
                                    <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                      Système
                                    </Badge>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRole(role)
                                        setNewRole({
                                          name: role.name,
                                          description: role.description,
                                          permissions: role.permissions,
                                        })
                                        setShowRoleModal(true)
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    {!role.isSystem && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setDeleteTarget({ type: "role", id: role.id, name: role.name })
                                          setShowDeleteModal(true)
                                        }}
                                        className="text-red-400"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <p className="text-sm text-gray-400 mb-4">{role.description}</p>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-300">Permissions accordées</span>
                                  <span className="text-sm text-purple-400">
                                    {role.permissions.length}/{AVAILABLE_PERMISSIONS.length}
                                  </span>
                                </div>
                                <Progress
                                  value={(role.permissions.length / AVAILABLE_PERMISSIONS.length) * 100}
                                  className="h-2"
                                />

                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {role.permissions.slice(0, 8).map((permission) => (
                                    <div key={permission} className="text-gray-400 truncate">
                                      • {permission.replace(":", " ").replace("_", " ")}
                                    </div>
                                  ))}
                                  {role.permissions.length > 8 && (
                                    <div className="text-purple-400">+{role.permissions.length - 8} autres...</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Debug Tools Tab */}
              <TabsContent value="debug" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Bug className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white">Outils de Debug</CardTitle>
                            <CardDescription>Configuration des outils de développement et debug</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${debugSettings.debugMode ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 animate-pulse ${debugSettings.debugMode ? "bg-yellow-400" : "bg-green-400"}`}
                          />
                          {debugSettings.debugMode ? "Debug actif" : "Production"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Mode Debug</Label>
                              <p className="text-xs text-gray-400">Active les logs détaillés et le mode développeur</p>
                            </div>
                            <Switch
                              checked={debugSettings.debugMode}
                              onCheckedChange={(value) => {
                                setDebugSettings({ ...debugSettings, debugMode: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Logs temps réel</Label>
                              <p className="text-xs text-gray-400">Interface web pour les logs en direct</p>
                            </div>
                            <Switch
                              checked={debugSettings.realTimeLogs}
                              onCheckedChange={(value) => {
                                setDebugSettings({ ...debugSettings, realTimeLogs: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Test webhook intégré</Label>
                              <p className="text-xs text-gray-400">Outil de test des webhooks</p>
                            </div>
                            <Switch
                              checked={debugSettings.webhookTesting}
                              onCheckedChange={(value) => {
                                setDebugSettings({ ...debugSettings, webhookTesting: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Playground IA</Label>
                              <p className="text-xs text-gray-400">Interface de test pour l'IA conversationnelle</p>
                            </div>
                            <Switch
                              checked={debugSettings.aiPlayground}
                              onCheckedChange={(value) => {
                                setDebugSettings({ ...debugSettings, aiPlayground: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Reset cache</Label>
                              <p className="text-xs text-gray-400">Bouton admin pour vider le cache</p>
                            </div>
                            <Switch
                              checked={debugSettings.cacheReset}
                              onCheckedChange={(value) => {
                                setDebugSettings({ ...debugSettings, cacheReset: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Monitoring performance</Label>
                              <p className="text-xs text-gray-400">Outils de monitoring des performances</p>
                            </div>
                            <Switch
                              checked={debugSettings.performanceMonitoring}
                              onCheckedChange={(value) => {
                                setDebugSettings({ ...debugSettings, performanceMonitoring: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Configuration avancée */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Niveau de log</Label>
                          <Select
                            value={debugSettings.logLevel}
                            onValueChange={(value: "error" | "warn" | "info" | "debug") => {
                              setDebugSettings({ ...debugSettings, logLevel: value })
                              setHasUnsavedChanges(true)
                            }}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300">Taille max logs (MB)</Label>
                          <Input
                            type="number"
                            value={debugSettings.maxLogSize}
                            onChange={(e) => {
                              setDebugSettings({ ...debugSettings, maxLogSize: Number(e.target.value) })
                              setHasUnsavedChanges(true)
                            }}
                            className="bg-white/5 border-white/10 text-white"
                            min={10}
                            max={1000}
                          />
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <Label className="text-gray-300">Actions rapides de debug</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={() => toast.info("Logs en temps réel activés")}
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            Logs live
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={() => toast.info("Cache vidé avec succès")}
                          >
                            <Database className="w-4 h-4 mr-2" />
                            Vider cache
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={() => toast.info("Playground IA ouvert")}
                          >
                            <Gamepad2 className="w-4 h-4 mr-2" />
                            IA Playground
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={() => toast.info("Test webhook lancé")}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Test webhook
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Mobile Admin Tab */}
              <TabsContent value="mobile" className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader className="border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-500/20 rounded-lg">
                            <Smartphone className="w-6 h-6 text-pink-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white">Interface Mobile Admin</CardTitle>
                            <CardDescription>Configuration de l'accès admin mobile et PWA</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                          PWA disponible
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Progressive Web App</Label>
                              <p className="text-xs text-gray-400">Installation comme app mobile</p>
                            </div>
                            <Switch
                              checked={mobileAdminSettings.pwaEnabled}
                              onCheckedChange={(value) => {
                                setMobileAdminSettings({ ...mobileAdminSettings, pwaEnabled: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Notifications push admin</Label>
                              <p className="text-xs text-gray-400">Alertes importantes sur mobile</p>
                            </div>
                            <Switch
                              checked={mobileAdminSettings.pushNotifications}
                              onCheckedChange={(value) => {
                                setMobileAdminSettings({ ...mobileAdminSettings, pushNotifications: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Mode hors ligne</Label>
                              <p className="text-xs text-gray-400">Fonctionnalités offline</p>
                            </div>
                            <Switch
                              checked={mobileAdminSettings.offlineMode}
                              onCheckedChange={(value) => {
                                setMobileAdminSettings({ ...mobileAdminSettings, offlineMode: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Accès d'urgence mobile</Label>
                              <p className="text-xs text-gray-400">Actions critiques depuis mobile</p>
                            </div>
                            <Switch
                              checked={mobileAdminSettings.emergencyAccess}
                              onCheckedChange={(value) => {
                                setMobileAdminSettings({ ...mobileAdminSettings, emergencyAccess: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Dashboard mobile optimisé</Label>
                              <p className="text-xs text-gray-400">Interface adaptée mobile</p>
                            </div>
                            <Switch
                              checked={mobileAdminSettings.mobileOptimized}
                              onCheckedChange={(value) => {
                                setMobileAdminSettings({ ...mobileAdminSettings, mobileOptimized: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-gray-300">Authentification biométrique</Label>
                              <p className="text-xs text-gray-400">Empreinte/Face ID</p>
                            </div>
                            <Switch
                              checked={mobileAdminSettings.biometricAuth}
                              onCheckedChange={(value) => {
                                setMobileAdminSettings({ ...mobileAdminSettings, biometricAuth: value })
                                setHasUnsavedChanges(true)
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="mt-8">
                        <Label className="text-gray-300 mb-4 block">Aperçu des fonctionnalités mobiles</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                            <Bell className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <h5 className="text-white font-medium mb-1">Notifications</h5>
                            <p className="text-xs text-gray-400">Push instantanées pour alertes critiques</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <h5 className="text-white font-medium mb-1">Actions d'urgence</h5>
                            <p className="text-xs text-gray-400">Accès rapide aux fonctions critiques</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <h5 className="text-white font-medium mb-1">Monitoring</h5>
                            <p className="text-xs text-gray-400">Tableau de bord temps réel</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowExportModal(true)}
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                      </Button>
                      <Button
                        onClick={() => setShowImportModal(true)}
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Importer
                      </Button>
                      <Button
                        onClick={() => setShowResetModal(true)}
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleTestAdminTools}
                        variant="outline"
                        disabled={loading}
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Tester les outils
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Sauvegarde..." : "Sauvegarder la configuration"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Modals */}

        {/* Reset Modal */}
        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Confirmer la réinitialisation
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Cette action va restaurer tous les paramètres admin aux valeurs par défaut. Les utilisateurs et rôles ne
                seront pas affectés.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleReset} disabled={loading} className="bg-red-600 hover:bg-red-700">
                {loading ? "Réinitialisation..." : "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
              <DialogDescription className="text-gray-300">
                {selectedUser ? "Modifiez les informations de l'utilisateur" : "Créez un nouveau compte utilisateur"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="john@djobea.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mot de passe {selectedUser && "(laisser vide pour ne pas changer)"}</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder={selectedUser ? "Nouveau mot de passe" : "Mot de passe"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Permissions personnalisées ({newUser.permissions?.length || 0}/{AVAILABLE_PERMISSIONS.length})
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-white/5 p-3 rounded border border-white/10">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={newUser.permissions?.includes(permission) || false}
                        onCheckedChange={(checked) => {
                          const currentPermissions = newUser.permissions || []
                          if (checked) {
                            setNewUser({ ...newUser, permissions: [...currentPermissions, permission] })
                          } else {
                            setNewUser({ ...newUser, permissions: currentPermissions.filter((p) => p !== permission) })
                          }
                        }}
                      />
                      <Label htmlFor={permission} className="text-xs">
                        {permission.replace(":", " ").replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={selectedUser ? handleUpdateUser : handleAddUser}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "En cours..." : selectedUser ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Modal */}
        <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedRole ? "Modifier le rôle" : "Créer un rôle"}</DialogTitle>
              <DialogDescription className="text-gray-300">
                {selectedRole
                  ? "Modifiez les permissions du rôle"
                  : "Créez un nouveau rôle avec des permissions spécifiques"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du rôle</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Manager"
                  disabled={selectedRole?.isSystem}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Description du rôle..."
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Permissions ({newRole.permissions.length}/{AVAILABLE_PERMISSIONS.length})
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-white/5 p-3 rounded border border-white/10">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${permission}`}
                        checked={newRole.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRole({ ...newRole, permissions: [...newRole.permissions, permission] })
                          } else {
                            setNewRole({ ...newRole, permissions: newRole.permissions.filter((p) => p !== permission) })
                          }
                        }}
                        disabled={selectedRole?.isSystem}
                      />
                      <Label htmlFor={`role-${permission}`} className="text-xs">
                        {permission.replace(":", " ").replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={selectedRole ? handleUpdateRole : handleAddRole}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "En cours..." : selectedRole ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Êtes-vous sûr de vouloir supprimer {deleteTarget?.type === "user" ? "l'utilisateur" : "le rôle"} "
                {deleteTarget?.name}" ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={deleteTarget?.type === "user" ? handleDeleteUser : handleDeleteRole}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Results Modal */}
        <Dialog open={showTestResults} onOpenChange={setShowTestResults}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-green-400" />
                Résultats des tests admin
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Tests automatisés des outils d'administration
              </DialogDescription>
            </DialogHeader>
            {testResults && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {testResults.tests?.map((test: any, index: number) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{test.name}</h4>
                      <Badge className={test.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                        {test.success ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {test.success ? "Réussi" : "Échoué"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{test.message}</p>
                    {test.duration && <p className="text-xs text-gray-500 mt-1">Durée: {test.duration}ms</p>}
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowTestResults(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Exporter la configuration
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Téléchargez un fichier JSON contenant tous les paramètres admin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Contenu de l'export :</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Utilisateurs et leurs permissions</li>
                  <li>• Rôles et configurations</li>
                  <li>• Paramètres de debug</li>
                  <li>• Configuration mobile admin</li>
                  <li>• Paramètres système</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-400" />
                Importer la configuration
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Collez le contenu JSON d'une configuration exportée
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Configuration JSON</Label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-32"
                  placeholder='{"debugSettings": {...}, "mobileAdminSettings": {...}}'
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleImport} disabled={!importData} className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Importer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  Key,
  Bell,
  Globe,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationStore } from "@/store/use-notification-store"
import { ProfileStats } from "@/components/features/profile/profile-stats"
import { ProfileActivity } from "@/components/features/profile/profile-activity"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  bio: string
  role: string
  status: string
  joinDate: Date
  lastLogin: string
  avatar?: string
  stats: {
    totalSessions: number
    averageSessionTime: string
    actionsPerformed: number
    favoriteFeature: string
  }
}

export default function ProfilePage() {
  const { addNotification } = useNotificationStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    firstName: "Admin",
    lastName: "Djobea",
    email: "admin@djobea.com",
    phone: "+33 6 12 34 56 78",
    address: "123 Rue de la Paix",
    city: "Paris",
    country: "France",
    bio: "Administrateur de la plateforme Djobea Analytics. Passionné par l'innovation et la technologie.",
    role: "Administrateur",
    status: "active",
    joinDate: new Date("2023-01-15"),
    lastLogin: "Il y a 2 heures",
    stats: {
      totalSessions: 1247,
      averageSessionTime: "2h 34m",
      actionsPerformed: 8934,
      favoriteFeature: "Analytics",
    },
  })

  const [editedProfile, setEditedProfile] = useState(profile)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  })

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: 30,
  })

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
    addNotification({
      title: "Profil mis à jour",
      message: "Vos informations ont été sauvegardées avec succès",
      type: "success",
    })
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    addNotification({
      title: "Préférences mises à jour",
      message: `Notifications ${key} ${value ? "activées" : "désactivées"}`,
      type: "info",
    })
  }

  const handleSecurityChange = (key: string, value: boolean | number) => {
    setSecurity((prev) => ({ ...prev, [key]: value }))
    addNotification({
      title: "Sécurité mise à jour",
      message: `Paramètre de sécurité ${key} modifié`,
      type: "success",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
              <p className="text-gray-400">Gérez vos informations personnelles et préférences</p>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-600 text-gray-300 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
                <User className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-blue-600">
                <Shield className="w-4 h-4 mr-2" />
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                Activité
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
                <Shield className="w-4 h-4 mr-2" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                  <CardHeader className="text-center">
                    <div className="relative mx-auto">
                      <Avatar className="w-32 h-32 mx-auto">
                        <AvatarImage src={profile.avatar || "/placeholder.svg?height=128&width=128&text=AD"} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                          {profile.firstName[0]}
                          {profile.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-white mt-4">
                      {profile.firstName} {profile.lastName}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                        {profile.role}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Membre depuis {profile.joinDate.getFullYear()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Dernière connexion: {profile.lastLogin}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Informations personnelles</CardTitle>
                      <CardDescription className="text-gray-400">
                        Vos informations de base et de contact
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-gray-300">
                            Prénom
                          </Label>
                          <Input
                            id="firstName"
                            value={isEditing ? editedProfile.firstName : profile.firstName}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-gray-300">
                            Nom
                          </Label>
                          <Input
                            id="lastName"
                            value={isEditing ? editedProfile.lastName : profile.lastName}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-gray-300">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={isEditing ? editedProfile.email : profile.email}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                            disabled={!isEditing}
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-gray-300">
                          Téléphone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            value={isEditing ? editedProfile.phone : profile.phone}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio" className="text-gray-300">
                          Biographie
                        </Label>
                        <Textarea
                          id="bio"
                          value={isEditing ? editedProfile.bio : profile.bio}
                          onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditing}
                          rows={3}
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Adresse</CardTitle>
                      <CardDescription className="text-gray-400">Votre adresse de résidence</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address" className="text-gray-300">
                          Adresse
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="address"
                            value={isEditing ? editedProfile.address : profile.address}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, address: e.target.value }))}
                            disabled={!isEditing}
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-gray-300">
                            Ville
                          </Label>
                          <Input
                            id="city"
                            value={isEditing ? editedProfile.city : profile.city}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, city: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-gray-300">
                            Pays
                          </Label>
                          <Input
                            id="country"
                            value={isEditing ? editedProfile.country : profile.country}
                            onChange={(e) => setEditedProfile((prev) => ({ ...prev, country: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              <ProfileStats user={profile} />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <ProfileActivity />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Préférences de notification</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choisissez comment vous souhaitez être notifié
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Notifications par email</p>
                        <p className="text-gray-400 text-sm">Recevez les notifications importantes par email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(value) => handleNotificationChange("email", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Notifications push</p>
                        <p className="text-gray-400 text-sm">Notifications en temps réel sur votre appareil</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(value) => handleNotificationChange("push", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Notifications SMS</p>
                        <p className="text-gray-400 text-sm">Recevez les alertes urgentes par SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(value) => handleNotificationChange("sms", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Communications marketing</p>
                        <p className="text-gray-400 text-sm">Nouveautés, conseils et offres spéciales</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(value) => handleNotificationChange("marketing", value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Paramètres de sécurité</CardTitle>
                  <CardDescription className="text-gray-400">
                    Protégez votre compte avec ces options de sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Authentification à deux facteurs</p>
                        <p className="text-gray-400 text-sm">Sécurisez votre compte avec un code supplémentaire</p>
                      </div>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(value) => handleSecurityChange("twoFactor", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Alertes de connexion</p>
                        <p className="text-gray-400 text-sm">Soyez notifié des nouvelles connexions</p>
                      </div>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(value) => handleSecurityChange("loginAlerts", value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Délai d'expiration de session</p>
                        <p className="text-gray-400 text-sm">Déconnexion automatique après inactivité</p>
                      </div>
                    </div>
                    <div className="ml-8">
                      <Input
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => handleSecurityChange("sessionTimeout", Number.parseInt(e.target.value))}
                        className="w-32 bg-gray-800/50 border-gray-700 text-white"
                        min="5"
                        max="120"
                      />
                      <p className="text-gray-500 text-xs mt-1">minutes</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Key className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

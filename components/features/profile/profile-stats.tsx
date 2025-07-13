"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Shield, Activity, TrendingUp, Users, FileText, Star } from "lucide-react"

interface ProfileStatsProps {
  user: {
    joinDate: Date
    lastLogin: string
    role: string
    status: string
    stats: {
      totalSessions: number
      averageSessionTime: string
      actionsPerformed: number
      favoriteFeature: string
    }
  }
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const stats = [
    {
      title: "Sessions totales",
      value: user.stats.totalSessions.toLocaleString(),
      description: "Connexions depuis l'inscription",
      icon: Activity,
      color: "text-blue-400",
    },
    {
      title: "Temps moyen par session",
      value: user.stats.averageSessionTime,
      description: "Durée moyenne d'utilisation",
      icon: Clock,
      color: "text-green-400",
    },
    {
      title: "Actions effectuées",
      value: user.stats.actionsPerformed.toLocaleString(),
      description: "Total des interactions",
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      title: "Fonctionnalité préférée",
      value: user.stats.favoriteFeature,
      description: "Module le plus utilisé",
      icon: Star,
      color: "text-yellow-400",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "suspended":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrateur":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "manager":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "utilisateur":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Aperçu du compte
          </CardTitle>
          <CardDescription className="text-gray-400">Informations sur votre compte et votre activité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Membre depuis</span>
              </div>
              <span className="text-white font-medium">
                {user.joinDate.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Dernière connexion</span>
              </div>
              <span className="text-white font-medium">{user.lastLogin}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Rôle</span>
              </div>
              <Badge variant="outline" className={getRoleColor(user.role)}>
                {user.role}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Statut</span>
              </div>
              <Badge variant="outline" className={getStatusColor(user.status)}>
                {user.status === "active" ? "Actif" : user.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity Summary */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            Résumé d'activité
          </CardTitle>
          <CardDescription className="text-gray-400">Vos actions récentes sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Demandes consultées</span>
              <span className="text-white font-medium">247</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Prestataires contactés</span>
              <span className="text-white font-medium">89</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Rapports générés</span>
              <span className="text-white font-medium">34</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">Paramètres modifiés</span>
              <span className="text-white font-medium">12</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

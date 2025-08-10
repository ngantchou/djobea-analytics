"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { User, FileText, AlertCircle, Clock, MessageSquare,DollarSign, CheckCircle, ArrowRight } from "lucide-react"
import { logger } from "@/lib/logger"
import { useRouter } from "next/navigation"

interface ActivityItem {
  id: string
  type: "request" | "provider" | "message" | "system"
  title: string
  description: string
  timestamp: string
  status?: "success" | "warning" | "error" | "info"
  user?: string
}
interface Activity {
  id: string
  type: "request" | "provider" | "payment" | "completion"
  title: string
  description: string
  user: string
  timestamp: string
  status: "success" | "pending" | "warning" | "error"
  metadata?: Record<string, any>
}
function getActivityIcon(type: string) {
  switch (type) {
    case "request":
      return <FileText className="h-4 w-4" />
    case "provider":
      return <User className="h-4 w-4" />
    case "message":
      return <MessageSquare className="h-4 w-4" />
    case "system":
      return <AlertCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getStatusBadge(status?: string) {
  switch (status) {
    case "success":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Succès
        </Badge>
      )
    case "warning":
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          Attention
        </Badge>
      )
    case "error":
      return <Badge variant="destructive">Erreur</Badge>
    case "info":
      return <Badge variant="secondary">Info</Badge>
    default:
      return null
  }
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}

export function RecentActivity() {
  const { data, loading, error } = useDashboardData()
  const router = useRouter()

  const handleActivityClick = (activity: Activity) => {
    logger.logUserAction("activity_click", { type: activity.type, id: activity.id })

    switch (activity.type) {
      case "request":
        router.push("/requests")
        break
      case "provider":
        router.push("/providers")
        break
      case "payment":
        router.push("/finances")
        break
      case "completion":
        router.push("/requests")
        break
      default:
        router.push("/analytics")
    }
  }

  const handleViewAllActivity = () => {
    logger.logUserAction("view_all_activity")
    router.push("/analytics")
  }
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "request":
        return FileText
      case "provider":
        return User
      case "payment":
        return DollarSign
      case "completion":
        return CheckCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "warning":
        return "text-orange-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-900/30 text-green-400 border-green-700"
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700"
      case "warning":
        return "bg-orange-900/30 text-orange-400 border-orange-700"
      case "error":
        return "bg-red-900/30 text-red-400 border-red-700"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-700"
    }
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivitySkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Erreur lors du chargement de l'activité</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Use real data from backend or fallback to mock data
  const activities: Activity[] = data?.recentActivity?.requests?.slice(0,4) || []


  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Activité Récente</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={handleViewAllActivity}>
          Voir tout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer group"
                onClick={() => handleActivityClick(activity)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={`${getStatusColor(activity.status)} bg-gray-700`}>
                    <Icon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                    <Badge className={`${getStatusBadge(activity.status)} text-xs`}>{activity.status}</Badge>
                  </div>

                  <p className="text-sm text-gray-400 mb-1">{activity.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Par {activity.user}</span>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )
          })}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucune activité récente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

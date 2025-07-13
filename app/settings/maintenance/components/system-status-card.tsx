import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SystemStatus } from "../hooks/use-maintenance-settings"

interface SystemStatusCardProps {
  systemStatus: SystemStatus
}

export function SystemStatusCard({ systemStatus }: SystemStatusCardProps) {
  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case "production":
        return "bg-red-500"
      case "staging":
        return "bg-yellow-500"
      case "development":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          État du Système
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{systemStatus.uptime}%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">v{systemStatus.version}</div>
            <div className="text-sm text-gray-400">Version actuelle</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{systemStatus.deploymentsToday}</div>
            <div className="text-sm text-gray-400">Déploiements aujourd'hui</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{systemStatus.healthScore}</div>
            <div className="text-sm text-gray-400">Score santé</div>
          </div>
          <div className="text-center">
            <Badge className={`${getEnvironmentColor(systemStatus.environment)} text-white`}>
              {systemStatus.environment}
            </Badge>
            <div className="text-sm text-gray-400 mt-1">Environnement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

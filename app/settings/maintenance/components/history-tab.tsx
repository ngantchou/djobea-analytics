import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DeploymentHistory } from "../hooks/use-maintenance-settings"

interface HistoryTabProps {
  deploymentHistory: DeploymentHistory[]
}

export function HistoryTab({ deploymentHistory }: HistoryTabProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      case "in-progress":
        return "text-blue-400"
      case "rolled-back":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />
      case "failed":
        return <XCircle className="w-4 h-4" />
      case "in-progress":
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case "rolled-back":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-white">Historique des Déploiements</CardTitle>
            <CardDescription>Suivi des déploiements récents</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {deploymentHistory.map((deployment) => (
            <div key={deployment.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`${getStatusColor(deployment.status)}`}>{getStatusIcon(deployment.status)}</div>
                  <div>
                    <h4 className="text-white font-medium">
                      Version {deployment.version} → {deployment.environment}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {new Date(deployment.timestamp).toLocaleString("fr-FR")} • Durée: {deployment.duration}min • Par:{" "}
                      {deployment.deployedBy}
                    </p>
                  </div>
                </div>
                <Badge className={`${getEnvironmentColor(deployment.environment)} text-white`}>
                  {deployment.environment}
                </Badge>
              </div>

              <div className="text-sm">
                <span className="text-gray-400">Changements:</span>
                <ul className="list-disc list-inside text-gray-300 mt-1 ml-4">
                  {deployment.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

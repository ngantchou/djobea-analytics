export interface DashboardStats {
  totalRequests: number
  successRate: number
  pendingRequests: number
  activeProviders: number
}

export interface ChartData {
  activity: {
    labels: string[]
    values: number[]
  }
  services: {
    labels: string[]
    values: number[]
  }
}

export interface ActivityData {
  requests: Array<{
    id: string
    client: string
    service: string
    location: string
    time: string
    status: string
    avatar: string
  }>
  alerts: Array<{
    id: string
    title: string
    description: string
    time: string
    type: string
    status: string
  }>
}

export interface DashboardData {
  stats: DashboardStats
  charts: ChartData
  activity: ActivityData
}

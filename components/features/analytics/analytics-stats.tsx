"use client"

import { TrendingUp, TrendingDown, Clock, Users, Star, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import styled from "styled-components"

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: string }>`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => {
      switch (props.variant) {
        case "success":
          return "var(--success-gradient)"
        case "warning":
          return "var(--warning-gradient)"
        case "danger":
          return "var(--danger-gradient)"
        default:
          return "var(--primary-gradient)"
      }
    }};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow);
  }
`

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`

const StatTitle = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const StatChange = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "positive",
})<{ positive?: boolean }>`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.positive ? "#4ade80" : "#f87171")};

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const StatDescription = styled.div`
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.5rem;
`

interface AnalyticsStatsProps {
  data?: {
    successRate: number
    responseTime: number
    totalRequests: number
    satisfaction: number
    trends: {
      successRate: number
      responseTime: number
      totalRequests: number
      satisfaction: number
    }
  }
  period: string
}

export function AnalyticsStats({ data, period }: AnalyticsStatsProps) {
  // Si pas de données, on affiche des indicateurs de chargement
  if (!data) {
    return (
      <StatsGrid>
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCard key={index} variant="default">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-3 w-24"></div>
              <div className="h-8 bg-gray-700 rounded mb-2 w-16"></div>
              <div className="h-3 bg-gray-700 rounded w-32"></div>
            </div>
          </StatCard>
        ))}
      </StatsGrid>
    )
  }

  const stats = [
    {
      title: "Taux de Réussite",
      value: `${data.successRate?.toFixed(1) || 0}%`,
      change: data.trends?.successRate || 0,
      icon: CheckCircle,
      variant: "success",
      description: "Performance globale du système",
    },
    {
      title: "Temps de Réponse",
      value: `${data.responseTime?.toFixed(1) || 0}m`,
      change: data.trends?.responseTime || 0,
      icon: Clock,
      variant: "warning", 
      description: "Temps moyen de réponse",
    },
    {
      title: "Demandes Totales",
      value: data.totalRequests || 0,
      change: data.trends?.totalRequests || 0,
      icon: Users,
      variant: "default",
      description: `Période: ${period}`,
    },
    {
      title: "Satisfaction Client",
      value: data.satisfaction?.toFixed(1) || "N/A",
      change: data.trends?.satisfaction || 0,
      icon: Star,
      variant: "success",
      description: "Note moyenne sur 5",
    },
  ]

  return (
    <StatsGrid>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          variant={stat.variant}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <StatHeader>
            <StatTitle>{stat.title}</StatTitle>
            <StatIcon>
              <stat.icon />
            </StatIcon>
          </StatHeader>

          <StatValue>{stat.value}</StatValue>

          <StatChange positive={stat.change > 0}>
            {stat.change > 0 ? <TrendingUp /> : <TrendingDown />}
            <span>
              {stat.change > 0 ? "+" : ""}
              {stat.change}%
            </span>
          </StatChange>

          <StatDescription>{stat.description}</StatDescription>
        </StatCard>
      ))}
    </StatsGrid>
  )
}

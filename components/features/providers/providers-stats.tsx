"use client"

import styled from "styled-components"
import { Users, CheckCircle, Clock, Star, TrendingUp, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { useProvidersData } from "@/hooks/use-providers-data"

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
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
        case "active":
          return "var(--success-gradient)"
        case "available":
          return "var(--warning-gradient)"
        case "rating":
          return "var(--secondary-gradient)"
        default:
          return "var(--primary-gradient)"
      }
    }};
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow);
  }
`

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 2rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 2rem;
    height: 2rem;
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

export function ProvidersStats() {
  const { data: stats, isLoading } = useProvidersData()

  if (isLoading) {
    return (
      <StatsContainer>
        {[1, 2, 3, 4].map((i) => (
          <StatCard key={i}>
            <div
              style={{
                height: "120px",
                background: "var(--glass-bg)",
                borderRadius: "8px",
                animation: "pulse 2s infinite",
              }}
            />
          </StatCard>
        ))}
      </StatsContainer>
    )
  }

  const statsData = [
    {
      title: "Total Prestataires",
      value: stats?.totalProviders || 23,
      change: "+2 ce mois",
      positive: true,
      icon: Users,
      variant: "default",
    },
    {
      title: "Actifs",
      value: stats?.activeProviders || 19,
      change: "82% du total",
      positive: true,
      icon: CheckCircle,
      variant: "active",
    },
    {
      title: "Disponibles",
      value: stats?.availableProviders || 12,
      change: "63% des actifs",
      positive: true,
      icon: Clock,
      variant: "available",
    },
    {
      title: "Note Moyenne",
      value: stats?.averageRating || 4.7,
      change: "+0.2 ce mois",
      positive: true,
      icon: Star,
      variant: "rating",
    },
  ]

  return (
    <StatsContainer>
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          variant={stat.variant}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <StatHeader>
            <StatTitle>{stat.title}</StatTitle>
            <StatIcon>
              <stat.icon />
            </StatIcon>
          </StatHeader>
          <StatValue>{stat.value}</StatValue>
          <StatChange positive={stat.positive}>
            {stat.positive ? <TrendingUp /> : <TrendingDown />}
            <span>{stat.change}</span>
          </StatChange>
        </StatCard>
      ))}
    </StatsContainer>
  )
}

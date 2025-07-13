"use client"

import styled from "styled-components"
import { Lightbulb, TrendingUp, AlertTriangle, Brain } from "lucide-react"
import { motion } from "framer-motion"

const InsightsSection = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  margin-bottom: 3rem;
  backdrop-filter: blur(10px);
`

const InsightsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const InsightsTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: #fbbf24;
  }
`

const AIStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--success-gradient);
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4ade80;
  font-size: 0.9rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse 2s infinite;
  }
`

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
`

const InsightCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== "type",
})<{ type: string }>`
  background: var(--glass-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow);
  }
`

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`

const InsightIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "type",
})<{ type: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => {
    switch (props.type) {
      case "positive":
        return "#4ade80"
      case "warning":
        return "#fbbf24"
      case "info":
        return "#3b82f6"
      default:
        return "#94a3b8"
    }
  }};

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const InsightContent = styled.div`
  flex: 1;

  h4 {
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
`

const ConfidenceBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;

  .label {
    color: var(--text-secondary);
    font-size: 0.8rem;
    min-width: 80px;
  }

  .bar {
    flex: 1;
    height: 6px;
    background: var(--glass-bg);
    border-radius: 3px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--primary-gradient);
    border-radius: 3px;
    transition: width 1s ease;
  }

  .value {
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }
`

interface AnalyticsInsightsProps {
  data?: Array<{
    type: "positive" | "warning" | "info"
    icon: string
    title: string
    description: string
    confidence: number
  }>
}

export function AnalyticsInsights({ data }: AnalyticsInsightsProps) {
  const insights = data || [
    {
      type: "positive" as const,
      icon: "trending-up",
      title: "Performance Excellente",
      description:
        "Le taux de réussite a augmenté de 2.3% cette semaine. Les prestataires de Bonamoussadi Centre sont particulièrement performants.",
      confidence: 95,
    },
    {
      type: "warning" as const,
      icon: "alert-triangle",
      title: "Zone à Optimiser",
      description:
        "Les demandes de plomberie à Bonamoussadi Sud ont un temps de réponse 23% plus élevé que la moyenne.",
      confidence: 87,
    },
    {
      type: "info" as const,
      icon: "brain",
      title: "IA Optimisée",
      description: "L'algorithme de matching a été optimisé : +8% de correspondances réussies cette semaine.",
      confidence: 92,
    },
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "trending-up":
        return TrendingUp
      case "alert-triangle":
        return AlertTriangle
      case "brain":
        return Brain
      default:
        return Lightbulb
    }
  }

  return (
    <InsightsSection>
      <InsightsHeader>
        <InsightsTitle>
          <Lightbulb />
          Insights IA
        </InsightsTitle>
        <AIStatus>
          <StatusBadge>
            <Brain />
            Intelligence Artificielle
          </StatusBadge>
          <LiveIndicator>
            <div className="dot" />
            Temps Réel
          </LiveIndicator>
        </AIStatus>
      </InsightsHeader>

      <InsightsGrid>
        {insights.map((insight, index) => {
          const IconComponent = getIcon(insight.icon)
          return (
            <InsightCard
              key={index}
              type={insight.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <InsightHeader>
                <InsightIcon type={insight.type}>
                  <IconComponent />
                </InsightIcon>
                <InsightContent>
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                  <ConfidenceBar>
                    <span className="label">Confiance IA:</span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${insight.confidence}%` }} />
                    </div>
                    <span className="value">{insight.confidence}%</span>
                  </ConfidenceBar>
                </InsightContent>
              </InsightHeader>
            </InsightCard>
          )
        })}
      </InsightsGrid>
    </InsightsSection>
  )
}

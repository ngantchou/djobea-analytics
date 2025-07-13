"use client"

import styled from "styled-components"
import { Trophy, Star, Clock, Medal } from "lucide-react"
import { motion } from "framer-motion"

const LeaderboardSection = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  margin-bottom: 3rem;
  backdrop-filter: blur(10px);
`

const LeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const LeaderboardTitle = styled.h3`
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

const UpdateIndicator = styled.div`
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

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const LeaderboardItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== "rank",
})<{ rank: number }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${(props) => {
      switch (props.rank) {
        case 1:
          return "#fbbf24"
        case 2:
          return "#94a3b8"
        case 3:
          return "#f97316"
        default:
          return "var(--primary-gradient)"
      }
    }};
  }

  &:hover {
    transform: translateX(8px);
    box-shadow: var(--shadow);
  }
`

const RankBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "rank",
})<{ rank: number }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.rank) {
      case 1:
        return "linear-gradient(135deg, #fbbf24, #f59e0b)"
      case 2:
        return "linear-gradient(135deg, #94a3b8, #64748b)"
      case 3:
        return "linear-gradient(135deg, #f97316, #ea580c)"
      default:
        return "var(--glass-bg)"
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  border: 2px solid ${(props) => (props.rank <= 3 ? "rgba(255, 255, 255, 0.3)" : "var(--border-color)")};
`

const ProviderAvatar = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
`

const ProviderInfo = styled.div`
  flex: 1;

  h4 {
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      svg {
        width: 0.8rem;
        height: 0.8rem;
      }
    }
  }
`

const ScoreBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  .score {
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .label {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
`

const RankIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "rank",
})<{ rank: number }>`
  font-size: 1.5rem;
  
  ${(props) => {
    switch (props.rank) {
      case 1:
        return "color: #fbbf24;"
      case 2:
        return "color: #94a3b8;"
      case 3:
        return "color: #f97316;"
      default:
        return "color: var(--text-secondary);"
    }
  }}
`

interface AnalyticsLeaderboardProps {
  data?: Array<{
    id: string
    name: string
    avatar: string
    missions: number
    rating: number
    responseTime: number
    score: number
  }>
}

export function AnalyticsLeaderboard({ data }: AnalyticsLeaderboardProps) {
  const providers = data || [
    {
      id: "1",
      name: "Jean-Baptiste Électricité",
      avatar: "JB",
      missions: 45,
      rating: 4.9,
      responseTime: 12,
      score: 98.2,
    },
    {
      id: "2",
      name: "Marie Réparation",
      avatar: "MR",
      missions: 23,
      rating: 4.8,
      responseTime: 8,
      score: 96.7,
    },
    {
      id: "3",
      name: "Paul Plomberie",
      avatar: "PP",
      missions: 32,
      rating: 4.6,
      responseTime: 18,
      score: 94.1,
    },
    {
      id: "4",
      name: "Alain Maintenance",
      avatar: "AM",
      missions: 18,
      rating: 4.5,
      responseTime: 25,
      score: 91.8,
    },
    {
      id: "5",
      name: "Francis Kono",
      avatar: "FK",
      missions: 12,
      rating: 3.2,
      responseTime: 45,
      score: 67.3,
    },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "👑"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return rank
    }
  }

  return (
    <LeaderboardSection>
      <LeaderboardHeader>
        <LeaderboardTitle>
          <Trophy />
          Top Prestataires
        </LeaderboardTitle>
        <UpdateIndicator>
          <div className="dot" />
          Mise à jour continue
        </UpdateIndicator>
      </LeaderboardHeader>

      <LeaderboardList>
        {providers.map((provider, index) => (
          <LeaderboardItem
            key={provider.id}
            rank={index + 1}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <RankBadge rank={index + 1}>
              <RankIcon rank={index + 1}>{getRankIcon(index + 1)}</RankIcon>
            </RankBadge>

            <ProviderAvatar>{provider.avatar}</ProviderAvatar>

            <ProviderInfo>
              <h4>{provider.name}</h4>
              <div className="stats">
                <div className="stat">
                  <Medal />
                  <span>{provider.missions} missions</span>
                </div>
                <div className="stat">
                  <Star />
                  <span>{provider.rating}</span>
                </div>
                <div className="stat">
                  <Clock />
                  <span>{provider.responseTime}min</span>
                </div>
              </div>
            </ProviderInfo>

            <ScoreBadge>
              <div className="score">{provider.score}%</div>
              <div className="label">Score</div>
            </ScoreBadge>
          </LeaderboardItem>
        ))}
      </LeaderboardList>
    </LeaderboardSection>
  )
}

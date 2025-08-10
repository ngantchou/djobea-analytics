"use client"

import styled from "styled-components"
import { motion } from "framer-motion"
import {
  Star,
  MapPin,
  Phone,
  TrendingUp,
  Eye,
  Edit,
  MessageCircle,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"
import type { Provider } from "@/types/providers"

const Card = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const ProviderInfo = styled.div`
  flex: 1;

  h3 {
    color: var(--text-primary);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .phone {
    color: var(--text-secondary);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 0.8rem;
      height: 0.8rem;
    }
  }
`

const StatusBadge = styled.div<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${(props) => {
    switch (props.status) {
      case "excellent":
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        `
      case "good":
        return `
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        `
      case "warning":
        return `
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        `
      case "danger":
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        `
      default:
        return `
          background: rgba(156, 163, 175, 0.1);
          color: #9ca3af;
          border: 1px solid rgba(156, 163, 175, 0.2);
        `
    }
  }}

  svg {
    width: 0.8rem;
    height: 0.8rem;
  }
`

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  .stars {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    svg {
      width: 1rem;
      height: 1rem;
      fill: #fbbf24;
      color: #fbbf24;
    }
  }

  .rating-text {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .reviews {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
`

const Services = styled.div`
  margin-bottom: 1rem;

  .services-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .service-tag {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .label {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
  }
`

const Coverage = styled.div`
  margin-bottom: 1rem;

  .coverage-list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.8rem;

    svg {
      width: 0.8rem;
      height: 0.8rem;
    }
  }

  .label {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
  }
`

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: 8px;

  .stat {
    text-align: center;

    .value {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .label {
      color: var(--text-secondary);
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;

  button {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-size: 0.8rem;

    svg {
      width: 0.8rem;
      height: 0.8rem;
    }

    &:hover {
      background: var(--hover-bg);
      transform: translateY(-1px);
    }

    &.primary {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);

      &:hover {
        background: var(--primary-hover);
      }
    }

    &.danger {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);

      &:hover {
        background: rgba(239, 68, 68, 0.1);
      }
    }
  }
`

interface ProviderCardProps {
  provider: Provider
  onView: () => void
  onEdit: () => void
  onContact: () => void
  onDelete: () => void
}

export function ProviderCard({ provider, onView, onEdit, onContact, onDelete }: ProviderCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle />
      case "good":
        return <TrendingUp />
      case "warning":
        return <AlertCircle />
      case "danger":
        return <XCircle />
      default:
        return <AlertCircle />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "excellent":
        return "Excellent"
      case "good":
        return "Bon"
      case "warning":
        return "Attention"
      case "danger":
        return "Critique"
      default:
        return "Inconnu"
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" style={{ opacity: 0.5 }} />)
    }

    return stars
  }

  return (
    <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
      <CardHeader>
        <ProviderInfo>
          <h3>{provider.name}</h3>
          <div className="phone">
            <Phone />
            {provider.phone}
          </div>
        </ProviderInfo>
        <StatusBadge status={provider.performanceStatus}>
          {getStatusIcon(provider.performanceStatus)}
          {getStatusText(provider.performanceStatus)}
        </StatusBadge>
      </CardHeader>

      <Rating>
        <div className="stars">{renderStars(provider.rating)}</div>
        <span className="rating-text">{provider.rating.toFixed(1)}</span>
        <span className="reviews">({provider.reviewCount} avis)</span>
      </Rating>

      <Services>
        <div className="label">Services</div>
        <div className="services-list">
          {provider?.services.slice(0, 3).map((service, index) => (
            <span key={index} className="service-tag">
              {service}
            </span>
          ))}
          {provider?.services.length > 3 && <span className="service-tag">+{provider.services.length - 3}</span>}
        </div>
      </Services>

      <Coverage>
        <div className="label">Zones de couverture</div>
        <div className="coverage-list">
          <MapPin />
          {provider.coverageAreas.slice(0, 2).join(", ")}
          {provider.coverageAreas.length > 2 && ` +${provider.coverageAreas.length - 2}`}
        </div>
      </Coverage>

      <Stats>
        <div className="stat">
          <div className="value">{provider.totalMissions}</div>
          <div className="label">Missions</div>
        </div>
        <div className="stat">
          <div className="value">{provider.successRate}%</div>
          <div className="label">Succès</div>
        </div>
        <div className="stat">
          <div className="value">{provider.responseTime}min</div>
          <div className="label">Réponse</div>
        </div>
      </Stats>

      <Actions>
        <button className="primary" onClick={onView}>
          <Eye />
          View
        </button>
        <button onClick={onEdit}>
          <Edit />
          Edit
        </button>
        <button className="danger" onClick={onDelete}>
          <Trash2 />
          Delete
        </button>
        <button onClick={onContact}>
          <MessageCircle />
          Contact
        </button>
      </Actions>
    </Card>
  )
}

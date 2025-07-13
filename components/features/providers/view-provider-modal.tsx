"use client"

import styled from "styled-components"
import { X, Star, MapPin, Phone, Edit, Ban, Mail, Calendar, Award, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useProvidersData } from "@/hooks/use-providers-data"
import { useNotificationStore } from "@/store/use-notification-store"

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const ModalContent = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;

  &:hover {
    color: var(--text-primary);
    background: var(--glass-bg);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const ProviderDetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`

const ProviderAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  flex-shrink: 0;
`

const ProviderInfo = styled.div`
  flex: 1;

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
    color: var(--text-primary);
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);

      svg {
        width: 1rem;
        height: 1rem;
      }
    }
  }
`

const ProviderRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffc107;
  margin-bottom: 1rem;

  svg {
    width: 1.2rem;
    height: 1.2rem;
    fill: currentColor;
  }

  .rating-value {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.1rem;
  }

  .rating-count {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`

const StatusBadges = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const StatusBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${(props) => {
    switch (props.variant) {
      case "active":
        return "rgba(34, 197, 94, 0.2)"
      case "inactive":
        return "rgba(239, 68, 68, 0.2)"
      case "available":
        return "rgba(34, 197, 94, 0.2)"
      case "busy":
        return "rgba(251, 191, 36, 0.2)"
      default:
        return "rgba(156, 163, 175, 0.2)"
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "active":
        return "#22c55e"
      case "inactive":
        return "#ef4444"
      case "available":
        return "#22c55e"
      case "busy":
        return "#fbbf24"
      default:
        return "#9ca3af"
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.variant) {
      case "active":
        return "rgba(34, 197, 94, 0.3)"
      case "inactive":
        return "rgba(239, 68, 68, 0.3)"
      case "available":
        return "rgba(34, 197, 94, 0.3)"
      case "busy":
        return "rgba(251, 191, 36, 0.3)"
      default:
        return "rgba(156, 163, 175, 0.3)"
    }
  }};
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const DetailSection = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "fullWidth",
})<{ fullWidth?: boolean }>`
  background: var(--glass-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  ${(props) => props.fullWidth && "grid-column: 1 / -1;"}

  h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 1.2rem;
      height: 1.2rem;
    }
  }
`

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  span {
    color: var(--text-primary);
    font-weight: 500;
  }
`

const PerformanceStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`

const PerfStat = styled.div`
  text-align: center;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);

  .perf-value {
    font-size: 1.8rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }

  .perf-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`

const ServicesDetail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const ServiceDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.9rem;
`

const CoverageDetail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const CoverageDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-primary);

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const DetailActions = styled.div`
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
`

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: string }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-gradient);
          color: white;
        `
      case "danger":
        return `
          background: var(--danger-gradient);
          color: white;
        `
      default:
        return `
          background: var(--glass-bg);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        `
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

interface ViewProviderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string | null
}

export function ViewProviderModal({ isOpen, onClose, providerId }: ViewProviderModalProps) {
  const { data: providers } = useProvidersData()
  const { addNotification } = useNotificationStore()

  const provider = providers?.find((p) => p.id === providerId)

  if (!provider) {
    return null
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} fill="currentColor" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" fill="currentColor" style={{ clipPath: "inset(0 50% 0 0)" }} />)
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} />)
    }

    return stars
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleContact = async () => {
    try {
      const response = await fetch(`/api/providers/${providerId}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "call",
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          type: "info",
          title: "Contact initié",
          message: `Contact avec ${provider.name}`,
          timestamp: new Date(),
          read: false,
        })
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible de contacter le prestataire",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  const handleEdit = () => {
    onClose()
    addNotification({
      id: Date.now().toString(),
      type: "info",
      title: "Modification",
      message: "Ouverture du formulaire de modification",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleToggleStatus = async () => {
    try {
      const newStatus = provider.status === "active" ? "inactive" : "active"
      const response = await fetch(`/api/providers/${providerId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          type: "success",
          title: "Statut mis à jour",
          message: `Prestataire ${newStatus === "active" ? "activé" : "désactivé"}`,
          timestamp: new Date(),
          read: false,
        })
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible de modifier le statut",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>Détails du Prestataire</ModalTitle>
              <CloseBtn onClick={onClose}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <ProviderDetailHeader>
              <ProviderAvatar>{getInitials(provider.name)}</ProviderAvatar>
              <ProviderInfo>
                <h3>{provider.name}</h3>
                <div className="contact-info">
                  <div className="contact-item">
                    <Phone />
                    {provider.phone}
                  </div>
                  {provider.email && (
                    <div className="contact-item">
                      <Mail />
                      {provider.email}
                    </div>
                  )}
                </div>
                <ProviderRating>
                  {renderStars(provider.rating)}
                  <span className="rating-value">{provider.rating.toFixed(1)}</span>
                  <span className="rating-count">({provider.reviewCount} avis)</span>
                </ProviderRating>
                <StatusBadges>
                  <StatusBadge variant={provider.status}>
                    {provider.status === "active" ? "✓" : "✗"} {provider.status === "active" ? "Actif" : "Inactif"}
                  </StatusBadge>
                  <StatusBadge variant={provider.availability}>
                    {provider.availability === "available" ? "⏰" : "⚙️"}{" "}
                    {provider.availability === "available" ? "Disponible" : "Occupé"}
                  </StatusBadge>
                </StatusBadges>
              </ProviderInfo>
            </ProviderDetailHeader>

            <DetailGrid>
              <DetailSection>
                <h4>
                  <Calendar />
                  Informations générales
                </h4>
                <DetailItem>
                  <label>Expérience:</label>
                  <span>{provider.experience || "Non renseigné"} ans</span>
                </DetailItem>
                <DetailItem>
                  <label>Tarif horaire:</label>
                  <span>{provider.hourlyRate?.toLocaleString() || "Non renseigné"} FCFA</span>
                </DetailItem>
                <DetailItem>
                  <label>Date d'inscription:</label>
                  <span>{provider.joinDate || "Non renseigné"}</span>
                </DetailItem>
                <DetailItem>
                  <label>Temps de réponse:</label>
                  <span>{provider.responseTime} minutes</span>
                </DetailItem>
              </DetailSection>

              <DetailSection>
                <h4>
                  <TrendingUp />
                  Statistiques de performance
                </h4>
                <PerformanceStats>
                  <PerfStat>
                    <div className="perf-value">{provider.totalMissions}</div>
                    <div className="perf-label">Missions totales</div>
                  </PerfStat>
                  <PerfStat>
                    <div className="perf-value">{provider.successRate}%</div>
                    <div className="perf-label">Taux de réussite</div>
                  </PerfStat>
                  <PerfStat>
                    <div className="perf-value">{provider.responseTime}min</div>
                    <div className="perf-label">Temps de réponse</div>
                  </PerfStat>
                  <PerfStat>
                    <div className="perf-value">{provider.acceptanceRate || 90}%</div>
                    <div className="perf-label">Taux d'acceptation</div>
                  </PerfStat>
                </PerformanceStats>
              </DetailSection>

              <DetailSection>
                <h4>
                  <Award />
                  Spécialités
                </h4>
                <ServicesDetail>
                  {provider.services.map((service, index) => (
                    <ServiceDetail key={index}>
                      <span>{service}</span>
                    </ServiceDetail>
                  ))}
                </ServicesDetail>
              </DetailSection>

              <DetailSection>
                <h4>
                  <MapPin />
                  Zones de couverture
                </h4>
                <CoverageDetail>
                  {provider.coverageAreas.map((area, index) => (
                    <CoverageDetailItem key={index}>
                      <MapPin />
                      <span>{area}</span>
                    </CoverageDetailItem>
                  ))}
                </CoverageDetail>
              </DetailSection>

              {provider.description && (
                <DetailSection fullWidth>
                  <h4>Description</h4>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{provider.description}</p>
                </DetailSection>
              )}
            </DetailGrid>

            <DetailActions>
              <Button onClick={handleContact}>
                <Phone />
                Contacter
              </Button>
              <Button variant="primary" onClick={handleEdit}>
                <Edit />
                Modifier
              </Button>
              <Button variant="danger" onClick={handleToggleStatus}>
                <Ban />
                {provider.status === "active" ? "Désactiver" : "Activer"}
              </Button>
            </DetailActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  )
}

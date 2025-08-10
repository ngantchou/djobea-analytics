"use client"

import { useState, useEffect } from "react"
import { X, Star, Search, MapPin, Clock, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"
import { useNotificationStore } from "@/store/use-notification-store"
import { providersService } from "@/lib/services/providers-service"
import { RequestsService } from "@/lib/services/requests-service"
import type { Provider } from "@/lib/services/providers-service"

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalContent = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
`

const ServiceTypeIndicator = styled.div`
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
  }
`

const ModalBody = styled.div`
  padding: 2rem;
`

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: var(--text-secondary);
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`

const ProvidersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
`

const ProviderCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>`
  background: var(--glass-bg);
  border: 2px solid ${(props) => (props.selected ? "var(--primary-color)" : "var(--border-color)")};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  ${(props) => props.selected && `
    background: rgba(102, 126, 234, 0.1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  `}

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${(props) => props.selected && `
    &::before {
      content: "✓";
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 24px;
      height: 24px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }
  `}
`

const ProviderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const ProviderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ProviderAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
`

const ProviderDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const ProviderName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
`

const ProviderSpecialty = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`

const ProviderZone = styled.div`
  color: var(--text-secondary);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const ProviderBadges = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
`

const ProviderScore = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--success-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`

const AvailabilityBadge = styled.div<{ available: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.available ? 'var(--success-gradient)' : 'var(--warning-gradient)'};
  color: white;
`

const ProviderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
`

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ProviderMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ModalFooter = styled.div`
  padding: 2rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})<{ variant?: string }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-gradient);
          color: white;
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `
      default:
        return `
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          &:hover:not(:disabled) {
            background: var(--glass-bg);
          }
        `
    }
  }}
`

interface AssignRequestModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  serviceType: string
  location?: string
  onAssignSuccess?: () => void
}

export function AssignRequestModal({ 
  isOpen, 
  onClose, 
  requestId, 
  serviceType, 
  location,
  onAssignSuccess 
}: AssignRequestModalProps) {
  const { addNotification } = useNotificationStore()
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProviders()
      setSelectedProvider(null)
      setSearchTerm("")
    }
  }, [isOpen, serviceType, location]) // Added location to dependencies

  useEffect(() => {
    const filtered = providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        provider.coverageAreas.some(area => 
          area.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    setFilteredProviders(filtered)
  }, [providers, searchTerm])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      // Get available providers for this service type
      const availableProviders = await providersService.getAvailableProviders({
        serviceType: serviceType,
        location: location,
        limit: 20,
      })

      // Also get general providers that match the service type
      const allProvidersResponse = await providersService.getProviders({
        search: serviceType,
        status: "active",
        limit: 50
      })

      // Combine and deduplicate
      const combined = [...availableProviders, ...allProvidersResponse.providers]
      const uniqueProviders = combined.filter((provider, index, self) => 
        index === self.findIndex(p => p.id === provider.id)
      )

      // Filter providers that offer the required service
      const relevantProviders = uniqueProviders.filter(provider =>
        provider.services.some(service => 
          service.toLowerCase().includes(serviceType.toLowerCase())
        )
      )

      setProviders(relevantProviders)
      setFilteredProviders(relevantProviders)
    } catch (error) {
      console.error("Error fetching providers:", error)
      addNotification({
        id: Date.now().toString(),
        message: "Erreur lors du chargement des prestataires",
        type: "error",
        timestamp: new Date(),
        read: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedProvider) return

    setAssigning(true)
    try {
      await RequestsService.assignRequest(requestId, {
        providerId: selectedProvider.id,
        notes: `Assigné à ${selectedProvider.name} pour ${serviceType}`,
      })

      addNotification({
        id: Date.now().toString(),
        message: `Demande #${requestId} assignée à ${selectedProvider.name}`,
        type: "success",
        timestamp: new Date(),
        read: false,
      })

      onAssignSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error assigning request:", error)
      addNotification({
        id: Date.now().toString(),
        message: "Erreur lors de l'assignation",
        type: "error",
        timestamp: new Date(),
        read: false,
      })
    } finally {
      setAssigning(false)
    }
  }

  const getProviderAvatar = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Disponible"
      case "busy":
        return "Occupé"
      case "offline":
        return "Hors ligne"
      default:
        return "Inconnu"
    }
  }

  const isProviderAvailable = (availability: string) => {
    return availability === "available"
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <ModalOverlay 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <div>
              <ModalTitle>Assigner un prestataire</ModalTitle>
              <ServiceTypeIndicator>{serviceType}</ServiceTypeIndicator>
            </div>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <SearchContainer>
              <SearchIcon>
                <Search size={20} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Rechercher par nom, service ou zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>

            {loading ? (
              <LoadingState>
                <div>Chargement des prestataires disponibles...</div>
              </LoadingState>
            ) : filteredProviders.length === 0 ? (
              <EmptyState>
                <div>Aucun prestataire trouvé pour "{serviceType}"</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Essayez de modifier votre recherche ou contactez l'administrateur
                </div>
              </EmptyState>
            ) : (
              <ProvidersList>
                {filteredProviders.map((provider) => {
                  const isSelected = selectedProvider?.id === provider.id
                  
                  return (
                    <ProviderCard
                      key={provider.id}
                      selected={isSelected}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedProvider(provider)
                      }}
                    >
                    <ProviderHeader>
                      <ProviderInfo>
                        <ProviderAvatar>
                          {getProviderAvatar(provider.name)}
                        </ProviderAvatar>
                        <ProviderDetails>
                          <ProviderName>{provider.name}</ProviderName>
                          <ProviderSpecialty>
                            {provider.services.slice(0, 2).join(", ")}
                            {provider.services.length > 2 && ` (+${provider.services.length - 2})`}
                          </ProviderSpecialty>
                          <ProviderZone>
                            <MapPin size={12} />
                            {provider.coverageAreas.slice(0, 2).join(", ")}
                            {provider.coverageAreas.length > 2 && "..."}
                          </ProviderZone>
                        </ProviderDetails>
                      </ProviderInfo>
                      <ProviderBadges>
                        <ProviderScore>
                          <Star size={16} />
                          {provider.rating || 0}
                        </ProviderScore>
                        <AvailabilityBadge available={isProviderAvailable(provider.availability)}>
                          {getAvailabilityText(provider.availability)}
                        </AvailabilityBadge>
                      </ProviderBadges>
                    </ProviderHeader>

                    <ProviderStats>
                      <StatItem>
                        <StatValue>{provider.completedJobs || 0}</StatValue>
                        <StatLabel>Missions</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{provider.successRate || 0}%</StatValue>
                        <StatLabel>Succès</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{provider.responseTime || 0}h</StatValue>
                        <StatLabel>Réponse</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{provider.hourlyRate || 0}</StatValue>
                        <StatLabel>FCFA/h</StatLabel>
                      </StatItem>
                    </ProviderStats>

                    <ProviderMeta>
                      <MetaItem>
                        <User size={14} />
                        {provider.experience || 0} ans d'expérience
                      </MetaItem>
                      <MetaItem>
                        <Clock size={14} />
                        Dernière activité: {provider.lastActivity || "Inconnue"}
                      </MetaItem>
                    </ProviderMeta>
                                      </ProviderCard>
                  )
                })}
              </ProvidersList>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} disabled={assigning}>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAssign} 
              // disabled={!selectedProvider || assigning || (selectedProvider && !isProviderAvailable(selectedProvider.availability))}
            >
              {assigning ? "Assignation..." : selectedProvider ? `Assigner à ${selectedProvider.name}` : "Sélectionner un prestataire"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  )
}
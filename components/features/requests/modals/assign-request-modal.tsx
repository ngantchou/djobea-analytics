"use client"

import { useState, useEffect } from "react"
import { X, Star, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"
import { useNotificationStore } from "@/store/use-notification-store"

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
  max-width: 700px;
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
`

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
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

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
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
`

const ProviderSpecialty = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
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

const ProviderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-gradient);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `
      default:
        return `
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          &:hover {
            background: var(--glass-bg);
          }
        `
    }
  }}
`

interface Provider {
  id: string
  name: string
  specialty: string
  rating: number
  completedJobs: number
  distance: string
  responseTime: string
  avatar: string
  score: number
}

interface AssignRequestModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  serviceType: string
}

export function AssignRequestModal({ isOpen, onClose, requestId, serviceType }: AssignRequestModalProps) {
  const { addNotification } = useNotificationStore()
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProviders()
    }
  }, [isOpen, serviceType])

  useEffect(() => {
    const filtered = providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProviders(filtered)
  }, [providers, searchTerm])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/providers/available?service=${serviceType}`)
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
        setFilteredProviders(data)
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      // Mock data for demo
      const mockProviders: Provider[] = [
        {
          id: "1",
          name: "Jean Dupont",
          specialty: "Plomberie",
          rating: 4.8,
          completedJobs: 156,
          distance: "2.3 km",
          responseTime: "15 min",
          avatar: "JD",
          score: 95,
        },
        {
          id: "2",
          name: "Marie Martin",
          specialty: "Électricité",
          rating: 4.9,
          completedJobs: 203,
          distance: "1.8 km",
          responseTime: "12 min",
          avatar: "MM",
          score: 98,
        },
        {
          id: "3",
          name: "Pierre Durand",
          specialty: "Plomberie",
          rating: 4.6,
          completedJobs: 89,
          distance: "3.1 km",
          responseTime: "20 min",
          avatar: "PD",
          score: 87,
        },
      ]
      setProviders(mockProviders)
      setFilteredProviders(mockProviders)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedProvider) return

    setLoading(true)
    try {
      const response = await fetch(`/api/requests/${requestId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId: selectedProvider,
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          message: `Demande #${requestId} assignée avec succès`,
          type: "success",
          timestamp: new Date(),
          read: false,
        })
        onClose()
      } else {
        throw new Error("Failed to assign request")
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        message: "Erreur lors de l'assignation",
        type: "error",
        timestamp: new Date(),
        read: false,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <ModalContent
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>Assigner un prestataire</ModalTitle>
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
                placeholder="Rechercher un prestataire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>

            {loading ? (
              <div>Chargement des prestataires...</div>
            ) : (
              <ProvidersList>
                {filteredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    selected={selectedProvider === provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <ProviderHeader>
                      <ProviderInfo>
                        <ProviderAvatar>{provider.avatar}</ProviderAvatar>
                        <ProviderDetails>
                          <ProviderName>{provider.name}</ProviderName>
                          <ProviderSpecialty>{provider.specialty}</ProviderSpecialty>
                        </ProviderDetails>
                      </ProviderInfo>
                      <ProviderScore>
                        <Star size={16} />
                        {provider.score}%
                      </ProviderScore>
                    </ProviderHeader>

                    <ProviderStats>
                      <StatItem>
                        <StatValue>{provider.rating}</StatValue>
                        <StatLabel>Note</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{provider.completedJobs}</StatValue>
                        <StatLabel>Missions</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{provider.distance}</StatValue>
                        <StatLabel>Distance</StatLabel>
                      </StatItem>
                    </ProviderStats>
                  </ProviderCard>
                ))}
              </ProvidersList>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Annuler</Button>
            <Button variant="primary" onClick={handleAssign} disabled={!selectedProvider || loading}>
              {loading ? "Assignation..." : "Assigner"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  )
}

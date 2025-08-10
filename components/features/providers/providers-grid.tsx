"use client"
import styled from "styled-components"
import { motion } from "framer-motion"
import { ProviderCard } from "./provider-card"
import type { Provider } from "@/types/providers"

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
  }
`

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`

const LoadingCard = styled(motion.div)`
  height: 300px;
  background: var(--glass-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`

interface ProvidersGridProps {
  providers: Provider[]
  loading: boolean
  onView: (providerId: string) => void
  onEdit: (providerId: string) => void
  onContact: (providerId: string) => void
  onDelete: (providerId: string, providerName: string) => void
}

export function ProvidersGrid({ providers, loading, onView, onEdit, onContact, onDelete }: ProvidersGridProps) {
  if (loading) {
    return (
      <LoadingGrid>
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </LoadingGrid>
    )
  }

  if (providers.length === 0) {
    return (
      <EmptyState initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3>Aucun prestataire trouvé</h3>
        <p>Aucun prestataire ne correspond aux critères de recherche sélectionnés.</p>
      </EmptyState>
    )
  }

  return (
    <GridContainer>
      {providers.map((provider, index) => (
        <motion.div
          key={provider.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProviderCard
            provider={provider}
            onView={() => onView(provider.id)}
            onEdit={() => onEdit(provider.id)}
            onContact={() => onContact(provider.id)}
            onDelete={() => onDelete(provider.id, provider.name)}
          />
        </motion.div>
      ))}
    </GridContainer>
  )
}

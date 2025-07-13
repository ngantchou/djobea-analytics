"use client"

import styled from "styled-components"
import { Download, RefreshCw, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useNotificationStore } from "@/store/use-notification-store"

const QuickActions = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ActionFab = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--glow);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

interface ProvidersQuickActionsProps {
  onAddProvider: () => void
}

export function ProvidersQuickActions({ onAddProvider }: ProvidersQuickActionsProps) {
  const { addNotification } = useNotificationStore()

  const handleExport = () => {
    // Simulate export functionality
    addNotification({
      id: Date.now().toString(),
      type: "success",
      title: "Export réussi",
      message: "Les données des prestataires ont été exportées avec succès",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleRefresh = () => {
    // Simulate refresh functionality
    addNotification({
      id: Date.now().toString(),
      type: "info",
      title: "Actualisation",
      message: "Les données des prestataires ont été actualisées",
      timestamp: new Date(),
      read: false,
    })
  }

  const actions = [
    {
      icon: Download,
      onClick: handleExport,
      title: "Exporter les données",
    },
    {
      icon: RefreshCw,
      onClick: handleRefresh,
      title: "Actualiser",
    },
    {
      icon: Plus,
      onClick: onAddProvider,
      title: "Ajouter prestataire",
    },
  ]

  return (
    <QuickActions>
      {actions.map((action, index) => (
        <ActionFab
          key={index}
          onClick={action.onClick}
          title={action.title}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <action.icon />
        </ActionFab>
      ))}
    </QuickActions>
  )
}

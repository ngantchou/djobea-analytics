"use client"

import { Plus, Download, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import styled from "styled-components"
import { useNotificationStore } from "@/store/use-notification-store"

const QuickActionsContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
`

const ActionButton = styled(motion.button)`
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
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--glow);
  }
`

const IconWrapper = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

export function QuickActions() {
  const { addNotification } = useNotificationStore()

  const handleAction = (action: string) => {
    addNotification({
      id: Date.now().toString(),
      message: `Action: ${action}`,
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const actions = [
    { icon: Download, title: "Exporter les données", action: "Exporter les données" },
    { icon: RefreshCw, title: "Actualiser", action: "Actualiser" },
    { icon: Plus, title: "Créer demande manuelle", action: "Créer demande manuelle" },
  ]

  return (
    <QuickActionsContainer>
      {actions.map((action, index) => (
        <ActionButton
          key={action.title}
          title={action.title}
          onClick={() => handleAction(action.action)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconWrapper>
            <action.icon />
          </IconWrapper>
        </ActionButton>
      ))}
    </QuickActionsContainer>
  )
}

"use client"

import styled from "styled-components"
import { X, AlertTriangle, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  max-width: 500px;
  width: 100%;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #f44336;
  }
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

const WarningMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #f44336;
  font-size: 0.9rem;
  line-height: 1.5;
`

const ProviderInfo = styled.div`
  background: var(--glass-bg);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);

  h4 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

interface DeleteProviderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string | null
  providerName: string
}

export function DeleteProviderModal({ isOpen, onClose, providerId, providerName }: DeleteProviderModalProps) {
  const { addNotification } = useNotificationStore()

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/providers/${providerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          type: "success",
          title: "Prestataire supprimé",
          message: `${providerName} a été supprimé avec succès`,
          timestamp: new Date(),
          read: false,
        })
        onClose()
      } else {
        throw new Error("Erreur lors de la suppression")
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible de supprimer le prestataire",
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
              <ModalTitle>
                <AlertTriangle />
                Supprimer le Prestataire
              </ModalTitle>
              <CloseBtn onClick={onClose}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <WarningMessage>
              ⚠️ Cette action est irréversible. Le prestataire sera définitivement supprimé du système. Toutes ses
              données et son historique seront perdus.
            </WarningMessage>

            <ProviderInfo>
              <h4>{providerName}</h4>
              <p>Êtes-vous sûr de vouloir supprimer ce prestataire ?</p>
            </ProviderInfo>

            <FormActions>
              <Button onClick={onClose}>Annuler</Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 />
                Supprimer définitivement
              </Button>
            </FormActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  )
}

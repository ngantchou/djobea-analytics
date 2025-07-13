"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
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
  max-width: 500px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f44336;
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

const WarningMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: #f44336;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
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
      case "danger":
        return `
          background: var(--danger-gradient);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
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

interface CancelRequestModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
}

export function CancelRequestModal({ isOpen, onClose, requestId }: CancelRequestModalProps) {
  const { addNotification } = useNotificationStore()
  const [reason, setReason] = useState("")
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)

  const cancelReasons = [
    "Client non disponible",
    "Problème résolu par le client",
    "Demande incorrecte",
    "Prestataire non disponible",
    "Problème de paiement",
    "Autre",
  ]

  const handleCancel = async () => {
    if (!reason) {
      addNotification({
        id: Date.now().toString(),
        message: "Veuillez sélectionner une raison d'annulation",
        type: "warning",
        timestamp: new Date(),
        read: false,
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          comments,
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          message: `Demande #${requestId} annulée avec succès`,
          type: "success",
          timestamp: new Date(),
          read: false,
        })
        onClose()
        setReason("")
        setComments("")
      } else {
        throw new Error("Failed to cancel request")
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        message: "Erreur lors de l'annulation",
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
            <ModalTitle>
              <AlertTriangle size={24} />
              Annuler la demande
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <WarningMessage>
              <AlertTriangle size={24} />
              <div>
                <strong>Attention !</strong>
                <br />
                Cette action annulera définitivement la demande #{requestId}. Cette action ne peut pas être annulée.
              </div>
            </WarningMessage>

            <FormGroup>
              <Label htmlFor="reason">Raison de l'annulation *</Label>
              <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required>
                <option value="">Sélectionner une raison</option>
                {cancelReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="comments">Commentaires additionnels</Label>
              <TextArea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Détails supplémentaires sur l'annulation..."
              />
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Annuler</Button>
            <Button variant="danger" onClick={handleCancel} disabled={loading || !reason}>
              {loading ? "Annulation..." : "Confirmer l'annulation"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  )
}

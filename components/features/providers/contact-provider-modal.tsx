"use client"

import styled from "styled-components"
import { X, Phone, MessageCircle, Mail, Send } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore } from "@/store/use-notification-store"
import { useProvidersData } from "@/hooks/use-providers-data"

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
  max-height: 80vh;
  overflow-y: auto;
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

const ContactOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const ContactOption = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--glass-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    background: var(--primary-gradient);
    transform: translateY(-2px);
    color: white;
  }

  svg {
    font-size: 1.5rem;
    width: 40px;
    text-align: center;
  }

  h4 {
    margin-bottom: 0.25rem;
    font-size: 1rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  &:hover h4,
  &:hover p {
    color: white;
  }
`

const QuickMessage = styled.div`
  background: var(--glass-bg);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);

  h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
`

const MessageTextarea = styled.textarea`
  width: 100%;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`

const SendButton = styled.button`
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

interface ContactProviderModalProps {
  isOpen: boolean
  onClose: () => void
  providerId: string | null
}

export function ContactProviderModal({ isOpen, onClose, providerId }: ContactProviderModalProps) {
  const { addNotification } = useNotificationStore()
  const { data: providers } = useProvidersData()
  const [message, setMessage] = useState("")

  const provider = providers?.find((p) => p.id === providerId)

  const handleCall = async () => {
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
          title: "Appel en cours",
          message: `Appel vers ${provider?.name}`,
          timestamp: new Date(),
          read: false,
        })
        onClose()
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible d'initier l'appel",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  const handleWhatsApp = async () => {
    try {
      const response = await fetch(`/api/providers/${providerId}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "whatsapp",
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          type: "info",
          title: "WhatsApp",
          message: `Ouverture WhatsApp pour ${provider?.name}`,
          timestamp: new Date(),
          read: false,
        })
        onClose()
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible d'ouvrir WhatsApp",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  const handleEmail = async () => {
    try {
      const response = await fetch(`/api/providers/${providerId}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "email",
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          type: "info",
          title: "Email",
          message: `Ouverture email pour ${provider?.name}`,
          timestamp: new Date(),
          read: false,
        })
        onClose()
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: "Impossible d'ouvrir l'email",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const response = await fetch(`/api/providers/${providerId}/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: "message",
            message,
          }),
        })

        if (response.ok) {
          addNotification({
            id: Date.now().toString(),
            type: "success",
            title: "Message envoyé",
            message: `Message envoyé à ${provider?.name}`,
            timestamp: new Date(),
            read: false,
          })
          setMessage("")
          onClose()
        }
      } catch (error) {
        addNotification({
          id: Date.now().toString(),
          type: "error",
          title: "Erreur",
          message: "Impossible d'envoyer le message",
          timestamp: new Date(),
          read: false,
        })
      }
    } else {
      addNotification({
        id: Date.now().toString(),
        type: "warning",
        title: "Message vide",
        message: "Veuillez saisir un message",
        timestamp: new Date(),
        read: false,
      })
    }
  }

  if (!provider) {
    return null
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
              <ModalTitle>Contacter {provider.name}</ModalTitle>
              <CloseBtn onClick={onClose}>
                <X />
              </CloseBtn>
            </ModalHeader>

            <ContactOptions>
              <ContactOption onClick={handleCall}>
                <Phone />
                <div>
                  <h4>Appeler</h4>
                  <p>Appel téléphonique direct</p>
                </div>
              </ContactOption>

              <ContactOption onClick={handleWhatsApp}>
                <MessageCircle />
                <div>
                  <h4>WhatsApp</h4>
                  <p>Envoyer un message WhatsApp</p>
                </div>
              </ContactOption>

              <ContactOption onClick={handleEmail}>
                <Mail />
                <div>
                  <h4>Email</h4>
                  <p>Envoyer un email</p>
                </div>
              </ContactOption>
            </ContactOptions>

            <QuickMessage>
              <h4>Message rapide</h4>
              <MessageTextarea
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <SendButton onClick={handleSendMessage}>
                <Send />
                Envoyer
              </SendButton>
            </QuickMessage>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  )
}

"use client"

import { useState } from "react"
import { X, Phone, MessageCircle, Mail, Send } from "lucide-react"
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
  max-width: 600px;
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

const ContactMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const ContactMethod = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
`

const ContactIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const ContactLabel = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`

const MessageSection = styled.div`
  margin-top: 2rem;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 120px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

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

interface ContactProviderModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  provider: {
    id: string
    name: string
    phone: string
    whatsapp: string
    email: string
  }
}

export function ContactProviderModal({ isOpen, onClose, requestId, provider }: ContactProviderModalProps) {
  const { addNotification } = useNotificationStore()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCall = () => {
    window.open(`tel:${provider.phone}`, "_self")
    addNotification({
      id: Date.now().toString(),
      message: `Appel vers ${provider.name}`,
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(`Bonjour ${provider.name}, concernant la demande #${requestId}`)
    window.open(`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`, "_blank")
    addNotification({
      id: Date.now().toString(),
      message: `Message WhatsApp envoyé à ${provider.name}`,
      type: "success",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Demande #${requestId}`)
    const body = encodeURIComponent(
      `Bonjour ${provider.name},\n\nConcernant la demande #${requestId}...\n\nCordialement`,
    )
    window.open(`mailto:${provider.email}?subject=${subject}&body=${body}`, "_self")
    addNotification({
      id: Date.now().toString(),
      message: `Email ouvert pour ${provider.name}`,
      type: "info",
      timestamp: new Date(),
      read: false,
    })
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      addNotification({
        id: Date.now().toString(),
        message: "Veuillez saisir un message",
        type: "warning",
        timestamp: new Date(),
        read: false,
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/requests/${requestId}/contact-provider`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId: provider.id,
          message,
        }),
      })

      if (response.ok) {
        addNotification({
          id: Date.now().toString(),
          message: `Message envoyé à ${provider.name}`,
          type: "success",
          timestamp: new Date(),
          read: false,
        })
        setMessage("")
        onClose()
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        message: "Erreur lors de l'envoi du message",
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
            <ModalTitle>Contacter {provider.name}</ModalTitle>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <ContactMethods>
              <ContactMethod onClick={handleCall}>
                <ContactIcon>
                  <Phone size={20} />
                </ContactIcon>
                <ContactLabel>Appeler</ContactLabel>
              </ContactMethod>

              <ContactMethod onClick={handleWhatsApp}>
                <ContactIcon>
                  <MessageCircle size={20} />
                </ContactIcon>
                <ContactLabel>WhatsApp</ContactLabel>
              </ContactMethod>

              <ContactMethod onClick={handleEmail}>
                <ContactIcon>
                  <Mail size={20} />
                </ContactIcon>
                <ContactLabel>Email</ContactLabel>
              </ContactMethod>
            </ContactMethods>

            <MessageSection>
              <FormGroup>
                <Label htmlFor="message">Envoyer un message</Label>
                <TextArea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Écrivez votre message à ${provider.name}...`}
                />
              </FormGroup>
            </MessageSection>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Fermer</Button>
            <Button variant="primary" onClick={handleSendMessage} disabled={loading || !message.trim()}>
              <Send size={16} />
              {loading ? "Envoi..." : "Envoyer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  )
}

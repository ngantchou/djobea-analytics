"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  isLoading = false
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-400",
          confirmButton: "bg-red-600 hover:bg-red-700"
        }
      case "warning":
        return {
          icon: "text-yellow-400",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700"
        }
      case "info":
        return {
          icon: "text-blue-400",
          confirmButton: "bg-blue-600 hover:bg-blue-700"
        }
      default:
        return {
          icon: "text-red-400",
          confirmButton: "bg-red-600 hover:bg-red-700"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${styles.confirmButton}`}
            disabled={isLoading}
          >
            {isLoading ? "..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
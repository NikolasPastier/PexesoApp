"use client"

import type React from "react"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "default" | "large"
}

export function Modal({ isOpen, onClose, title, children, size = "default" }: ModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div
        className={`relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 shadow-2xl rounded-xl p-6 ${
          size === "large" ? "max-w-[95vw] md:max-w-[85vw] lg:max-w-[70vw] xl:max-w-[65vw]" : "max-w-lg"
        } w-full mx-4 max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2">
          <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

interface GenerationLimitModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  generationsUsed: number
  generationsLimit: number
}

export function GenerationLimitModal({
  isOpen,
  onClose,
  onUpgrade,
  generationsUsed,
  generationsLimit,
}: GenerationLimitModalProps) {
  const t = useTranslations("generationLimit")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-6 pt-2">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{t("title")}</h2>
          </div>

          {/* Body Text */}
          <p className="text-center text-gray-300 text-base leading-relaxed">{t("description")}</p>

          {/* Usage Counter */}
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center">
              {t("generationsUsed", { used: generationsUsed, limit: generationsLimit })}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:text-white font-semibold py-6 text-base"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t("upgradeButton")}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              {t("closeButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

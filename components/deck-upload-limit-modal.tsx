"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface DeckUploadLimitModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  decksUploaded: number
  deckLimit: number
  proLimit: number
}

export function DeckUploadLimitModal({
  isOpen,
  onClose,
  onUpgrade,
  decksUploaded,
  deckLimit,
  proLimit,
}: DeckUploadLimitModalProps) {
  const t = useTranslations("deckUploadLimit")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800/95 border-gray-600/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-lg"></div>

        <div className="relative">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <DialogTitle className="text-2xl text-white">{t("title")}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <p className="text-gray-300 leading-relaxed">{t("description", { proLimit })}</p>

            <div className="p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <p className="text-sm text-gray-400">{t("uploadsUsed", { used: decksUploaded, limit: deckLimit })}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={onUpgrade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-200"
              >
                {t("upgradeButton")}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="flex-1 text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                {t("closeButton")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

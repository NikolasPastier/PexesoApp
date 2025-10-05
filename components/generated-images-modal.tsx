"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Sparkles, Save, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

interface GeneratedImage {
  url: string
  id: string
}

interface GeneratedImagesModalProps {
  isOpen: boolean
  onClose: () => void
  images: GeneratedImage[]
  prompt: string
  cardCount: string
  style: string
  onRegenerate: () => void
  onSave: () => void
  isRegenerating?: boolean
  isSaving?: boolean
}

export function GeneratedImagesModal({
  isOpen,
  onClose,
  images,
  prompt,
  cardCount,
  style,
  onRegenerate,
  onSave,
  isRegenerating = false,
  isSaving = false,
}: GeneratedImagesModalProps) {
  const { toast } = useToast()
  const t = useTranslations("generatedImages")
  const tDeckGen = useTranslations("deckGenerator")

  useEffect(() => {
    if (images.length > 0) {
      console.log(
        "[v0] Generated images received in modal:",
        images.map((img) => ({
          id: img.id,
          url: img.url,
          isValid: img.url && img.url.startsWith("http"),
        })),
      )
    }
  }, [images])

  const cardCountOptions = [
    { value: "8", label: t("cardCount.8"), cards: 16 },
    { value: "12", label: t("cardCount.12"), cards: 24 },
    { value: "16", label: t("cardCount.16"), cards: 32 },
  ]

  const getCardsCount = (pictureCount: string) => {
    const option = cardCountOptions.find((opt) => opt.value === pictureCount)
    return option?.cards || 24
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/50 backdrop-blur-sm border-none p-0">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 shadow-2xl rounded-xl p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white">{t("title")}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-gray-300">
              <p className="text-sm">
                {t("generatedCount", { count: images.length, total: getCardsCount(cardCount) })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("promptInfo", {
                  prompt,
                  style: style === "realistic" ? tDeckGen("realistic") : tDeckGen("cartoon"),
                  total: getCardsCount(cardCount),
                })}
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square relative rounded-xl overflow-hidden bg-gray-700/50 animate-in fade-in-50 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Image
                    src={image.url && image.url.startsWith("http") ? image.url : "/placeholder.svg"}
                    alt={t("alt", { index: index + 1 })}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error(`[v0] Failed to load image ${index + 1}:`, image.url)
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-600/30">
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={isRegenerating || isSaving}
                className="bg-gray-700/50 border-gray-600/30 text-gray-200 hover:bg-gray-600/50"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("regenerating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("regenerate")}
                  </>
                )}
              </Button>
              <Button onClick={onSave} disabled={isSaving || isRegenerating} className="bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("saveToGallery")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GeneratedImagesModal } from "@/components/generated-images-modal"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { GenerationLimitModal } from "@/components/generation-limit-modal"
import { UpgradeModal } from "@/components/upgrade-modal"
import { useTranslations } from "next-intl"

interface GeneratedImage {
  url: string
  id: string
}

export function DeckGenerator() {
  const t = useTranslations("deckGenerator")
  const [prompt, setPrompt] = useState("")
  const [cardCount, setCardCount] = useState("12") // Default to 12 pictures (24 cards)
  const [style, setStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<"generate" | null>(null)
  const [showGenerationLimitModal, setShowGenerationLimitModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [limitInfo, setLimitInfo] = useState<{ used: number; limit: number }>({ used: 0, limit: 1 })
  const { toast } = useToast()
  const { user } = useAuth()

  const cardCountOptions = [
    { value: "8", label: "8 pictures (16 cards)", cards: 16 },
    { value: "12", label: "12 pictures (24 cards)", cards: 24 },
    { value: "16", label: "16 pictures (32 cards)", cards: 32 },
  ]

  const styleOptions = [
    { value: "realistic", label: "Realistic" },
    { value: "cartoon", label: "Cartoon" },
  ]

  const getCardsCount = (pictureCount: string) => {
    const option = cardCountOptions.find((opt) => opt.value === pictureCount)
    return option?.cards || 24
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    if (!user) {
      setPendingAction("generate")
      setShowAuthModal(true)
      return
    }

    const validCounts = ["8", "12", "16"]
    if (!validCounts.includes(cardCount)) {
      toast({
        title: t("invalidCardCount"),
        description: t("invalidCardCountDesc"),
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, cardCount: Number.parseInt(cardCount), style }),
      })

      if (response.status === 500) {
        const data = await response.json()
        if (data.missingApiKey) {
          toast({
            title: "Configuration Required",
            description:
              "AI image generation is not configured. Please add the FAL_KEY environment variable to enable deck generation.",
            variant: "destructive",
            duration: 8000,
          })
          return
        }
      }

      if (response.status === 429) {
        const data = await response.json()

        if (data.upgradeAvailable) {
          // Free user hit daily limit - show upgrade modal
          setLimitInfo({ used: 1, limit: 1 })
          setShowGenerationLimitModal(true)
        } else {
          // Pro user hit monthly limit - show toast
          toast({
            title: t("dailyLimitReached"),
            description: t("dailyLimitReachedDesc", { hours: data.hoursRemaining || 24 }),
            variant: "destructive",
          })
        }
        return
      }

      if (!response.ok) {
        throw new Error("Failed to generate images")
      }

      const data = await response.json()
      setGeneratedImages(data.images || [])

      if (data.images && data.images.length > 0) {
        setIsModalOpen(true)
        toast({
          title: t("generationSuccess"),
          description: t("generationSuccessDesc", { count: data.images.length }),
        })
      }
    } catch (error) {
      console.error("Error generating images:", error)
      toast({
        title: t("generationFailed"),
        description: t("generationFailedDesc"),
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    await handleGenerate()
  }

  const handleSaveDeck = async () => {
    if (generatedImages.length === 0) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: prompt,
          images: generatedImages.map((img) => img.url),
          prompt,
          cards_count: getCardsCount(cardCount),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save deck")
      }

      toast({
        title: t("deckSaved"),
        description: t("deckSavedDesc", { title: prompt, count: getCardsCount(cardCount) }),
      })

      setIsModalOpen(false)
      setPrompt("")
      setGeneratedImages([])
      setCardCount("12")
      setStyle("realistic")
    } catch (error) {
      console.error("Error saving deck:", error)
      toast({
        title: t("saveFailed"),
        description: t("saveFailedDesc"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAuthModalClose = () => {
    setShowAuthModal(false)
    if (user && pendingAction === "generate") {
      setPendingAction(null)
      setTimeout(() => {
        handleGenerate()
      }, 300)
    } else {
      setPendingAction(null)
    }
  }

  const handleUpgradeFromLimit = () => {
    setShowGenerationLimitModal(false)
    setShowUpgradeModal(true)
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 max-md:gap-1.5">
              <div className="flex-1 relative min-w-0">
                <Input
                  placeholder={t("placeholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
                  className="bg-transparent border-none text-gray-200 placeholder:text-gray-400 text-lg max-md:text-sm h-12 max-md:h-10 focus:ring-0 focus:outline-none px-0"
                />
              </div>

              <div className="flex items-center gap-2 max-md:gap-1">
                <Select value={cardCount} onValueChange={setCardCount}>
                  <SelectTrigger className="w-auto h-8 bg-gray-800/50 border-gray-600 text-gray-200 text-xs px-1.5 max-md:w-12 max-md:h-8 max-md:px-1">
                    <SelectValue placeholder="16" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="8" className="text-gray-200 focus:bg-gray-700 focus:text-white text-xs">
                      16
                    </SelectItem>
                    <SelectItem value="12" className="text-gray-200 focus:bg-gray-700 focus:text-white text-xs">
                      24
                    </SelectItem>
                    <SelectItem value="16" className="text-gray-200 focus:bg-gray-700 focus:text-white text-xs">
                      32
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="w-auto h-8 bg-gray-800/50 border-gray-600 text-gray-200 text-xs px-1.5 max-md:w-16 max-md:h-8 max-md:px-1">
                    <SelectValue placeholder={t("style")} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="realistic" className="text-gray-200 focus:bg-gray-700 focus:text-white text-xs">
                      {t("realistic")}
                    </SelectItem>
                    <SelectItem value="cartoon" className="text-gray-200 focus:bg-gray-700 focus:text-white text-xs">
                      {t("cartoon")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  size="sm"
                  className="h-8 w-8 max-md:h-8 max-md:w-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg shrink-0"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GeneratedImagesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={generatedImages}
        prompt={prompt}
        cardCount={cardCount}
        style={style}
        onRegenerate={handleRegenerate}
        onSave={handleSaveDeck}
        isRegenerating={isGenerating}
        isSaving={isSaving}
      />

      <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} defaultTab="login" />

      <GenerationLimitModal
        isOpen={showGenerationLimitModal}
        onClose={() => setShowGenerationLimitModal(false)}
        onUpgrade={handleUpgradeFromLimit}
        generationsUsed={limitInfo.used}
        generationsLimit={limitInfo.limit}
      />

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}

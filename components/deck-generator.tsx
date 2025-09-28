"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GeneratedImagesModal } from "@/components/generated-images-modal"

interface GeneratedImage {
  url: string
  id: string
}

export function DeckGenerator() {
  const [prompt, setPrompt] = useState("")
  const [cardCount, setCardCount] = useState("12") // Default to 12 pictures (24 cards)
  const [style, setStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

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

    const validCounts = ["8", "12", "16"]
    if (!validCounts.includes(cardCount)) {
      toast({
        title: "Invalid card count",
        description: "Please select a valid card count option.",
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

      if (!response.ok) {
        throw new Error("Failed to generate images")
      }

      const data = await response.json()
      setGeneratedImages(data.images || [])

      if (data.images && data.images.length > 0) {
        setIsModalOpen(true)
        toast({
          title: "Images generated successfully!",
          description: `Generated ${data.images.length} unique images for your deck.`,
        })
      }
    } catch (error) {
      console.error("Error generating images:", error)
      toast({
        title: "Generation failed",
        description: "Image generation failed. Please try again.",
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
        title: "Deck saved successfully!",
        description: `Your deck "${prompt}" has been saved with ${getCardsCount(cardCount)} cards.`,
      })

      setIsModalOpen(false)
      setPrompt("")
      setGeneratedImages([])
      setCardCount("12")
      setStyle("realistic")
    } catch (error) {
      console.error("Error saving deck:", error)
      toast({
        title: "Save failed",
        description: "Failed to save deck. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="relative">
        {/* Main Prompt Container - Dark rounded design similar to the image */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Card Count</label>
              <Select value={cardCount} onValueChange={setCardCount}>
                <SelectTrigger className="w-full bg-gray-800/50 border-gray-600 text-gray-200">
                  <SelectValue placeholder="Select card count" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {cardCountOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-200 focus:bg-gray-700 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-full bg-gray-800/50 border-gray-600 text-gray-200">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {styleOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-200 focus:bg-gray-700 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-stretch max-sm:gap-3">
            {/* Main input area */}
            <div className="flex-1 relative min-w-0">
              <Input
                placeholder="Ask PexesoAI to create a deck about..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
                className="bg-transparent border-none text-gray-200 placeholder:text-gray-400 text-lg max-sm:text-base h-12 focus:ring-0 focus:outline-none px-0"
              />
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-center">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                size="sm"
                className="h-10 w-10 max-sm:w-full max-sm:h-12 rounded-full max-sm:rounded-lg bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Subtitle */}
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
    </div>
  )
}

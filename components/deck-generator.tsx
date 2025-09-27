"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Sparkles, Save, ArrowUp } from "lucide-react"
import Image from "next/image"

interface GeneratedImage {
  url: string
  id: string
}

export function DeckGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate images")
      }

      const data = await response.json()
      setGeneratedImages(data.images || [])
    } catch (error) {
      console.error("Error generating images:", error)
      // TODO: Add proper error handling/toast
    } finally {
      setIsGenerating(false)
    }
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
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save deck")
      }

      // TODO: Add success feedback and redirect to deck
      console.log("Deck saved successfully!")
    } catch (error) {
      console.error("Error saving deck:", error)
      // TODO: Add proper error handling/toast
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="relative">
        {/* Main Prompt Container - Dark rounded design similar to the image */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 rounded-3xl p-6 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Main input area */}
            <div className="flex-1 relative">
              <Input
                placeholder="Ask PexesoAI to create a deck about..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
                className="bg-transparent border-none text-gray-200 placeholder:text-gray-400 text-lg h-12 focus:ring-0 focus:outline-none px-0"
              />
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                size="sm"
                className="h-10 w-10 rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Subtitle */}
      </div>

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square relative rounded-xl overflow-hidden bg-muted animate-in fade-in-50 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`Generated image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={handleGenerate} disabled={isGenerating} className="bg-background/80">
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate Images
              </Button>
              <Button onClick={handleSaveDeck} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Deck
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

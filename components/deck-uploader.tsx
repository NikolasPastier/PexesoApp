"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Sparkles } from "lucide-react"

export function DeckUploader() {
  const [deckTitle, setDeckTitle] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedImages((prev) => [...prev, ...files])
  }

  const handleGenerateAIDeck = () => {
    // Placeholder for AI deck generation
    console.log("Generating AI deck...")
  }

  const handleCreateDeck = () => {
    // Placeholder for deck creation
    console.log("Creating deck:", { deckTitle, selectedImages })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-card-foreground">Create New Deck</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="deck-title">Deck Title</Label>
          <Input
            id="deck-title"
            placeholder="Enter deck title..."
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label>Upload Images</Label>
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Drag and drop images here, or click to select</p>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button variant="outline" asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                Select Images
              </label>
            </Button>
          </div>

          {selectedImages.length > 0 && (
            <div className="text-sm text-muted-foreground">{selectedImages.length} image(s) selected</div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleGenerateAIDeck}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Deck
          </Button>
          <Button className="flex-1" onClick={handleCreateDeck} disabled={!deckTitle || selectedImages.length === 0}>
            Create Deck
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

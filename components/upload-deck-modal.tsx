"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Plus } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface UploadDeckModalProps {
  onDeckUploaded?: () => void
}

export function UploadDeckModal({ onDeckUploaded }: UploadDeckModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deckTitle, setDeckTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cardCount, setCardCount] = useState<number | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMaxImages = (cards: number) => cards / 2

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length !== files.length) {
      setError("Only image files are allowed (jpg, png, webp)")
      return
    }

    if (!cardCount) {
      setError("Please select the number of playing cards first")
      return
    }

    const maxImages = getMaxImages(cardCount)
    const totalImages = selectedImages.length + imageFiles.length

    if (totalImages > maxImages) {
      setError(`You can only upload ${maxImages} images for ${cardCount} cards.`)
      return
    }

    setSelectedImages((prev) => [...prev, ...imageFiles])
    setError(null)
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deckTitle.trim()) {
      setError("Deck name is required")
      return
    }

    if (!cardCount) {
      setError("Please select the number of playing cards")
      return
    }

    if (selectedImages.length === 0) {
      setError("At least one image is required")
      return
    }

    const requiredImages = getMaxImages(cardCount)
    if (selectedImages.length !== requiredImages) {
      setError(`You need exactly ${requiredImages} images for ${cardCount} cards`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to upload decks")
      }

      // Upload images to Supabase Storage
      const imageUrls: string[] = []

      for (const image of selectedImages) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("deck-images")
          .upload(fileName, image)

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("deck-images").getPublicUrl(uploadData.path)

        imageUrls.push(publicUrl)
      }

      const { error: dbError } = await supabase.from("decks").insert({
        user_id: user.id,
        title: deckTitle.trim(),
        description: description.trim() || null,
        images: imageUrls,
        cards_count: cardCount,
        is_public: true,
      })

      if (dbError) {
        throw new Error(`Failed to save deck: ${dbError.message}`)
      }

      // Show success message
      const event = new CustomEvent("showToast", {
        detail: { message: "Deck uploaded successfully!" },
      })
      window.dispatchEvent(event)

      // Reset form and close modal
      setDeckTitle("")
      setDescription("")
      setCardCount(null)
      setSelectedImages([])
      setIsOpen(false)

      // Notify parent component to refresh
      onDeckUploaded?.()
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload deck")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800/95 border-gray-600/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-lg"></div>
        <div className="relative">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Upload Your Deck</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deck Name */}
            <div className="space-y-2">
              <Label htmlFor="deck-name" className="text-gray-200">
                Deck Name *
              </Label>
              <Input
                id="deck-name"
                placeholder="Enter deck name..."
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                required
                className="bg-gray-700/50 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-primary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your deck..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-gray-700/50 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">Number of Playing Cards *</Label>
              <Select value={cardCount?.toString()} onValueChange={(value) => setCardCount(Number(value))}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600/30 text-white focus:border-primary/50">
                  <SelectValue placeholder="Select card count..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600/30">
                  <SelectItem value="16" className="text-white hover:bg-gray-700">
                    16 cards (upload 8 images)
                  </SelectItem>
                  <SelectItem value="24" className="text-white hover:bg-gray-700">
                    24 cards (upload 12 images)
                  </SelectItem>
                  <SelectItem value="32" className="text-white hover:bg-gray-700">
                    32 cards (upload 16 images)
                  </SelectItem>
                </SelectContent>
              </Select>
              {cardCount && (
                <p className="text-sm text-gray-400">
                  You need to upload exactly {getMaxImages(cardCount)} images for {cardCount} cards.
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label className="text-gray-200">Images *</Label>
              <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-6 text-center bg-gray-700/20">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300 mb-4">Drag and drop images here, or click to select</p>
                <p className="text-sm text-gray-400 mb-4">Accepts: JPG, PNG, WebP</p>
                {cardCount && (
                  <p className="text-sm text-primary mb-4">
                    Upload {getMaxImages(cardCount)} images for {cardCount} cards
                  </p>
                )}
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={!cardCount}
                />
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="bg-gray-700/50 border-gray-600/30 text-gray-200 hover:bg-gray-600/50"
                  disabled={!cardCount}
                >
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Select Images
                  </label>
                </Button>
              </div>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-200">
                    {selectedImages.length} image(s) selected
                    {cardCount && ` (${getMaxImages(cardCount)} required)`}
                  </p>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600/30">
                          <Image
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/90 hover:bg-red-700/90"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-400 bg-red-900/30 border border-red-700/30 p-3 rounded-lg">{error}</div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-600/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
                className="bg-gray-700/50 border-gray-600/30 text-gray-200 hover:bg-gray-600/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isUploading ||
                  !deckTitle.trim() ||
                  !cardCount ||
                  selectedImages.length !== getMaxImages(cardCount || 0)
                }
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? "Uploading..." : "Save Deck"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

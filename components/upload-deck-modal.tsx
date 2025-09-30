"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Plus, AlertCircle } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { useTranslations } from "next-intl"
import Link from "next/link"

interface UploadDeckModalProps {
  onDeckUploaded?: () => void
}

const DECK_LIMITS = {
  free: 5,
  pro: 25,
}

export function UploadDeckModal({ onDeckUploaded }: UploadDeckModalProps) {
  const t = useTranslations("uploadDeck")
  const [isOpen, setIsOpen] = useState(false)
  const [deckTitle, setDeckTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cardCount, setCardCount] = useState<number | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const [deckCount, setDeckCount] = useState<number>(0)
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free")
  const [isLoadingLimits, setIsLoadingLimits] = useState(false)

  const handleOpenChange = (open: boolean) => {
    if (open && !user) {
      setShowAuthModal(true)
      return
    }
    setIsOpen(open)
  }

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false)
      setIsOpen(true)
    }
  }, [user, showAuthModal])

  useEffect(() => {
    if (isOpen && user) {
      fetchDeckLimits()
    }
  }, [isOpen, user])

  const fetchDeckLimits = async () => {
    setIsLoadingLimits(true)
    try {
      const supabase = createClient()

      // Get user's plan
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user!.id)
        .single()

      if (userError) {
        console.error("[v0] Failed to fetch user plan:", userError)
      } else {
        setUserPlan((userData?.plan || "free") as "free" | "pro")
      }

      // Count user's decks
      const { count, error: countError } = await supabase
        .from("decks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)

      if (countError) {
        console.error("[v0] Failed to count decks:", countError)
      } else {
        setDeckCount(count || 0)
      }
    } catch (error) {
      console.error("[v0] Error fetching deck limits:", error)
    } finally {
      setIsLoadingLimits(false)
    }
  }

  const getMaxImages = (cards: number) => cards / 2

  const hasReachedLimit = deckCount >= DECK_LIMITS[userPlan]
  const deckLimit = DECK_LIMITS[userPlan]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length !== files.length) {
      setError(t("onlyImages"))
      return
    }

    if (!cardCount) {
      setError(t("selectCardCountFirst"))
      return
    }

    const maxImages = getMaxImages(cardCount)
    const totalImages = selectedImages.length + imageFiles.length

    if (totalImages > maxImages) {
      setError(t("maxImagesExceeded", { max: maxImages, total: cardCount }))
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
      setError(t("deckNameRequired"))
      return
    }

    if (!cardCount) {
      setError(t("selectCardCountFirst"))
      return
    }

    if (selectedImages.length === 0) {
      setError(t("atLeastOneImage"))
      return
    }

    const requiredImages = getMaxImages(cardCount)
    if (selectedImages.length !== requiredImages) {
      setError(t("exactImagesRequired", { required: requiredImages, total: cardCount }))
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", deckTitle.trim())
      formData.append("description", description.trim())
      formData.append("cards_count", cardCount.toString())

      for (const image of selectedImages) {
        formData.append("images", image)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload deck")
      }

      const event = new CustomEvent("showToast", {
        detail: { message: t("uploadSuccess") },
      })
      window.dispatchEvent(event)

      setDeckTitle("")
      setDescription("")
      setCardCount(null)
      setSelectedImages([])
      setIsOpen(false)

      onDeckUploaded?.()
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload deck")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("title")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800/95 border-gray-600/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-lg"></div>
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">{t("title")}</DialogTitle>
            </DialogHeader>

            <div className="mb-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    {t("deckCount")}:{" "}
                    <span className="font-semibold text-white">
                      {deckCount}/{deckLimit}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{userPlan === "free" ? t("freePlan") : t("proPlan")}</p>
                </div>
                {hasReachedLimit && userPlan === "free" && (
                  <Link href="/pricing">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      {t("upgradeToPro")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {hasReachedLimit && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-200 font-medium">
                    {userPlan === "free" ? t("freeLimitReached") : t("proLimitReached")}
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    {userPlan === "free" ? t("freeLimitMessage") : t("proLimitMessage")}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deck-name" className="text-gray-200">
                  {t("deckName")} *
                </Label>
                <Input
                  id="deck-name"
                  placeholder={t("deckNamePlaceholder")}
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  required
                  disabled={hasReachedLimit}
                  className="bg-gray-700/50 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-primary/50 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-200">
                  {t("description")}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={hasReachedLimit}
                  className="bg-gray-700/50 border-gray-600/30 text-white placeholder:text-gray-400 focus:border-primary/50 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">{t("cardCount")} *</Label>
                <Select
                  value={cardCount?.toString()}
                  onValueChange={(value) => setCardCount(Number(value))}
                  disabled={hasReachedLimit}
                >
                  <SelectTrigger className="bg-gray-700/50 border-gray-600/30 text-white focus:border-primary/50 disabled:opacity-50">
                    <SelectValue placeholder={t("selectCardCount")} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600/30">
                    <SelectItem value="16" className="text-white hover:bg-gray-700">
                      {t("16cards")}
                    </SelectItem>
                    <SelectItem value="24" className="text-white hover:bg-gray-700">
                      {t("24cards")}
                    </SelectItem>
                    <SelectItem value="32" className="text-white hover:bg-gray-700">
                      {t("32cards")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {cardCount && (
                  <p className="text-sm text-gray-400">
                    {t("uploadInfo", { count: getMaxImages(cardCount), total: cardCount })}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-gray-200">{t("images")} *</Label>
                <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-6 text-center bg-gray-700/20">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300 mb-4">{t("dragDrop")}</p>
                  <p className="text-sm text-gray-400 mb-4">{t("acceptedFormats")}</p>
                  {cardCount && (
                    <p className="text-sm text-primary mb-4">
                      {t("uploadCount", { count: getMaxImages(cardCount), total: cardCount })}
                    </p>
                  )}
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={!cardCount || hasReachedLimit}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="bg-gray-700/50 border-gray-600/30 text-gray-200 hover:bg-gray-600/50"
                    disabled={!cardCount || hasReachedLimit}
                  >
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {t("selectImages")}
                    </label>
                  </Button>
                </div>

                {selectedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-200">
                      {t("imagesSelected", { count: selectedImages.length })}
                      {cardCount && ` ${t("imagesRequired", { required: getMaxImages(cardCount) })}`}
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

              {error && (
                <div className="text-sm text-red-400 bg-red-900/30 border border-red-700/30 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-600/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="bg-gray-700/50 border-gray-600/30 text-gray-200 hover:bg-gray-600/50"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isUploading ||
                    hasReachedLimit ||
                    !deckTitle.trim() ||
                    !cardCount ||
                    selectedImages.length !== getMaxImages(cardCount || 0)
                  }
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUploading ? t("uploading") : t("saveDeck")}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="signup" />
    </>
  )
}

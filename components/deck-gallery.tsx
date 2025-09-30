"use client"

import type React from "react"
import { Fragment } from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UploadDeckModal } from "@/components/upload-deck-modal"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { AdBanner } from "@/components/ad-banner"

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
)

interface Deck {
  id: string
  title: string
  images: string[]
  user_id: string
  is_public: boolean
  created_at: string
  cards_count?: number
  user?: {
    username: string
    avatar_url: string
  }
  likes?: number
  plays?: number
  isFavorited?: boolean
  description?: string
}

export function DeckGallery() {
  const t = useTranslations("deckGallery")

  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showBrowseModal, setShowBrowseModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showBrowsePreviewModal, setShowBrowsePreviewModal] = useState(false)
  const [modalDecks, setModalDecks] = useState<Deck[]>([])
  const [modalLoading, setModalLoading] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const [filterCardCount, setFilterCardCount] = useState<string>("all")
  const { user } = useAuth()

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      const response = await fetch("/api/decks")
      if (response.ok) {
        const { decks: supabaseDecks } = await response.json()
        setDecks(supabaseDecks || [])
      } else {
        console.error("Failed to fetch decks")
        setDecks([])
      }
    } catch (error) {
      console.error("Error loading decks:", error)
      setDecks([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadModalDecks = async (sort: string, cardCount: string) => {
    setModalLoading(true)
    try {
      const params = new URLSearchParams()
      if (sort !== "recent") params.append("sort", sort)
      if (cardCount !== "all") params.append("card_count", cardCount)

      const response = await fetch(`/api/decks/browse?${params.toString()}`)
      if (response.ok) {
        const { decks: modalDecks } = await response.json()
        setModalDecks(modalDecks || [])
      } else {
        console.error("Failed to fetch modal decks")
        setModalDecks([])
      }
    } catch (error) {
      console.error("Error loading modal decks:", error)
      setModalDecks([])
    } finally {
      setModalLoading(false)
    }
  }

  const handleSelectDeck = (deck: Deck) => {
    // Store selected deck in localStorage for the game to use
    localStorage.setItem("selectedDeck", JSON.stringify(deck))
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("deckSelected", { detail: deck }))

    window.scrollTo({ top: 0, behavior: "smooth" })

    const event = new CustomEvent("showToast", {
      detail: { message: t("deckSelected", { title: deck.title }) },
    })
    window.dispatchEvent(event)
  }

  const handleDeckUploaded = () => {
    loadDecks()
  }

  const handleFavoriteToggle = async (deck: Deck, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click

    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch(`/api/decks/${deck.id}/favorite`, {
        method: "POST",
      })

      if (response.ok) {
        const { favorited } = await response.json()

        // Update the deck in state
        setDecks((prevDecks) =>
          prevDecks.map((d) =>
            d.id === deck.id
              ? {
                  ...d,
                  isFavorited: favorited,
                  likes: favorited ? (d.likes || 0) + 1 : Math.max(0, (d.likes || 0) - 1),
                }
              : d,
          ),
        )

        const event = new CustomEvent("showToast", {
          detail: {
            message: favorited
              ? t("addedToFavorites", { title: deck.title })
              : t("removedFromFavorites", { title: deck.title }),
          },
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: t("favoriteError") },
      })
      window.dispatchEvent(event)
    }
  }

  const handleBrowseAll = () => {
    setShowBrowseModal(true)
    loadModalDecks(sortBy, filterCardCount)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    loadModalDecks(newSort, filterCardCount)
  }

  const handleCardCountChange = (newCardCount: string) => {
    setFilterCardCount(newCardCount)
    loadModalDecks(sortBy, newCardCount)
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-3xl backdrop-blur-sm"></div>
        <div className="relative w-full max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted/20 rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted/20 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        {/* Background with gradient and blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-3xl backdrop-blur-sm border border-gray-700/30 shadow-2xl"></div>

        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 max-lg:flex-col max-lg:items-start max-lg:gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{t("title")}</h2>
              <p className="text-gray-300">{t("description")}</p>
            </div>
            <div className="flex items-center gap-3 max-lg:w-full max-lg:justify-start max-lg:flex-wrap">
              <UploadDeckModal onDeckUploaded={handleDeckUploaded} />
              <Button
                variant="ghost"
                className="bg-gray-800 hover:bg-gray-700 text-white hover:text-white border border-gray-600/30 max-lg:w-full"
                onClick={handleBrowseAll}
              >
                {t("browseAll")} <ChevronRightIcon />
              </Button>
            </div>
          </div>

          {/* Deck Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.slice(0, 6).map((deck, index) => (
              <Fragment key={deck.id}>
                <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden bg-gray-800/50 border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/50">
                  <div className="relative">
                    {/* Deck Preview Image */}
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 p-4">
                      <div className="grid grid-cols-4 gap-2 h-full">
                        {deck.images.slice(0, 8).map((image, index) => (
                          <div key={index} className="relative bg-white rounded-lg shadow-sm overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg?height=60&width=60"}
                              alt={`${deck.title} card ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedDeck(deck)
                                setShowPreviewModal(true)
                              }}
                              className="bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-500/50"
                            >
                              <EyeIcon />
                              <span className="ml-1">{t("preview")}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-white">{selectedDeck?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-4 gap-3 p-4">
                              {selectedDeck?.images.map((image, index) => (
                                <div
                                  key={index}
                                  className="aspect-square relative bg-white rounded-lg shadow-sm overflow-hidden"
                                >
                                  <Image
                                    src={image || "/placeholder.svg?height=100&width=100"}
                                    alt={`${selectedDeck.title} card ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="px-4 pb-4 space-y-3">
                              {/* Creator info */}
                              <div className="flex items-center gap-2">
                                {selectedDeck?.user?.avatar_url && (
                                  <Image
                                    src={selectedDeck.user.avatar_url || "/placeholder.svg"}
                                    alt={selectedDeck.user.username || "User"}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="text-xs text-gray-400">{t("createdBy")}</p>
                                  <p className="text-sm font-medium text-white">
                                    {selectedDeck?.user?.username || t("unknownUser")}
                                  </p>
                                </div>
                              </div>

                              {/* Stats grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                  <p className="text-xs text-gray-400 mb-1">{t("cards")}</p>
                                  <p className="text-lg font-semibold text-white">{selectedDeck?.cards_count || 16}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                  <p className="text-xs text-gray-400 mb-1">{t("likes")}</p>
                                  <p className="text-lg font-semibold text-white">{selectedDeck?.likes || 0}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                  <p className="text-xs text-gray-400 mb-1">{t("plays")}</p>
                                  <p className="text-lg font-semibold text-white">{selectedDeck?.plays || 0}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                  <p className="text-xs text-gray-400 mb-1">{t("created")}</p>
                                  <p className="text-sm font-semibold text-white">
                                    {selectedDeck?.created_at
                                      ? new Date(selectedDeck.created_at).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>

                              {/* Description if available */}
                              {selectedDeck?.description && (
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                  <p className="text-xs text-gray-400 mb-1">{t("description")}</p>
                                  <p className="text-sm text-gray-200">{selectedDeck.description}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2 p-4 border-t border-gray-600/30">
                              <Button
                                onClick={() => {
                                  setShowPreviewModal(false)
                                  handleSelectDeck(selectedDeck!)
                                }}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {t("playWithDeck")}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          onClick={() => handleSelectDeck(deck)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {t("playNow")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Deck Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">{deck.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {deck.cards_count || 16} {t("cards")}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            {deck.user?.avatar_url && (
                              <Image
                                src={deck.user.avatar_url || "/placeholder.svg?height=16&width=16"}
                                alt={deck.user.username || "User"}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                            )}
                            <span>{deck.user?.username || t("unknownUser")}</span>
                          </div>
                        </div>
                      </div>
                      {!deck.user_id && (
                        <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                          {t("official")}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => handleFavoriteToggle(deck, e)}
                          className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
                            deck.isFavorited ? "text-red-400" : "text-gray-300"
                          }`}
                        >
                          <HeartIcon filled={deck.isFavorited} />
                          <span>{deck.likes}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <UsersIcon />
                          <span>{deck.plays}</span>
                        </div>
                      </div>
                      <span className="text-xs">{new Date(deck.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {(index + 1) % 6 === 0 && index < decks.length - 1 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4">
                    <AdBanner adSlot="1234567890" adFormat="auto" className="flex justify-center" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Show All Decks Button */}
          {decks.length > 6 && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleBrowseAll}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
              >
                {t("showAllDecks")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Browse All Modal */}
      <Dialog open={showBrowseModal} onOpenChange={setShowBrowseModal}>
        <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[85vw] xl:w-[80vw] max-w-[1600px] max-h-[90vh] overflow-hidden bg-black/50 backdrop-blur-sm border-none p-0">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 shadow-2xl rounded-xl p-6 sm:p-8 h-full flex flex-col">
            <DialogHeader className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <DialogTitle className="text-2xl font-bold text-white">{t("allDecks")}</DialogTitle>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{t("sortBy")}:</span>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-auto bg-gray-700/50 border-gray-600/30 text-white focus:border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600/30">
                        <SelectItem value="recent" className="text-white hover:bg-gray-700">
                          {t("recentlyAdded")}
                        </SelectItem>
                        <SelectItem value="popular" className="text-white hover:bg-gray-700">
                          {t("mostPopular")}
                        </SelectItem>
                        <SelectItem value="favorites_desc" className="text-white hover:bg-gray-700">
                          {t("mostFavorited")}
                        </SelectItem>
                        <SelectItem value="favorites_asc" className="text-white hover:bg-gray-700">
                          {t("leastFavorited")}
                        </SelectItem>
                        <SelectItem value="plays_desc" className="text-white hover:bg-gray-700">
                          {t("mostPlayed")}
                        </SelectItem>
                        <SelectItem value="plays_asc" className="text-white hover:bg-gray-700">
                          {t("leastPlayed")}
                        </SelectItem>
                        <SelectItem value="oldest" className="text-white hover:bg-gray-700">
                          {t("oldestFirst")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Card Count Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{t("cards")}:</span>
                    <Select value={filterCardCount} onValueChange={handleCardCountChange}>
                      <SelectTrigger className="w-auto bg-gray-700/50 border-gray-600/30 text-white focus:border-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600/30">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">
                          {t("allCards")}
                        </SelectItem>
                        <SelectItem value="16" className="text-white hover:bg-gray-700">
                          16 {t("cards")}
                        </SelectItem>
                        <SelectItem value="24" className="text-white hover:bg-gray-700">
                          24 {t("cards")}
                        </SelectItem>
                        <SelectItem value="32" className="text-white hover:bg-gray-700">
                          32 {t("cards")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {modalLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse text-gray-300">{t("loadingDecks")}</div>
                </div>
              ) : modalDecks.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <p className="text-lg mb-2">{t("noDecks")}</p>
                    <p className="text-sm">{t("adjustFilters")}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 pb-4">
                  {modalDecks.map((deck, index) => (
                    <Fragment key={deck.id}>
                      <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden bg-gray-800/50 border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/50">
                        <div className="relative">
                          {/* Deck Preview Image */}
                          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 p-5">
                            <div className="grid grid-cols-4 gap-2 h-full">
                              {deck.images.slice(0, 8).map((image, index) => (
                                <div key={index} className="relative bg-white rounded-lg shadow-sm overflow-hidden">
                                  <Image
                                    src={image || "/placeholder.svg?height=60&width=60"}
                                    alt={`${deck.title} card ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                              <Dialog open={showBrowsePreviewModal} onOpenChange={setShowBrowsePreviewModal}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setSelectedDeck(deck)
                                      setShowBrowsePreviewModal(true)
                                    }}
                                    className="bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-500/50"
                                  >
                                    <EyeIcon />
                                    <span className="ml-1">{t("preview")}</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 text-white">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">{selectedDeck?.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-4 gap-3 p-4">
                                    {selectedDeck?.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="aspect-square relative bg-white rounded-lg shadow-sm overflow-hidden"
                                      >
                                        <Image
                                          src={image || "/placeholder.svg?height=100&width=100"}
                                          alt={`${selectedDeck.title} card ${index + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="px-4 pb-4 space-y-3">
                                    {/* Creator info */}
                                    <div className="flex items-center gap-2">
                                      {selectedDeck?.user?.avatar_url && (
                                        <Image
                                          src={selectedDeck.user.avatar_url || "/placeholder.svg"}
                                          alt={selectedDeck.user.username || "User"}
                                          width={24}
                                          height={24}
                                          className="rounded-full"
                                        />
                                      )}
                                      <div>
                                        <p className="text-xs text-gray-400">{t("createdBy")}</p>
                                        <p className="text-sm font-medium text-white">
                                          {selectedDeck?.user?.username || t("unknownUser")}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-xs text-gray-400 mb-1">{t("cards")}</p>
                                        <p className="text-lg font-semibold text-white">
                                          {selectedDeck?.cards_count || 16}
                                        </p>
                                      </div>
                                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-xs text-gray-400 mb-1">{t("likes")}</p>
                                        <p className="text-lg font-semibold text-white">{selectedDeck?.likes || 0}</p>
                                      </div>
                                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-xs text-gray-400 mb-1">{t("plays")}</p>
                                        <p className="text-lg font-semibold text-white">{selectedDeck?.plays || 0}</p>
                                      </div>
                                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-xs text-gray-400 mb-1">{t("created")}</p>
                                        <p className="text-sm font-semibold text-white">
                                          {selectedDeck?.created_at
                                            ? new Date(selectedDeck.created_at).toLocaleDateString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Description if available */}
                                    {selectedDeck?.description && (
                                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-xs text-gray-400 mb-1">{t("description")}</p>
                                        <p className="text-sm text-gray-200">{selectedDeck.description}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-end gap-2 p-4 border-t border-gray-600/30">
                                    <Button
                                      onClick={() => {
                                        setShowBrowsePreviewModal(false)
                                        setShowBrowseModal(false)
                                        handleSelectDeck(selectedDeck!)
                                      }}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      {t("playWithDeck")}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                onClick={() => {
                                  handleSelectDeck(deck)
                                  setShowBrowseModal(false)
                                }}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {t("playNow")}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-5">
                          {/* Deck Info */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">{deck.title}</h3>
                              <p className="text-sm text-gray-400 mb-2">
                                {deck.cards_count || 16} {t("cards")}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  {deck.user?.avatar_url && (
                                    <Image
                                      src={deck.user.avatar_url || "/placeholder.svg"}
                                      alt={deck.user.username || "User"}
                                      width={16}
                                      height={16}
                                      className="rounded-full"
                                    />
                                  )}
                                  <span>{deck.user?.username || t("unknownUser")}</span>
                                </div>
                              </div>
                            </div>
                            {!deck.user_id && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-primary/20 text-primary border-primary/30"
                              >
                                {t("official")}
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-300">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={(e) => handleFavoriteToggle(deck, e)}
                                className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
                                  deck.isFavorited ? "text-red-400" : "text-gray-300"
                                }`}
                              >
                                <HeartIcon filled={deck.isFavorited} />
                                <span>{deck.likes}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <UsersIcon />
                                <span>{deck.plays}</span>
                              </div>
                            </div>
                            <span className="text-xs">{new Date(deck.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {(index + 1) % 6 === 0 && index < modalDecks.length - 1 && (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 my-4">
                          <AdBanner adSlot="1234567890" adFormat="auto" className="flex justify-center" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
    </>
  )
}

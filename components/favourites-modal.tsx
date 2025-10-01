"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Modal } from "@/components/modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { useTranslations } from "next-intl"

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
}

interface FavouritesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FavouritesModal({ isOpen, onClose }: FavouritesModalProps) {
  const [favouriteDecks, setFavouriteDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCardCount, setSelectedCardCount] = useState<string>("all")
  const { user } = useAuth()
  const t = useTranslations("favouritesModal")

  useEffect(() => {
    if (isOpen && user) {
      loadFavouriteDecks()
    }
  }, [isOpen, user])

  const loadFavouriteDecks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/decks/favorites")
      if (response.ok) {
        const { decks } = await response.json()
        setFavouriteDecks(decks || [])
      } else {
        console.error("Failed to fetch favourite decks")
        setFavouriteDecks([])
      }
    } catch (error) {
      console.error("Error loading favourite decks:", error)
      setFavouriteDecks([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDecks =
    selectedCardCount === "all"
      ? favouriteDecks
      : favouriteDecks.filter((deck) => deck.cards_count === Number.parseInt(selectedCardCount))

  const availableCardCounts = [...new Set(favouriteDecks.map((deck) => deck.cards_count || 16))].sort()

  const handleSelectDeck = (deck: Deck) => {
    localStorage.setItem("selectedDeck", JSON.stringify(deck))
    window.dispatchEvent(new CustomEvent("deckSelected", { detail: deck }))

    onClose()
    window.scrollTo({ top: 0, behavior: "smooth" })

    const event = new CustomEvent("showToast", {
      detail: { message: t("selectedDeck", { title: deck.title }) },
    })
    window.dispatchEvent(event)
  }

  const handleUnfavorite = async (deck: Deck, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const response = await fetch(`/api/decks/${deck.id}/favorite`, {
        method: "POST",
      })

      if (response.ok) {
        setFavouriteDecks((prev) => prev.filter((d) => d.id !== deck.id))

        const event = new CustomEvent("showToast", {
          detail: { message: t("removedFromFavourites", { title: deck.title }) },
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error("Error removing favourite:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: t("failedToRemove") },
      })
      window.dispatchEvent(event)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="large">
      <div className="space-y-6">
        {!isLoading && favouriteDecks.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-300">{t("filterLabel")}</span>
            <Select value={selectedCardCount} onValueChange={setSelectedCardCount}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600/30">
                <SelectItem value="all" className="text-white hover:bg-gray-700">
                  {t("all")}
                </SelectItem>
                {availableCardCounts.map((count) => (
                  <SelectItem key={count} value={count.toString()} className="text-white hover:bg-gray-700">
                    {t("cards", { count })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700/30 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : favouriteDecks.length === 0 ? (
          <div className="text-center py-8">
            <HeartIcon />
            <p className="text-gray-400 mt-2">{t("noFavourites")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("noFavouritesDesc")}</p>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-8">
            <HeartIcon />
            <p className="text-gray-400 mt-2">{t("noMatchingCards", { count: selectedCardCount })}</p>
            <p className="text-sm text-gray-500 mt-1">{t("noMatchingCardsDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-5 max-h-[600px] overflow-y-auto pr-2">
            {filteredDecks.map((deck) => (
              <Card
                key={deck.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50"
                onClick={() => handleSelectDeck(deck)}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-2 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-1 h-full">
                        {deck.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="relative bg-white rounded-sm overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg?height=30&width=30"}
                              alt={t("imageAlt", { deckName: deck.title, index: index + 1 })}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{deck.title}</h3>
                          <p className="text-sm text-gray-400">{t("cards", { count: deck.cards_count || 16 })}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {!deck.user_id && (
                            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                              {t("official")}
                            </Badge>
                          )}
                          <button
                            onClick={(e) => handleUnfavorite(deck, e)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <HeartIcon filled />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <HeartIcon filled />
                            <span>{deck.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UsersIcon />
                            <span>{deck.plays}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectDeck(deck)
                          }}
                          className="bg-primary hover:bg-primary/90 text-xs"
                        >
                          {t("playNow")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

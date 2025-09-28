"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ImageIcon, Lock, Globe, Heart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Deck {
  id: string
  title: string
  images: string[]
  cards_count: number
  is_public: boolean
  isOwned?: boolean
  isFavorited?: boolean
  user?: {
    username: string
    avatar_url?: string
  }
}

interface DeckSelectorProps {
  selectedDeckId: string
  onDeckChange: (deckId: string, deck: Deck | null) => void
  cardCount: number
  className?: string
}

export function DeckSelector({ selectedDeckId, onDeckChange, cardCount, className }: DeckSelectorProps) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const response = await fetch("/api/decks/accessible")
      if (response.ok) {
        const data = await response.json()
        setDecks(data.decks || [])
      } else {
        console.error("Failed to fetch decks")
        setDecks([])
      }
    } catch (error) {
      console.error("Error fetching decks:", error)
      setDecks([])
    } finally {
      setLoading(false)
    }
  }

  const favoriteDecks = decks.filter((deck) => deck.isFavorited && deck.cards_count === cardCount)
  const compatibleDecks = decks.filter((deck) => !deck.isFavorited && deck.cards_count === cardCount)
  const incompatibleDecks = decks.filter((deck) => deck.cards_count !== cardCount)

  const handleDeckChange = (deckId: string) => {
    const selectedDeck = decks.find((deck) => deck.id === deckId)
    onDeckChange(deckId, selectedDeck || null)
  }

  const getDeckDisplayName = (deck: Deck) => {
    const prefix = deck.isOwned ? "My: " : ""
    const suffix = deck.is_public ? "" : " (Private)"
    return `${prefix}${deck.title}${suffix}`
  }

  const getDeckIcon = (deck: Deck) => {
    if (deck.isOwned && !deck.is_public) {
      return <Lock className="w-3 h-3 text-gray-400" />
    }
    if (deck.is_public) {
      return <Globe className="w-3 h-3 text-green-400" />
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-white" />
        <span className="text-white text-sm">Deck Style:</span>
        <div className="rounded-lg px-3 py-2 bg-gray-800 text-white border-gray-600/30 min-w-[150px] animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ImageIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm">Deck Style:</span>
      <Select value={selectedDeckId} onValueChange={handleDeckChange}>
        <SelectTrigger className="rounded-lg px-3 py-2 bg-gray-800 text-white hover:bg-gray-700 border-gray-600/30 min-w-[150px]">
          <SelectValue />
          <ChevronDown className="w-4 h-4" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600/30 max-h-60">
          {user && (
            <>
              {favoriteDecks.length > 0 ? (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Favorites</div>
                  {favoriteDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id} className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2 w-full">
                        <Heart className="w-3 h-3 text-red-400 fill-current" />
                        <span className="truncate">{getDeckDisplayName(deck)}</span>
                        <span className="text-xs text-gray-400 ml-auto">{deck.cards_count}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="h-px bg-gray-600/30 my-1" />
                </>
              ) : (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Favorites</div>
                  <div className="px-2 py-2 text-xs text-gray-500">No favorited decks with {cardCount} cards</div>
                  <div className="h-px bg-gray-600/30 my-1" />
                </>
              )}
            </>
          )}

          {!user && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Favorites</div>
              <div className="px-2 py-2 text-xs text-gray-500">Log in to save and play with favorited decks</div>
              <div className="h-px bg-gray-600/30 my-1" />
            </>
          )}

          {/* Compatible decks */}
          {compatibleDecks.length > 0 && (
            <>
              {compatibleDecks.map((deck) => (
                <SelectItem key={deck.id} value={deck.id} className="text-white hover:bg-gray-700">
                  <div className="flex items-center gap-2 w-full">
                    {getDeckIcon(deck)}
                    <span className="truncate">{getDeckDisplayName(deck)}</span>
                    <span className="text-xs text-gray-400 ml-auto">{deck.cards_count}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}

          {/* Incompatible decks (disabled) */}
          {incompatibleDecks.length > 0 && (
            <>
              {incompatibleDecks.map((deck) => (
                <SelectItem
                  key={deck.id}
                  value={deck.id}
                  disabled
                  className="text-gray-500 hover:bg-gray-800 opacity-50"
                >
                  <div className="flex items-center gap-2 w-full">
                    {getDeckIcon(deck)}
                    <span className="truncate">{getDeckDisplayName(deck)}</span>
                    <span className="text-xs text-gray-500 ml-auto">{deck.cards_count}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}

          {decks.length === 0 && (
            <SelectItem value="no-decks" disabled className="text-gray-500">
              No decks available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

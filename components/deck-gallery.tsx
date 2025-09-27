"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UploadDeckModal } from "@/components/upload-deck-modal"
import Image from "next/image"

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
}

const defaultDecks: Deck[] = [
  {
    id: "default-1",
    title: "Classic Animals",
    images: [
      "/cute-cat.png",
      "/happy-golden-retriever.png",
      "/majestic-african-elephant.png",
      "/lion.jpg",
      "/solitary-penguin.png",
      "/butterfly.png",
      "/fluffy-brown-rabbit.png",
      "/majestic-owl.png",
    ],
    user_id: "system",
    is_public: true,
    created_at: new Date().toISOString(),
    cards_count: 16,
    user: { username: "PexesoAI", avatar_url: "/images/pexeso-logo.png" },
    likes: 1247,
    plays: 5832,
  },
  {
    id: "default-2",
    title: "Space Adventure",
    images: [
      "/rocket-ship.jpg",
      "/planet-earth.png",
      "/astronaut-contemplating.png",
      "/full-moon-night.png",
      "/night-sky-stars.png",
      "/earth-orbiting-satellite.png",
      "/otherworldly-visitor.png",
      "/futuristic-space-station.png",
    ],
    user_id: "system",
    is_public: true,
    created_at: new Date().toISOString(),
    cards_count: 16,
    user: { username: "PexesoAI", avatar_url: "/images/pexeso-logo.png" },
    likes: 892,
    plays: 3421,
  },
  {
    id: "default-3",
    title: "Ocean Life",
    images: [
      "/playful-dolphin.png",
      "/whimsical-seahorse.png",
      "/starfish.jpg",
      "/majestic-whale.png",
      "/octopus.jpg",
      "/vibrant-coral-reef.png",
      "/serene-sea-turtle.png",
      "/glowing-jellyfish.png",
    ],
    user_id: "system",
    is_public: true,
    created_at: new Date().toISOString(),
    cards_count: 16,
    user: { username: "PexesoAI", avatar_url: "/images/pexeso-logo.png" },
    likes: 634,
    plays: 2156,
  },
]

export function DeckGallery() {
  const [decks, setDecks] = useState<Deck[]>(defaultDecks)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      const response = await fetch("/api/decks")
      if (response.ok) {
        const { decks: supabaseDecks } = await response.json()
        // Combine default decks with Supabase decks
        setDecks([...defaultDecks, ...supabaseDecks])
      } else {
        // Fallback to default decks if API fails
        setDecks(defaultDecks)
      }
    } catch (error) {
      console.error("Error loading decks:", error)
      setDecks(defaultDecks)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectDeck = (deck: Deck) => {
    // Store selected deck in localStorage for the game to use
    localStorage.setItem("selectedDeck", JSON.stringify(deck))
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("deckSelected", { detail: deck }))

    // Show feedback to user
    const event = new CustomEvent("showToast", {
      detail: { message: `Selected "${deck.title}" deck for your next game!` },
    })
    window.dispatchEvent(event)
  }

  const handleDeckUploaded = () => {
    loadDecks()
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
    <div className="relative">
      {/* Background with gradient and blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-3xl backdrop-blur-sm border border-gray-700/30 shadow-2xl"></div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Deck Gallery</h2>
            <p className="text-gray-300">
              Explore decks created by the community and choose your favorite to play with.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UploadDeckModal onDeckUploaded={handleDeckUploaded} />
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-gray-700/50 border border-gray-600/30"
            >
              Browse All <ChevronRightIcon />
            </Button>
          </div>
        </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden bg-gray-800/50 border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/50"
            >
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedDeck(deck)}
                          className="bg-gray-700/80 hover:bg-gray-600/80 text-white border-gray-500/50"
                        >
                          <EyeIcon />
                          <span className="ml-1">Preview</span>
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
                        <div className="flex justify-end gap-2 p-4 border-t border-gray-600/30">
                          <Button
                            onClick={() => handleSelectDeck(selectedDeck!)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Play with this Deck
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" onClick={() => handleSelectDeck(deck)} className="bg-primary hover:bg-primary/90">
                      Play Now
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Deck Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">{deck.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{deck.cards_count || 16} cards</p>
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
                        <span>{deck.user?.username || "Anonymous"}</span>
                      </div>
                    </div>
                  </div>
                  {deck.user_id === "system" && (
                    <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                      Official
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <HeartIcon />
                      <span>{deck.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon />
                      <span>{deck.plays}</span>
                    </div>
                  </div>
                  <span className="text-xs">{new Date(deck.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

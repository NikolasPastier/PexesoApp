"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, User } from "lucide-react"

interface DeckItem {
  id: string
  title: string
  thumbnail: string
  creator: string
  cardCount: number
}

interface GalleryGridProps {
  decks: DeckItem[]
  onPlayDeck?: (deckId: string) => void
}

export function GalleryGrid({ decks, onPlayDeck }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {decks.map((deck) => (
        <Card
          key={deck.id}
          className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border-border"
        >
          <CardContent className="p-0">
            <div className="aspect-square overflow-hidden rounded-t-2xl">
              <img
                src={deck.thumbnail || "/placeholder.svg"}
                alt={deck.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </CardContent>
          <CardFooter className="p-4 space-y-3">
            <div className="w-full">
              <h3 className="font-semibold text-card-foreground text-lg mb-2 line-clamp-2">{deck.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{deck.creator}</span>
                <span className="mx-2">•</span>
                <span>{deck.cardCount} cards</span>
              </div>
              <Button className="w-full" onClick={() => onPlayDeck?.(deck.id)}>
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

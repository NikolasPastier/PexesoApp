"use client"

import { useState, useEffect } from "react"
import { MemoryCard } from "./memory-card"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw } from "lucide-react"
import Link from "next/link"

interface HeroCard {
  id: string
  image: string
  matched: boolean
}

// Simple demo cards for hero section
const demoImages = ["/red-apple.png", "/blue-butterfly.jpg", "/green-tree.jpg"]

const generateDemoCards = () => {
  const cards: HeroCard[] = []
  for (let i = 0; i < 3; i++) {
    const image = demoImages[i]
    cards.push({ id: `${i}-a`, image, matched: false }, { id: `${i}-b`, image, matched: false })
  }
  return cards.sort(() => Math.random() - 0.5)
}

export function HeroGame() {
  const [cards, setCards] = useState<HeroCard[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedCards, setMatchedCards] = useState<string[]>([])
  const [gameComplete, setGameComplete] = useState(false)

  useEffect(() => {
    setCards(generateDemoCards())
  }, [])

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
      return
    }

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      const [firstCard, secondCard] = newFlippedCards
      const firstCardData = cards.find((card) => card.id === firstCard)
      const secondCardData = cards.find((card) => card.id === secondCard)

      if (firstCardData?.image === secondCardData?.image) {
        // Match found
        setTimeout(() => {
          setMatchedCards((prev) => [...prev, firstCard, secondCard])
          setFlippedCards([])
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([])
        }, 1500)
      }
    }
  }

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameComplete(true)
    }
  }, [matchedCards.length, cards.length])

  const handleRestart = () => {
    setCards(generateDemoCards())
    setFlippedCards([])
    setMatchedCards([])
    setGameComplete(false)
  }

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
          Master Your Memory with <span className="text-primary">Pexeso</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Challenge your brain with our interactive memory card game. Flip cards, find matches, and improve your
          cognitive skills.
        </p>
      </div>

      {/* Demo Game */}
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Try it now!</h3>
          <p className="text-sm text-muted-foreground">Find all 3 matching pairs</p>
        </div>

        {gameComplete && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-xl">
            <p className="text-primary font-semibold">🎉 Well done! You found all matches!</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 justify-items-center mb-6">
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              id={card.id}
              frontImage={card.image}
              isFlipped={flippedCards.includes(card.id) || matchedCards.includes(card.id)}
              isMatched={matchedCards.includes(card.id)}
              onClick={() => handleCardClick(card.id)}
              className="w-20 h-20 sm:w-24 sm:h-24"
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRestart} size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Demo
          </Button>
          <Button asChild size="sm">
            <Link href="/play">
              <Play className="w-4 h-4 mr-2" />
              Play Full Game
            </Link>
          </Button>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link href="/play">
            <Play className="w-5 h-5 mr-2" />
            Start Playing
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
          <Link href="/gallery">Browse Card Decks</Link>
        </Button>
      </div>
    </div>
  )
}

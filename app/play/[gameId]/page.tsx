"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { GameBoard } from "@/components/game-board"

interface GameConfig {
  mode: string
  pairs: number
  timer?: number
  lives?: number
  special?: string
}

// Mock game data generator
const generateMockCards = (pairs: number) => {
  const images = [
    "/red-apple.jpg",
    "/blue-butterfly.jpg",
    "/green-tree.jpg",
    "/yellow-sun.jpg",
    "/purple-flower.jpg",
    "/orange-cat.jpg",
    "/pink-heart.jpg",
    "/brown-dog.jpg",
    "/white-cloud.jpg",
    "/black-star.jpg",
    "/gray-moon.jpg",
    "/cyan-fish.jpg",
    "/magenta-rose.jpg",
    "/lime-leaf.jpg",
    "/navy-ocean.jpg",
    "/gold-coin.jpg",
    "/silver-ring.jpg",
    "/bronze-medal.jpg",
    "/coral-shell.jpg",
    "/teal-gem.jpg",
    "/indigo-crystal.jpg",
    "/amber-honey.jpg",
    "/jade-stone.jpg",
    "/ruby-jewel.jpg",
    "/sapphire-blue.jpg",
    "/emerald-green.jpg",
    "/diamond-white.jpg",
    "/pearl-cream.jpg",
    "/opal-rainbow.jpg",
    "/topaz-yellow.jpg",
  ]

  const cards = []
  for (let i = 0; i < pairs; i++) {
    const image = images[i % images.length]
    // Create pairs
    cards.push({ id: `${i}-a`, image, matched: false }, { id: `${i}-b`, image, matched: false })
  }

  // Shuffle cards
  return cards.sort(() => Math.random() - 0.5)
}

export default function GamePage({ params }: { params: { gameId: string } }) {
  const router = useRouter()
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    const savedConfig = localStorage.getItem("gameConfig")
    if (savedConfig) {
      const config = JSON.parse(savedConfig) as GameConfig
      setGameConfig(config)
      setCards(generateMockCards(config.pairs))
    } else {
      // Fallback to demo mode
      const defaultConfig = { mode: "demo", pairs: 8 }
      setGameConfig(defaultConfig)
      setCards(generateMockCards(8))
    }
  }, [])

  const handleRestart = () => {
    if (gameConfig) {
      setCards(generateMockCards(gameConfig.pairs))
    }
  }

  const handleExit = () => {
    router.push("/play")
  }

  if (!gameConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-lg">Loading game...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {gameConfig.mode.charAt(0).toUpperCase() + gameConfig.mode.slice(1)} Mode
          </h1>
          <p className="text-muted-foreground">Find all matching pairs to complete the game</p>

          <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>Pairs: {gameConfig.pairs}</span>
            {gameConfig.timer && (
              <span>
                Timer: {Math.floor(gameConfig.timer / 60)}:{(gameConfig.timer % 60).toString().padStart(2, "0")}
              </span>
            )}
            {gameConfig.lives && <span>Lives: {gameConfig.lives}</span>}
          </div>
        </div>

        <GameBoard cards={cards} onRestart={handleRestart} onExit={handleExit} gameConfig={gameConfig} />
      </div>
    </div>
  )
}

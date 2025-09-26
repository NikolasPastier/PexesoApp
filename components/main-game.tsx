"use client"

import { useState } from "react"
import { GameBoard } from "./game-board"

// Mock game data generator
const generateMockCards = (pairs: number) => {
  const images = [
    "/red-apple.png",
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

export function MainGame() {
  const [gameStarted, setGameStarted] = useState(true)
  const [cards, setCards] = useState<any[]>(() => generateMockCards(12)) // 12 pairs = 24 cards for 4x6 grid
  const [gameConfig] = useState({
    mode: "standard",
    pairs: 12,
  })

  const handleRestart = () => {
    setCards(generateMockCards(12))
  }

  const handleExit = () => {
    // Reset the game
    setCards(generateMockCards(12))
  }

  return (
    <div className="space-y-8">
      

      <GameBoard cards={cards} onRestart={handleRestart} onExit={handleExit} gameConfig={gameConfig} />
    </div>
  )
}

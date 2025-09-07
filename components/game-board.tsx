"use client"

import { useState, useEffect } from "react"
import { MemoryCard } from "./memory-card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Home, Heart, Clock } from "lucide-react"

interface GameCard {
  id: string
  image: string
  matched: boolean
}

interface GameConfig {
  mode: string
  pairs: number
  timer?: number
  lives?: number
  special?: string
}

interface GameBoardProps {
  cards: GameCard[]
  onRestart?: () => void
  onExit?: () => void
  gameConfig?: GameConfig
}

export function GameBoard({ cards, onRestart, onExit, gameConfig }: GameBoardProps) {
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedCards, setMatchedCards] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [timeLeft, setTimeLeft] = useState(gameConfig?.timer || 0)
  const [livesLeft, setLivesLeft] = useState(gameConfig?.lives || 0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (gameConfig?.timer && timeLeft > 0 && !gameComplete && !gameOver) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameConfig?.timer && timeLeft === 0 && !gameComplete) {
      setGameOver(true)
    }
  }, [timeLeft, gameComplete, gameOver, gameConfig?.timer])

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId) || gameOver) {
      return
    }

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

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
        // No match - deduct life if lives are enabled
        if (gameConfig?.lives && livesLeft > 0) {
          setLivesLeft((prev) => {
            const newLives = prev - 1
            if (newLives === 0) {
              setGameOver(true)
            }
            return newLives
          })
        }

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

  const gridCols = cards.length <= 12 ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4 sm:grid-cols-6"

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Game Stats */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-card-foreground">Moves: {moves}</div>
          <div className="text-lg font-semibold text-card-foreground">
            Matches: {matchedCards.length / 2} / {cards.length / 2}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {gameConfig?.timer && (
            <div
              className={`flex items-center gap-2 text-lg font-semibold ${timeLeft < 30 ? "text-destructive" : "text-card-foreground"}`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
          {gameConfig?.lives && (
            <div
              className={`flex items-center gap-2 text-lg font-semibold ${livesLeft <= 1 ? "text-destructive" : "text-card-foreground"}`}
            >
              <Heart className="w-5 h-5" />
              {livesLeft}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
          <Button variant="outline" size="sm" onClick={onExit}>
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>

      {/* Game Complete Message */}
      {gameComplete && (
        <div className="text-center mb-6 p-6 bg-primary/10 border border-primary rounded-2xl">
          <h2 className="text-2xl font-bold text-primary mb-2">Congratulations! 🎉</h2>
          <p className="text-foreground">You completed the game in {moves} moves!</p>
          {gameConfig?.timer && <p className="text-muted-foreground">Time remaining: {formatTime(timeLeft)}</p>}
        </div>
      )}

      {gameOver && (
        <div className="text-center mb-6 p-6 bg-destructive/10 border border-destructive rounded-2xl">
          <h2 className="text-2xl font-bold text-destructive mb-2">Game Over!</h2>
          <p className="text-foreground">{timeLeft === 0 ? "Time's up!" : "No lives remaining!"}</p>
          <p className="text-muted-foreground">
            You matched {matchedCards.length / 2} out of {cards.length / 2} pairs
          </p>
        </div>
      )}

      {/* Game Grid */}
      <div className={`grid ${gridCols} gap-4 justify-items-center`}>
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            id={card.id}
            frontImage={card.image}
            isFlipped={flippedCards.includes(card.id) || matchedCards.includes(card.id)}
            isMatched={matchedCards.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  )
}

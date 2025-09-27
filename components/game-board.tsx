"use client"

import { useState, useEffect } from "react"
import { MemoryCard } from "./memory-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Settings, ChevronDown, Users, Timer, Grid3X3, Palette } from "lucide-react"

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
  const [gameStatus, setGameStatus] = useState<"idle" | "running">("idle")

  const [gameSettings, setGameSettings] = useState({
    players: "1",
    timer: "unlimited",
    lives: "unlimited",
    cards: "16",
    deckStyle: "classic", // Added deck style option
  })

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
    if (
      gameStatus !== "running" ||
      flippedCards.length === 2 ||
      flippedCards.includes(cardId) ||
      matchedCards.includes(cardId) ||
      gameOver
    ) {
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

  const handleStartGame = () => {
    setGameStatus("running")
    setMoves(0)
    setFlippedCards([])
    setMatchedCards([])
    setGameComplete(false)
    setGameOver(false)
    setTimeLeft(gameConfig?.timer || 0)
    setLivesLeft(gameConfig?.lives || 0)
  }

  const handleEndGame = () => {
    setGameStatus("idle")
    setGameOver(true)
    setFlippedCards([])
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 px-4">
      {/* Game Stats */}
      <div className="relative mb-6">
        {/* Background with gradient and blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/30 shadow-2xl"></div>

        {/* Content */}
        <div className="relative flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/30"
                >
                  <Settings className="w-4 h-4" />
                  Game Settings
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Players
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={gameSettings.players}
                  onValueChange={(value) => setGameSettings((prev) => ({ ...prev, players: value }))}
                >
                  <DropdownMenuRadioItem value="1">1 Player</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2 Players</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="3">3 Players</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="4">4 Players (vs Bot)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Timer
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={gameSettings.timer}
                  onValueChange={(value) => setGameSettings((prev) => ({ ...prev, timer: value }))}
                >
                  <DropdownMenuRadioItem value="unlimited">Unlimited</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2 Minutes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="5">5 Minutes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="10">10 Minutes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="custom">Custom</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Lives
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={gameSettings.lives}
                  onValueChange={(value) => setGameSettings((prev) => ({ ...prev, lives: value }))}
                >
                  <DropdownMenuRadioItem value="unlimited">Unlimited</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="10">10 Lives</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="15">15 Lives</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="20">20 Lives</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="custom">Custom</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Cards
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={gameSettings.cards}
                  onValueChange={(value) => setGameSettings((prev) => ({ ...prev, cards: value }))}
                >
                  <DropdownMenuRadioItem value="8">8 Cards (4 pairs)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="16">16 Cards (8 pairs)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="24">24 Cards (12 pairs)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="32">32 Cards (16 pairs)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Deck Style
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={gameSettings.deckStyle}
                  onValueChange={(value) => setGameSettings((prev) => ({ ...prev, deckStyle: value }))}
                >
                  <DropdownMenuRadioItem value="classic">Classic Animals</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="space">Space Adventure</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ocean">Ocean Life</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="custom">Custom Deck</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end">
            {gameStatus === "idle" && (
              <button
                onClick={handleStartGame}
                className="px-4 py-2 rounded-lg shadow-md bg-green-500 text-white hover:bg-green-600 transition"
              >
                Start Game
              </button>
            )}
            {gameStatus === "running" && (
              <button
                onClick={() => {
                  handleEndGame()
                  setGameStatus("idle")
                }}
                className="px-4 py-2 rounded-lg shadow-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                End Game
              </button>
            )}
          </div>
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
      <div className={`grid mx-0 px-0 ${gridCols} justify-items-center gap-4`}>
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

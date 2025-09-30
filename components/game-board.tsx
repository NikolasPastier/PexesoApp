"use client"

import { useState, useEffect, useRef } from "react"
import { MemoryCard } from "./memory-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { DeckSelector } from "./deck-selector"
import { useTranslations } from "next-intl"

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

interface PlayerStats {
  name: string
  matchesCompleted: number
  matchesRemaining: number
  movesUsed: number
  movesRemaining?: number
  timeUsed?: number
  timeRemaining?: number
}

interface GameBoardProps {
  onRestart?: () => void
  onExit?: () => void
  gameConfig?: GameConfig
}

interface Deck {
  id: string
  title: string
  images: string[]
  cards_count: number
  is_public: boolean
  user?: {
    username: string
    avatar_url?: string
  }
}

interface BotMemory {
  cardId: string
  image: string
  remembered: boolean
}

export function GameBoard({ onRestart, onExit, gameConfig }: GameBoardProps) {
  const [gameStatus, setGameStatus] = useState<"idle" | "running">("idle")
  const [players, setPlayers] = useState<"solo" | "two" | "bot">("solo")
  const [timer, setTimer] = useState<number | "unlimited">("unlimited")
  const [matches, setMatches] = useState<number | "unlimited">("unlimited")
  const [cardCount, setCardCount] = useState<number>(24)
  const [customTimerValue, setCustomTimerValue] = useState<number>(15)
  const [customMatchesValue, setCustomMatchesValue] = useState<number>(10)
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [showEndModal, setShowEndModal] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)

  const [gameCards, setGameCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedCards, setMatchedCards] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [deckImages, setDeckImages] = useState<string[]>([])
  const [defaultDecks, setDefaultDecks] = useState<Deck[]>([])

  const botMemoryRef = useRef<Map<string, string>>(new Map())
  const botMemoryRetentionRate = useRef<number>(0.3 + Math.random() * 0.2) // 30-50% retention
  const maxBotMemorySize = useRef<number>(8 + Math.floor(Math.random() * 5)) // 8-12 cards max

  const t = useTranslations("game")
  const tCommon = useTranslations("common")

  useEffect(() => {
    const loadDefaultDecks = async () => {
      try {
        const response = await fetch("/api/decks/accessible")
        if (response.ok) {
          const data = await response.json()
          const decks = data.decks || []
          setDefaultDecks(decks)

          const classicAnimals = decks.find((deck: Deck) => deck.title === "Classic Animals")
          if (classicAnimals) {
            setSelectedDeckId(classicAnimals.id)
            setSelectedDeck(classicAnimals)
            setDeckImages(classicAnimals.images)
            setCardCount(classicAnimals.cards_count) // Auto-set card count based on selected deck
            setGameCards([]) // Clear existing game cards
          }
        }
      } catch (error) {
        console.error("Error loading default decks:", error)
      }
    }

    loadDefaultDecks()
  }, [])

  useEffect(() => {
    const handleDeckSelected = (event: CustomEvent) => {
      const deck = event.detail
      setSelectedDeckId(deck.id)
      setSelectedDeck(deck)

      if (deck.cards_count) {
        setCardCount(deck.cards_count)
        setGameCards([]) // Clear existing game cards
      }

      if (deck.images) {
        setDeckImages(deck.images)
      }

      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    window.addEventListener("deckSelected", handleDeckSelected as EventListener)
    return () => {
      window.removeEventListener("deckSelected", handleDeckSelected as EventListener)
    }
  }, [])

  useEffect(() => {
    if (gameStatus === "running" && typeof timer === "number" && timeLeft > 0 && !gameComplete && !gameOver) {
      const timerInterval = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timerInterval)
    } else if (gameStatus === "running" && typeof timer === "number" && timeLeft === 0 && !gameComplete) {
      handleGameEnd()
    }
  }, [timeLeft, gameComplete, gameOver, gameStatus, timer])

  useEffect(() => {
    if (gameStatus === "running" && players === "bot" && currentPlayer === 1 && !gameComplete && !gameOver) {
      const botDelay = setTimeout(
        () => {
          const availableCards = gameCards.filter(
            (card) => !matchedCards.includes(card.id) && !flippedCards.includes(card.id),
          )

          if (availableCards.length > 0 && flippedCards.length < 2) {
            // Bot's first card flip
            if (flippedCards.length === 0) {
              // Check if bot remembers any pairs
              const rememberedPairs: { card1: string; card2: string }[] = []
              const memoryEntries = Array.from(botMemoryRef.current.entries())

              for (let i = 0; i < memoryEntries.length; i++) {
                for (let j = i + 1; j < memoryEntries.length; j++) {
                  if (memoryEntries[i][1] === memoryEntries[j][1]) {
                    const card1 = memoryEntries[i][0]
                    const card2 = memoryEntries[j][0]
                    if (!matchedCards.includes(card1) && !matchedCards.includes(card2)) {
                      rememberedPairs.push({ card1, card2 })
                    }
                  }
                }
              }

              // If bot remembers a pair, use it (80% of the time to simulate imperfect recall)
              if (rememberedPairs.length > 0 && Math.random() > 0.2) {
                const pair = rememberedPairs[Math.floor(Math.random() * rememberedPairs.length)]
                handleCardClick(pair.card1)
              } else {
                // Otherwise, flip a random card
                const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
                handleCardClick(randomCard.id)
              }
            }
            // Bot's second card flip (after 1-2 second delay)
            else if (flippedCards.length === 1) {
              const firstFlippedId = flippedCards[0]
              const firstFlippedCard = gameCards.find((card) => card.id === firstFlippedId)

              if (firstFlippedCard) {
                // Check if bot remembers the match for this card
                const rememberedMatch = Array.from(botMemoryRef.current.entries()).find(
                  ([cardId, image]) =>
                    cardId !== firstFlippedId &&
                    image === firstFlippedCard.image &&
                    !matchedCards.includes(cardId) &&
                    !flippedCards.includes(cardId),
                )

                // If bot remembers the match, flip it (70% of the time to simulate forgetting)
                if (rememberedMatch && Math.random() > 0.3) {
                  handleCardClick(rememberedMatch[0])
                } else {
                  // Otherwise, flip a random unseen card
                  const unseenCards = availableCards.filter((card) => !botMemoryRef.current.has(card.id))
                  const cardToFlip =
                    unseenCards.length > 0
                      ? unseenCards[Math.floor(Math.random() * unseenCards.length)]
                      : availableCards[Math.floor(Math.random() * availableCards.length)]

                  handleCardClick(cardToFlip.id)
                }
              }
            }
          }
        },
        flippedCards.length === 0 ? 800 + Math.random() * 400 : 1000 + Math.random() * 1000, // Natural delay
      )

      return () => clearTimeout(botDelay)
    }
  }, [currentPlayer, gameStatus, players, flippedCards, matchedCards, gameComplete, gameOver, gameCards])

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

    if (players === "bot" && currentPlayer === 1) {
      const card = gameCards.find((c) => c.id === cardId)
      if (card) {
        if (Math.random() < botMemoryRetentionRate.current) {
          botMemoryRef.current.set(cardId, card.image)

          if (botMemoryRef.current.size > maxBotMemorySize.current) {
            const firstKey = botMemoryRef.current.keys().next().value
            botMemoryRef.current.delete(firstKey)
          }

          if (Math.random() < 0.1 && botMemoryRef.current.size > 2) {
            const keys = Array.from(botMemoryRef.current.keys())
            const randomKey = keys[Math.floor(Math.random() * keys.length)]
            botMemoryRef.current.delete(randomKey)
          }
        }
      }
    }

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

      const [firstCard, secondCard] = newFlippedCards
      const firstCardData = gameCards.find((card) => card.id === firstCard)
      const secondCardData = gameCards.find((card) => card.id === secondCard)

      if (firstCardData?.image === secondCardData?.image) {
        setTimeout(() => {
          setMatchedCards((prev) => [...prev, firstCard, secondCard])
          setFlippedCards([])

          updatePlayerStats(true)

          if (typeof matches === "number" && matchedCards.length / 2 + 1 >= matches) {
            handleGameEnd()
          }
        }, 1000)
      } else {
        setTimeout(() => {
          setFlippedCards([])
          updatePlayerStats(false)

          if (players === "two") {
            setCurrentPlayer((prev) => (prev === 0 ? 1 : 0))
          } else if (players === "bot") {
            setCurrentPlayer((prev) => (prev === 0 ? 1 : 0))
          }
        }, 1500)
      }
    }
  }

  const updatePlayerStats = (foundMatch: boolean) => {
    setStats((prevStats) => {
      const newStats = [...prevStats]
      const playerIndex = currentPlayer

      if (newStats[playerIndex]) {
        newStats[playerIndex] = {
          ...newStats[playerIndex],
          movesUsed: newStats[playerIndex].movesUsed + 1,
          matchesCompleted: foundMatch
            ? newStats[playerIndex].matchesCompleted + 1
            : newStats[playerIndex].matchesCompleted,
          matchesRemaining: foundMatch
            ? newStats[playerIndex].matchesRemaining - 1
            : newStats[playerIndex].matchesRemaining,
          timeUsed: typeof timer === "number" ? timer * 60 - timeLeft : undefined,
          timeRemaining: typeof timer === "number" ? timeLeft : undefined,
        }
      }

      return newStats
    })
  }

  useEffect(() => {
    if (matchedCards.length === gameCards.length && gameCards.length > 0) {
      handleGameEnd()
    }
  }, [matchedCards.length, gameCards.length])

  const handleGameEnd = () => {
    setGameComplete(true)
    setGameStatus("idle")
    setShowEndModal(true)
  }

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
    setCurrentPlayer(0)
    setGameStartTime(Date.now())

    botMemoryRef.current.clear()
    botMemoryRetentionRate.current = 0.3 + Math.random() * 0.2
    maxBotMemorySize.current = 8 + Math.floor(Math.random() * 5)

    const newGameCards = generateGameCards()
    setGameCards(newGameCards)

    if (selectedDeck && selectedDeck.id) {
      fetch(`/api/decks/${selectedDeck.id}/play`, {
        method: "POST",
      }).catch((error) => {
        console.error("Error tracking deck play:", error)
      })
    }

    if (typeof timer === "number") {
      setTimeLeft(timer * 60)
    }

    const playerNames =
      players === "solo"
        ? [t("player")]
        : players === "two"
          ? [`${t("player")} 1`, `${t("player")} 2`]
          : [t("player"), t("bot")]

    const initialStats: PlayerStats[] = playerNames.map((name) => ({
      name,
      matchesCompleted: 0,
      matchesRemaining: cardCount / 2,
      movesUsed: 0,
      movesRemaining: typeof matches === "number" ? matches : undefined,
      timeUsed: 0,
      timeRemaining: typeof timer === "number" ? timer * 60 : undefined,
    }))

    setStats(initialStats)
  }

  const handleEndGame = () => {
    handleGameEnd()
  }

  const resetToDefault = () => {
    setGameStatus("idle")
    setPlayers("solo")
    setTimer("unlimited")
    setMatches("unlimited")
    setCardCount(24)
    setStats([])
    setShowEndModal(false)
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setGameComplete(false)
    setGameOver(false)
    setTimeLeft(0)
    setCurrentPlayer(0)
    setGameCards([])

    botMemoryRef.current.clear()

    const classicAnimals = defaultDecks.find((deck) => deck.title === "Classic Animals")
    if (classicAnimals) {
      setSelectedDeckId(classicAnimals.id)
      setSelectedDeck(classicAnimals)
      setDeckImages(classicAnimals.images)
    }
  }

  const getWinnerAnnouncement = () => {
    if (players === "solo") {
      return gameComplete ? t("winner") + "!" : t("gameOver") + "!"
    }

    const player1Matches = stats[0]?.matchesCompleted || 0
    const player2Matches = stats[1]?.matchesCompleted || 0

    if (player1Matches > player2Matches) {
      return `${stats[0]?.name} ${t("winner")}!`
    } else if (player2Matches > player1Matches) {
      return `${stats[1]?.name} ${t("winner")}!`
    } else {
      const player1Moves = stats[0]?.movesUsed || 0
      const player2Moves = stats[1]?.movesUsed || 0

      if (player1Moves < player2Moves) {
        return `${stats[0]?.name} ${t("winner")}!`
      } else if (player2Moves < player1Moves) {
        return `${stats[1]?.name} ${t("winner")}!`
      } else {
        return "It's a Draw!"
      }
    }
  }

  const getResponsiveGridCols = () => {
    // This ensures cards stay close together regardless of count
    return "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"
  }

  const handleDeckChange = (deckId: string, deck: any) => {
    setSelectedDeckId(deckId)
    setSelectedDeck(deck)

    if (deck.cards_count) {
      setCardCount(deck.cards_count)
      setGameCards([]) // Clear existing game cards
    }

    if (deck.images) {
      setDeckImages(deck.images)
    } else {
      setDeckImages([])
    }
  }

  const handleCardCountChange = (newCardCount: number) => {
    setCardCount(newCardCount)
    setGameCards([])

    if (newCardCount === 16) {
      const classicAnimals = defaultDecks.find((deck) => deck.title === "Classic Animals")
      if (classicAnimals) {
        setSelectedDeckId(classicAnimals.id)
        setSelectedDeck(classicAnimals)
        setDeckImages(classicAnimals.images)
      }
    } else {
      setSelectedDeckId("")
      setSelectedDeck(null)
      setDeckImages([])
    }
  }

  const generateGameCards = (): GameCard[] => {
    const pairs = cardCount / 2
    const cards = []

    if (deckImages.length > 0 && deckImages.length >= pairs) {
      for (let i = 0; i < pairs; i++) {
        const image = deckImages[i]
        cards.push({ id: `${i}-a`, image, matched: false }, { id: `${i}-b`, image, matched: false })
      }
    } else {
      const allDefaultImages = defaultDecks.flatMap((deck) => deck.images)

      for (let i = 0; i < pairs; i++) {
        const image =
          allDefaultImages[i % allDefaultImages.length] || `/placeholder.svg?height=100&width=100&query=card-${i}`
        cards.push({ id: `${i}-a`, image, matched: false }, { id: `${i}-b`, image, matched: false })
      }
    }

    return cards.sort(() => Math.random() - 0.5)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <div className="relative p-6 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/30 shadow-2xl py-7">
          <div className="flex justify-between items-center max-lg:flex-col max-lg:items-stretch max-lg:gap-4">
            <div className="flex-1">
              {gameStatus === "idle" ? (
                <div className="flex items-center gap-4 flex-wrap max-sm:flex-col max-sm:gap-3">
                  <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">
                    <Select value={players} onValueChange={(value: "solo" | "two" | "bot") => setPlayers(value)}>
                      <SelectTrigger className="rounded-lg px-3 py-2 bg-gray-800 text-white hover:bg-gray-700 border-gray-600/30 min-w-[100px] max-sm:flex-1">
                        <SelectValue placeholder={t("players")} />
                        <ChevronDown className="w-4 h-4" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600/30">
                        <SelectItem value="solo" className="text-white hover:bg-gray-700">
                          Solo
                        </SelectItem>
                        <SelectItem value="two" className="text-white hover:bg-gray-700">
                          2 {t("players")}
                        </SelectItem>
                        <SelectItem value="bot" className="text-white hover:bg-gray-700">
                          {t("bot")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">
                    <Select
                      value={timer === "unlimited" ? "unlimited" : "custom"}
                      onValueChange={(value) => {
                        if (value === "unlimited") {
                          setTimer("unlimited")
                        } else if (value === "custom") {
                          setTimer(customTimerValue)
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg px-3 py-2 bg-gray-800 text-white hover:bg-gray-700 border-gray-600/30 min-w-[120px] max-sm:flex-1">
                        <span>{t("timer")}</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600/30">
                        <SelectItem value="unlimited" className="text-white hover:bg-gray-700">
                          Unlimited
                        </SelectItem>
                        <SelectItem value="custom" className="text-white hover:bg-gray-700">
                          <div className="flex items-center gap-2 w-full">
                            <span>Custom</span>
                            {timer !== "unlimited" && (
                              <div className="flex items-center gap-2 ml-2">
                                <Slider
                                  value={[typeof timer === "number" ? timer : customTimerValue]}
                                  onValueChange={(value) => {
                                    setCustomTimerValue(value[0])
                                    setTimer(value[0])
                                  }}
                                  max={60}
                                  min={1}
                                  step={1}
                                  className="w-32 h-1 accent-green-500"
                                />
                                <span className="text-xs">
                                  {typeof timer === "number" ? timer : customTimerValue}min
                                </span>
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">
                    <Select
                      value={matches === "unlimited" ? "unlimited" : "custom"}
                      onValueChange={(value) => {
                        if (value === "unlimited") {
                          setMatches("unlimited")
                        } else if (value === "custom") {
                          setMatches(customMatchesValue)
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg px-3 py-2 bg-gray-800 text-white hover:bg-gray-700 border-gray-600/30 min-w-[120px] max-sm:flex-1">
                        <span>{t("matches")}</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600/30">
                        <SelectItem value="unlimited" className="text-white hover:bg-gray-700">
                          Unlimited
                        </SelectItem>
                        <SelectItem value="custom" className="text-white hover:bg-gray-700">
                          <div className="flex items-center gap-2 w-full">
                            <span>Custom</span>
                            {matches !== "unlimited" && (
                              <div className="flex items-center gap-2 ml-2">
                                <Slider
                                  value={[typeof matches === "number" ? matches : customMatchesValue]}
                                  onValueChange={(value) => {
                                    setCustomMatchesValue(value[0])
                                    setMatches(value[0])
                                  }}
                                  max={100}
                                  min={1}
                                  step={1}
                                  className="w-32 h-1 accent-green-500"
                                />
                                <span className="text-xs">
                                  {typeof matches === "number" ? matches : customMatchesValue}
                                </span>
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between">
                    <Select
                      value={cardCount.toString()}
                      onValueChange={(value) => handleCardCountChange(Number.parseInt(value))}
                    >
                      <SelectTrigger className="rounded-lg px-3 py-2 bg-gray-800 text-white hover:bg-gray-700 border-gray-600/30 min-w-[100px] max-sm:flex-1">
                        <SelectValue placeholder={t("cards")} />
                        <ChevronDown className="w-4 h-4" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600/30">
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

                  <div className="max-sm:w-full">
                    <DeckSelector
                      selectedDeckId={selectedDeckId}
                      onDeckChange={handleDeckChange}
                      cardCount={cardCount}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className={`grid ${players === "solo" ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                    {stats.map((playerStat, index) => (
                      <Card
                        key={index}
                        className={`bg-gray-800/50 border-gray-600/30 ${currentPlayer === index ? "ring-2 ring-blue-400" : ""}`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-white flex items-center gap-2">{playerStat.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-gray-300">
                            <div>
                              {t("matches")}: {playerStat.matchesCompleted}/{cardCount / 2}
                            </div>
                            <div>
                              {t("moves")}: {playerStat.movesUsed}
                              {playerStat.movesRemaining && `/${playerStat.movesRemaining}`}
                            </div>
                            {typeof timer === "number" && (
                              <div className="flex items-center gap-1">
                                {t("time")}: {formatTime(timeLeft)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ml-6 max-lg:ml-0 max-lg:w-full">
              {gameStatus === "idle" ? (
                <Button
                  onClick={handleStartGame}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg max-sm:px-4 max-sm:py-2 max-lg:w-full"
                >
                  {t("startGame")}
                </Button>
              ) : (
                <Button
                  onClick={handleEndGame}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg max-lg:w-full"
                >
                  End Game
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className={`grid ${getResponsiveGridCols()} gap-3 justify-items-center`}>
          {gameStatus === "idle"
            ? Array.from({ length: cardCount }).map((_, index) => {
                let previewImage

                if (deckImages.length > 0 && deckImages[index % deckImages.length]) {
                  previewImage = deckImages[index % deckImages.length]
                } else {
                  const allDefaultImages = defaultDecks.flatMap((deck) => deck.images)
                  previewImage =
                    allDefaultImages[index % allDefaultImages.length] ||
                    `/placeholder.svg?height=100&width=100&query=card-${index}`
                }

                return (
                  <MemoryCard
                    key={`preview-${index}`}
                    id={`preview-${index}`}
                    frontImage={previewImage}
                    isFlipped={false}
                    isMatched={false}
                    onClick={() => {}}
                  />
                )
              })
            : gameCards.map((card) => (
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

      <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
        <DialogContent className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 border-gray-700/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{getWinnerAnnouncement()}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center"></div>

            <div className={`${players !== "solo" ? "grid grid-cols-2 gap-4" : ""}`}>
              <div className="space-y-2">
                <h3 className="font-semibold">Final Stats:</h3>
                <div className="rounded-lg p-4 space-y-2 bg-transparent">
                  <div>
                    {t("cards")}: {cardCount}
                  </div>
                  <div>
                    Total {t("matches")}: {matchedCards.length / 2}/{cardCount / 2}
                  </div>
                  <div>
                    Total {t("moves")}: {moves}
                  </div>
                  {typeof timer === "number" && (
                    <div>
                      {t("time")} Used: {formatTime(timer * 60 - timeLeft)}
                    </div>
                  )}
                </div>
              </div>

              {players !== "solo" && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("player")} Stats:</h3>
                  <div className="space-y-2">
                    {stats.map((playerStat, index) => (
                      <div key={index} className="rounded-lg p-3 bg-transparent">
                        <div className="font-medium">{playerStat.name}</div>
                        <div className="text-sm text-gray-300">
                          {t("matches")}: {playerStat.matchesCompleted} | {t("moves")}: {playerStat.movesUsed}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setShowEndModal(false)
                resetToDefault()
              }}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {tCommon("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

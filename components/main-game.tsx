"use client"

import type React from "react"

import { useState } from "react"
import { GameBoard } from "./game-board"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, Zap, Target, Timer, Heart, Settings } from "lucide-react"

interface GameMode {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  pairs: number
  timer?: number
  lives?: number
  special?: string
}

const gameModes: GameMode[] = [
  {
    id: "normal",
    name: "Normal",
    description: "8 pairs, no timer, standard scoring",
    icon: <Target className="w-6 h-6" />,
    pairs: 8,
  },
  {
    id: "hard",
    name: "Hard",
    description: "12 pairs, 3-4 min timer, limited mistakes",
    icon: <Clock className="w-6 h-6" />,
    pairs: 12,
    timer: 240, // 4 minutes
    lives: 5,
  },
  {
    id: "extreme",
    name: "Extreme",
    description: "20 pairs, strict timer, 1 life",
    icon: <Zap className="w-6 h-6" />,
    pairs: 20,
    timer: 300, // 5 minutes
    lives: 1,
  },
  {
    id: "speed",
    name: "Speed Mode",
    description: "Timer counts up, score based on completion time",
    icon: <Timer className="w-6 h-6" />,
    pairs: 8,
    special: "speed",
  },
  {
    id: "survival",
    name: "Survival Mode",
    description: "Starts at 4 pairs, adds +2 pairs per round, 3 lives",
    icon: <Heart className="w-6 h-6" />,
    pairs: 4,
    lives: 3,
    special: "survival",
  },
]

interface CustomSettings {
  pairs: number
  timerEnabled: boolean
  timerMinutes: number
  livesEnabled: boolean
  lives: number
}

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

export function MainGame() {
  const [selectedMode, setSelectedMode] = useState<string>("")
  const [gameStarted, setGameStarted] = useState(false)
  const [cards, setCards] = useState<any[]>([])
  const [gameConfig, setGameConfig] = useState<any>(null)
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    pairs: 8,
    timerEnabled: false,
    timerMinutes: 3,
    livesEnabled: false,
    lives: 3,
  })

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
  }

  const handleStartGame = () => {
    if (!selectedMode) return

    const mode = gameModes.find((m) => m.id === selectedMode)
    if (mode) {
      const config = {
        mode: selectedMode,
        pairs: mode.pairs,
        timer: mode.timer,
        lives: mode.lives,
        special: mode.special,
      }

      setGameConfig(config)
      setCards(generateMockCards(mode.pairs))
      setGameStarted(true)
    }
  }

  const handleCustomStart = () => {
    const config = {
      mode: "custom",
      pairs: customSettings.pairs,
      timer: customSettings.timerEnabled ? customSettings.timerMinutes * 60 : undefined,
      lives: customSettings.livesEnabled ? customSettings.lives : undefined,
    }

    setGameConfig(config)
    setCards(generateMockCards(customSettings.pairs))
    setGameStarted(true)
  }

  const handleRestart = () => {
    if (gameConfig) {
      setCards(generateMockCards(gameConfig.pairs))
    }
  }

  const handleExit = () => {
    setGameStarted(false)
    setSelectedMode("")
    setGameConfig(null)
    setCards([])
  }

  if (gameStarted && gameConfig) {
    return (
      <div className="space-y-8">
        <div className="text-center">
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
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
          Master Your Memory with <span className="text-primary">Pexeso</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Challenge your brain with our interactive memory card game. Choose your difficulty and start playing!
        </p>
      </div>

      {/* Game Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameModes.map((mode) => (
          <div
            key={mode.id}
            className={`p-6 bg-card rounded-2xl shadow-md border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              selectedMode === mode.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-lg ${selectedMode === mode.id ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"}`}
              >
                {mode.icon}
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">{mode.name}</h3>
            </div>
            <p className="text-muted-foreground mb-4">{mode.description}</p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Pairs:</span>
                <span className="font-medium">{mode.pairs}</span>
              </div>
              {mode.timer && (
                <div className="flex justify-between">
                  <span>Timer:</span>
                  <span className="font-medium">
                    {Math.floor(mode.timer / 60)}:{(mode.timer % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
              {mode.lives && (
                <div className="flex justify-between">
                  <span>Lives:</span>
                  <span className="font-medium">{mode.lives}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Custom Mode Card */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="p-6 bg-card rounded-2xl shadow-md border-2 border-dashed border-border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">Custom Mode</h3>
              </div>
              <p className="text-muted-foreground mb-4">Configure your own game with custom rules and settings</p>
              <div className="text-sm text-muted-foreground">
                <div>• Choose number of pairs (4-30)</div>
                <div>• Optional timer and lives</div>
                <div>• Personalized challenge</div>
              </div>
            </div>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Custom Game Settings</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pairs">Number of Pairs</Label>
                <Input
                  id="pairs"
                  type="number"
                  min="4"
                  max="30"
                  value={customSettings.pairs}
                  onChange={(e) =>
                    setCustomSettings((prev) => ({ ...prev, pairs: Number.parseInt(e.target.value) || 4 }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="timer-toggle">Enable Timer</Label>
                  <Switch
                    id="timer-toggle"
                    checked={customSettings.timerEnabled}
                    onCheckedChange={(checked) => setCustomSettings((prev) => ({ ...prev, timerEnabled: checked }))}
                  />
                </div>

                {customSettings.timerEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="timer-minutes">Timer (minutes)</Label>
                    <Input
                      id="timer-minutes"
                      type="number"
                      min="1"
                      max="10"
                      value={customSettings.timerMinutes}
                      onChange={(e) =>
                        setCustomSettings((prev) => ({ ...prev, timerMinutes: Number.parseInt(e.target.value) || 1 }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lives-toggle">Enable Lives</Label>
                  <Switch
                    id="lives-toggle"
                    checked={customSettings.livesEnabled}
                    onCheckedChange={(checked) => setCustomSettings((prev) => ({ ...prev, livesEnabled: checked }))}
                  />
                </div>

                {customSettings.livesEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="lives-count">Number of Lives</Label>
                    <Input
                      id="lives-count"
                      type="number"
                      min="1"
                      max="10"
                      value={customSettings.lives}
                      onChange={(e) =>
                        setCustomSettings((prev) => ({ ...prev, lives: Number.parseInt(e.target.value) || 1 }))
                      }
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleCustomStart} className="w-full">
                Start Custom Game
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Start Game Button */}
      <div className="text-center">
        <Button size="lg" onClick={handleStartGame} disabled={!selectedMode} className="text-lg px-12 py-6">
          {selectedMode ? `Start ${gameModes.find((m) => m.id === selectedMode)?.name} Game` : "Select a Mode"}
        </Button>
      </div>
    </div>
  )
}

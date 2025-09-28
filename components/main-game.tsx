"use client"

import { useState } from "react"
import { GameBoard } from "./game-board"

export function MainGame() {
  const [gameStarted, setGameStarted] = useState(true)
  const [gameConfig] = useState({
    mode: "standard",
    pairs: 12,
  })

  const handleRestart = () => {}

  const handleExit = () => {}

  return (
    <div className="space-y-8">
      <GameBoard onRestart={handleRestart} onExit={handleExit} gameConfig={gameConfig} />
    </div>
  )
}

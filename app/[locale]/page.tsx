import { GameBoard } from "@/components/game-board"
import { Navbar } from "@/components/navbar"
import { DeckGallery } from "@/components/deck-gallery"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <Navbar />

      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <GameBoard />
          <div className="mt-16">
            <DeckGallery />
          </div>
        </div>
      </main>
    </div>
  )
}

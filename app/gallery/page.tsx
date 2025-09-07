"use client"
import { Navbar } from "@/components/navbar"
import { GalleryGrid } from "@/components/gallery-grid"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Mock data for demonstration
const mockDecks = [
  {
    id: "1",
    title: "Nature Photography",
    thumbnail: "/nature-landscape.jpg",
    creator: "PhotoMaster",
    cardCount: 16,
  },
  {
    id: "2",
    title: "Famous Landmarks",
    thumbnail: "/famous-landmarks.jpg",
    creator: "TravelBug",
    cardCount: 20,
  },
  {
    id: "3",
    title: "Animal Kingdom",
    thumbnail: "/cute-animals.jpg",
    creator: "WildlifeExpert",
    cardCount: 12,
  },
  {
    id: "4",
    title: "Space Exploration",
    thumbnail: "/space-planets.jpg",
    creator: "AstroFan",
    cardCount: 18,
  },
  {
    id: "5",
    title: "Classic Art",
    thumbnail: "/classical-art-paintings.jpg",
    creator: "ArtLover",
    cardCount: 14,
  },
  {
    id: "6",
    title: "Ocean Life",
    thumbnail: "/ocean-marine-life.jpg",
    creator: "MarineBiologist",
    cardCount: 16,
  },
]

export default function GalleryPage() {
  const handlePlayDeck = (deckId: string) => {
    console.log("Playing deck:", deckId)
    // Navigate to game page with deck
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Deck Gallery</h1>
          <p className="text-muted-foreground mb-6">Discover and play with community-created memory card decks</p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search decks..." className="pl-10" />
          </div>
        </div>

        <GalleryGrid decks={mockDecks} onPlayDeck={handlePlayDeck} />
      </div>
    </div>
  )
}

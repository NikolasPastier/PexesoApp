import { Navbar } from "@/components/navbar"
import { DeckGenerator } from "@/components/deck-generator"
import { MainGame } from "@/components/main-game"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <MainGame />
      </section>

      {/* Create Custom Deck Section */}
      <section className="container mx-auto px-4 py-16">
        <DeckGenerator />
      </section>

      {/* Features Section */}

      {/* CTA Section */}

      <Footer />
    </div>
  )
}

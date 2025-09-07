import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { DeckGenerator } from "@/components/deck-generator"
import { Zap, Users, Trophy } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground text-balance">
              {"Play Pexeso Online"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Challenge yourself with our modern memory game. Improve your cognitive skills while having fun with
              beautiful card decks and engaging gameplay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/play">Play Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 bg-transparent">
              <Link href="/gallery">Explore Gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Create Custom Deck Section */}
      <section className="container mx-auto px-4 py-16">
        <DeckGenerator />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Pexeso?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our memory game offers unique features designed to enhance your cognitive abilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4 p-6 bg-card rounded-2xl shadow-md">
            <Zap className="w-12 h-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold text-card-foreground">Boost Memory</h3>
            <p className="text-muted-foreground">
              Scientifically designed gameplay to improve your memory retention and recall abilities
            </p>
          </div>

          <div className="text-center space-y-4 p-6 bg-card rounded-2xl shadow-md">
            <Users className="w-12 h-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold text-card-foreground">Community Decks</h3>
            <p className="text-muted-foreground">
              Play with thousands of user-created decks or create your own custom collections
            </p>
          </div>

          <div className="text-center space-y-4 p-6 bg-card rounded-2xl shadow-md">
            <Trophy className="w-12 h-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold text-card-foreground">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your improvement with detailed statistics and achievement tracking
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary/10 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Challenge Your Mind?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of players improving their memory skills every day
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/play">Start Playing Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

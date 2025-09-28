import { Navbar } from "@/components/navbar"
import { DeckGenerator } from "@/components/deck-generator"
import { MainGame } from "@/components/main-game"
import { Footer } from "@/components/footer"
import { DeckGallery } from "@/components/deck-gallery"
import { locales } from "@/lib/i18n/config"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container px-4 pt-24 pb-16 sm:pt-24 sm:pb-2.5 pl-4 pr-4 mx-auto">
        <MainGame />
      </section>

      {/* Create Custom Deck Section */}
      <section className="container mx-auto px-4 py-3.5">
        <DeckGenerator />
      </section>

      {/* Deck Gallery Section */}
      <section className="container mx-auto px-4 border-t-0 py-2.5">
        <DeckGallery />
      </section>

      {/* Features Section */}

      {/* CTA Section */}

      <Footer />
    </div>
  )
}

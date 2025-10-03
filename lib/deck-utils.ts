import { DEFAULT_DECKS, type DefaultDeck } from "./default-decks"

export interface DeckWithStats {
  id: string
  title: string
  images: string[]
  cards_count: number
  is_public: boolean
  plays: number
  user: {
    username: string
    avatar_url: string | null
  } | null
  isFavorited: boolean
  likes: number
  isOwned: boolean
  created_at: string
}

interface MergeAndFilterOptions {
  supabaseDecks: DeckWithStats[]
  defaultDecks?: DefaultDeck[]
  cardCount: string | null
  sort: string
}

/**
 * Merges Supabase decks with default decks, applies filters and sorting
 */
export function mergeAndFilterDecks({
  supabaseDecks,
  defaultDecks = DEFAULT_DECKS,
  cardCount,
  sort,
}: MergeAndFilterOptions): DeckWithStats[] {
  // Clone default decks and normalize fields to match Supabase deck structure
  const normalizedDefaultDecks: DeckWithStats[] = defaultDecks.map((deck) => ({
    ...deck,
    plays: 0, // Reset plays for consistency
    likes: 0, // Reset likes for consistency
    isFavorited: false,
    isOwned: false,
    user: null,
  }))

  // Combine both sets, avoiding duplicates by ID
  const supabaseDeckIds = new Set(supabaseDecks.map((d) => d.id))
  const uniqueDefaultDecks = normalizedDefaultDecks.filter((deck) => !supabaseDeckIds.has(deck.id))

  let combinedDecks = [...supabaseDecks, ...uniqueDefaultDecks]

  // Apply card count filter
  if (cardCount && cardCount !== "all") {
    const targetCount = Number.parseInt(cardCount)
    combinedDecks = combinedDecks.filter((deck) => deck.cards_count === targetCount)
  }

  // Apply sorting
  switch (sort) {
    case "oldest":
      combinedDecks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case "favorites_desc":
      combinedDecks.sort((a, b) => b.likes - a.likes)
      break
    case "favorites_asc":
      combinedDecks.sort((a, b) => a.likes - b.likes)
      break
    case "plays_desc":
      combinedDecks.sort((a, b) => b.plays - a.plays)
      break
    case "plays_asc":
      combinedDecks.sort((a, b) => a.plays - b.plays)
      break
    case "popular":
      combinedDecks.sort((a, b) => {
        const aScore = a.likes * 2 + a.plays
        const bScore = b.likes * 2 + b.plays
        return bScore - aScore
      })
      break
    case "recent":
    default:
      combinedDecks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
  }

  return combinedDecks
}

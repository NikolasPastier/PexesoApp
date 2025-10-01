import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_DECKS } from "@/lib/default-decks"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get("sort") || "recent"
  const cardCount = searchParams.get("card_count")

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not configured, returning filtered default decks")
    return applyFiltersToDefaultDecks(sort, cardCount)
  }

  try {
    const supabase = await createClient()

    // Get current user (optional - for checking favorites)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Build the query
    let query = supabase
      .from("decks")
      .select(`
        *,
        users:user_id (
          username,
          avatar_url
        )
      `)
      .eq("is_public", true)

    // Apply card count filter if specified
    if (cardCount && cardCount !== "all") {
      query = query.eq("cards_count", Number.parseInt(cardCount))
    }

    // Apply sorting
    switch (sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "favorites_desc":
        // We'll sort by favorites count after fetching
        query = query.order("created_at", { ascending: false })
        break
      case "favorites_asc":
        // We'll sort by favorites count after fetching
        query = query.order("created_at", { ascending: false })
        break
      case "plays_desc":
        query = query.order("plays_count", { ascending: false })
        break
      case "plays_asc":
        query = query.order("plays_count", { ascending: true })
        break
      case "popular":
        // We'll sort by combined popularity after fetching
        query = query.order("created_at", { ascending: false })
        break
      case "recent":
      default:
        query = query.order("created_at", { ascending: false })
        break
    }

    const { data: decks, error } = await query

    if (error) {
      console.error("Database error, falling back to filtered default decks:", error)
      return applyFiltersToDefaultDecks(sort, cardCount)
    }

    if (!decks || decks.length === 0) {
      return applyFiltersToDefaultDecks(sort, cardCount)
    }

    const decksWithStats = await Promise.all(
      decks.map(async (deck) => {
        // Get favorite count for this deck
        const { count: favoritesCount } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("deck_id", deck.id)

        // Check if current user has favorited this deck
        let isFavorited = false
        if (user) {
          const { data: userFavorite } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("deck_id", deck.id)
            .single()

          isFavorited = !!userFavorite
        }

        return {
          ...deck,
          user: deck.users
            ? {
                username: deck.users.username,
                avatar_url: deck.users.avatar_url,
              }
            : null,
          likes: favoritesCount || 0,
          plays: deck.plays_count || 0,
          isFavorited,
        }
      }),
    )

    // Apply post-fetch sorting for favorites and popularity
    let sortedDecks = decksWithStats
    switch (sort) {
      case "favorites_desc":
        sortedDecks = decksWithStats.sort((a, b) => b.likes - a.likes)
        break
      case "favorites_asc":
        sortedDecks = decksWithStats.sort((a, b) => a.likes - b.likes)
        break
      case "popular":
        sortedDecks = decksWithStats.sort((a, b) => {
          const aScore = b.likes * 2 + b.plays
          const bScore = a.likes * 2 + a.plays
          return bScore - aScore
        })
        break
    }

    return NextResponse.json({ decks: sortedDecks })
  } catch (error) {
    console.error("Error fetching decks, falling back to filtered default decks:", error)
    return applyFiltersToDefaultDecks(sort, cardCount)
  }
}

function applyFiltersToDefaultDecks(sort: string, cardCount: string | null) {
  let filteredDefaultDecks = [...DEFAULT_DECKS]

  // Apply card count filter to default decks
  if (cardCount && cardCount !== "all") {
    filteredDefaultDecks = filteredDefaultDecks.filter((deck) => deck.cards_count === Number.parseInt(cardCount))
  }

  // Apply sorting to default decks
  switch (sort) {
    case "oldest":
      filteredDefaultDecks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case "favorites_desc":
      filteredDefaultDecks.sort((a, b) => b.likes - a.likes)
      break
    case "favorites_asc":
      filteredDefaultDecks.sort((a, b) => a.likes - b.likes)
      break
    case "plays_desc":
      filteredDefaultDecks.sort((a, b) => b.plays - a.plays)
      break
    case "plays_asc":
      filteredDefaultDecks.sort((a, b) => a.plays - b.plays)
      break
    case "popular":
      filteredDefaultDecks.sort((a, b) => {
        const aScore = a.likes * 2 + a.plays
        const bScore = b.likes * 2 + b.plays
        return bScore - aScore
      })
      break
    case "recent":
    default:
      filteredDefaultDecks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
  }

  return NextResponse.json({ decks: filteredDefaultDecks })
}

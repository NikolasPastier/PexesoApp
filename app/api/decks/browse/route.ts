import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "recent"
    const cardCount = searchParams.get("card_count")

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
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 })
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
    console.error("Error fetching decks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { mergeAndFilterDecks } from "@/lib/deck-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get("sort") || "recent"
  const cardCount = searchParams.get("card_count")

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not configured, returning filtered default decks")
    const decks = mergeAndFilterDecks({
      supabaseDecks: [],
      cardCount,
      sort,
    })
    return NextResponse.json({ decks })
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

    switch (sort) {
      case "plays_desc":
        query = query.order("plays_count", { ascending: false })
        break
      case "plays_asc":
        query = query.order("plays_count", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
        break
    }

    const { data: decks, error } = await query

    if (error) {
      console.error("Database error, falling back to filtered default decks:", error)
      const fallbackDecks = mergeAndFilterDecks({
        supabaseDecks: [],
        cardCount,
        sort,
      })
      return NextResponse.json({ decks: fallbackDecks })
    }

    const decksWithStats = await Promise.all(
      (decks || []).map(async (deck) => {
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
          isOwned: false, // Browse endpoint doesn't show owned decks
        }
      }),
    )

    const mergedDecks = mergeAndFilterDecks({
      supabaseDecks: decksWithStats,
      cardCount,
      sort,
    })

    return NextResponse.json({ decks: mergedDecks })
  } catch (error) {
    console.error("Error fetching decks, falling back to filtered default decks:", error)
    const fallbackDecks = mergeAndFilterDecks({
      supabaseDecks: [],
      cardCount,
      sort,
    })
    return NextResponse.json({ decks: fallbackDecks })
  }
}

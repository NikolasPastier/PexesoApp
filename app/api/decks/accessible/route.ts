import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { mergeAndFilterDecks } from "@/lib/deck-utils"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not configured, returning default decks")
    const decks = mergeAndFilterDecks({
      supabaseDecks: [],
      cardCount: null,
      sort: "recent",
    })
    return NextResponse.json({ decks })
  }

  try {
    const supabase = await createClient()

    // Get current user (optional - if not authenticated, only public decks will be returned)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch all accessible decks with user information
    // RLS policies will automatically filter to show:
    // - All public decks (is_public = true)
    // - User's own private decks (auth.uid() = user_id) if authenticated
    const { data: decks, error } = await supabase
      .from("decks")
      .select(`
        *,
        users:user_id (
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error, falling back to default decks:", error)
      const fallbackDecks = mergeAndFilterDecks({
        supabaseDecks: [],
        cardCount: null,
        sort: "recent",
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
          // Add ownership flag for UI purposes
          isOwned: user ? deck.user_id === user.id : false,
          likes: favoritesCount || 0,
          plays: deck.plays_count || 0,
          isFavorited,
        }
      }),
    )

    const mergedDecks = mergeAndFilterDecks({
      supabaseDecks: decksWithStats,
      cardCount: null,
      sort: "recent",
    })

    return NextResponse.json({ decks: mergedDecks })
  } catch (error) {
    console.error("Error fetching accessible decks, falling back to default decks:", error)
    const fallbackDecks = mergeAndFilterDecks({
      supabaseDecks: [],
      cardCount: null,
      sort: "recent",
    })
    return NextResponse.json({ decks: fallbackDecks })
  }
}

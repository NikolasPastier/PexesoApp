import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's favorited decks with deck details and favorite counts
    const { data: favorites, error } = await supabase
      .from("favorites")
      .select(`
        deck_id,
        created_at,
        decks (
          id,
          title,
          description,
          images,
          cards_count,
          is_public,
          plays_count,
          created_at,
          user_id,
          users (
            username,
            avatar_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorites:", error)
      return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
    }

    // Transform the data and add favorite counts
    const decksWithStats = await Promise.all(
      favorites.map(async (favorite) => {
        const deck = favorite.decks

        // Get favorite count for this deck
        const { count: favoritesCount } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("deck_id", deck.id)

        return {
          ...deck,
          favorites_count: favoritesCount || 0,
          favorited_at: favorite.created_at,
          user: deck.users,
        }
      }),
    )

    return NextResponse.json({ decks: decksWithStats })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

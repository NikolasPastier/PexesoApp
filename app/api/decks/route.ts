import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user (optional - for checking favorites)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch all public decks with user information and favorite counts
    const { data: decks, error } = await supabase
      .from("decks")
      .select(`
        *,
        users:user_id (
          username,
          avatar_url
        )
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

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
          likes: favoritesCount || 0, // Use real favorite count instead of mock data
          plays: deck.plays_count || 0, // Use real plays count instead of mock data
          isFavorited, // Add user's favorite status
        }
      }),
    )

    const sortedDecks = decksWithStats.sort((a, b) => {
      if (b.likes !== a.likes) {
        return b.likes - a.likes // Most liked first
      }
      return b.plays - a.plays // Then most played
    })

    return NextResponse.json({ decks: sortedDecks })
  } catch (error) {
    console.error("Error fetching decks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, images, prompt, cards_count } = await request.json()

    if (!title || !images || images.length === 0) {
      return NextResponse.json({ error: "Title and images are required" }, { status: 400 })
    }

    const validCardsCounts = [16, 24, 32]
    const finalCardsCount = validCardsCounts.includes(cards_count) ? cards_count : 24

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data: deck, error: dbError } = await supabase
      .from("decks")
      .insert({
        user_id: user.id,
        title,
        description: prompt || null,
        images,
        cards_count: finalCardsCount,
        is_public: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to create deck" }, { status: 500 })
    }

    return NextResponse.json({ deck })
  } catch (error) {
    console.error("Error creating deck:", error)
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 })
  }
}

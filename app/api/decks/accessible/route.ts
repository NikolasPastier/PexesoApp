import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
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
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedDecks = decks.map((deck) => ({
      ...deck,
      user: deck.users
        ? {
            username: deck.users.username,
            avatar_url: deck.users.avatar_url,
          }
        : null,
      // Add ownership flag for UI purposes
      isOwned: user ? deck.user_id === user.id : false,
    }))

    return NextResponse.json({ decks: transformedDecks })
  } catch (error) {
    console.error("Error fetching accessible decks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

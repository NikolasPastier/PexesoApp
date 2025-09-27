import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all public decks with user information
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

    // Transform the data to match the expected format
    const transformedDecks = decks.map((deck) => ({
      ...deck,
      user: deck.users
        ? {
            username: deck.users.username,
            avatar_url: deck.users.avatar_url,
          }
        : null,
      likes: Math.floor(Math.random() * 1000) + 100, // Mock data for now
      plays: Math.floor(Math.random() * 5000) + 500, // Mock data for now
    }))

    return NextResponse.json({ decks: transformedDecks })
  } catch (error) {
    console.error("Error fetching decks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, images, prompt } = await request.json()

    if (!title || !images || images.length === 0) {
      return NextResponse.json({ error: "Title and images are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Save deck to database
    const { data: deck, error: dbError } = await supabase
      .from("decks")
      .insert({
        user_id: user.id,
        title,
        description: prompt || null,
        images,
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

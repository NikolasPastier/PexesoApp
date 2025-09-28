import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deckId = params.id

    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("deck_id", deckId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking favorite:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("deck_id", deckId)

      if (deleteError) {
        console.error("Error removing favorite:", deleteError)
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
      }

      return NextResponse.json({ favorited: false })
    } else {
      // Add favorite
      const { error: insertError } = await supabase.from("favorites").insert({
        user_id: user.id,
        deck_id: deckId,
      })

      if (insertError) {
        console.error("Error adding favorite:", insertError)
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
      }

      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

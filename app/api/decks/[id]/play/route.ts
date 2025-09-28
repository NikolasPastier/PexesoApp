import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const deckId = params.id

    // First, get the current plays_count
    const { data: currentDeck, error: fetchError } = await supabase
      .from("decks")
      .select("plays_count")
      .eq("id", deckId)
      .single()

    if (fetchError) {
      console.error("Error fetching current plays count:", fetchError)
      return NextResponse.json({ error: "Failed to fetch deck data" }, { status: 500 })
    }

    // Increment plays_count for the deck
    const newPlaysCount = (currentDeck.plays_count || 0) + 1
    const { error: updateError } = await supabase
      .from("decks")
      .update({
        plays_count: newPlaysCount,
      })
      .eq("id", deckId)

    if (updateError) {
      console.error("Error updating plays count:", updateError)
      return NextResponse.json({ error: "Failed to update plays count" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

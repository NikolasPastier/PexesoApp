import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Fetch user's decks
    const { data: decks, error: decksError } = await supabase
      .from("decks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (decksError) {
      console.error("[v0] Failed to fetch user decks:", decksError)
      return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 })
    }

    return NextResponse.json({ decks: decks || [] })
  } catch (error) {
    console.error("[v0] Error in my-decks route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

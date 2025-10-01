import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Update deck metadata (title, description, visibility)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const body = await request.json()
    const { title, description, is_public } = body

    // Verify deck ownership
    const { data: existingDeck, error: fetchError } = await supabase
      .from("decks")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    if (existingDeck.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update deck
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description.trim() || null
    if (is_public !== undefined) updateData.is_public = is_public

    const { data: deck, error: updateError } = await supabase
      .from("decks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Failed to update deck:", updateError)
      return NextResponse.json({ error: "Failed to update deck" }, { status: 500 })
    }

    return NextResponse.json({ deck })
  } catch (error) {
    console.error("[v0] Error updating deck:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete deck
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Verify deck ownership and get images
    const { data: existingDeck, error: fetchError } = await supabase
      .from("decks")
      .select("user_id, images")
      .eq("id", id)
      .single()

    if (fetchError || !existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    if (existingDeck.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete images from storage
    if (existingDeck.images && Array.isArray(existingDeck.images)) {
      for (const imageUrl of existingDeck.images) {
        try {
          // Extract file path from public URL
          const urlParts = imageUrl.split("/deck-images/")
          if (urlParts.length === 2) {
            const filePath = urlParts[1]
            await supabase.storage.from("deck-images").remove([filePath])
          }
        } catch (error) {
          console.error("[v0] Failed to delete image:", error)
          // Continue with deck deletion even if image deletion fails
        }
      }
    }

    // Delete deck from database
    const { error: deleteError } = await supabase.from("decks").delete().eq("id", id)

    if (deleteError) {
      console.error("[v0] Failed to delete deck:", deleteError)
      return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting deck:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

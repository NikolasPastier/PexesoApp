import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { deleteDecks } = body

    if (deleteDecks) {
      const { error: decksDeleteError } = await supabase.from("decks").delete().eq("user_id", user.id)

      if (decksDeleteError) {
        console.error("Error deleting decks:", decksDeleteError)
        return NextResponse.json({ error: "Failed to delete decks" }, { status: 400 })
      }
    }

    // Delete user account (this will cascade delete related data due to RLS policies)
    const { error: deleteError } = await supabase.rpc("delete_user")

    if (deleteError) {
      // If RPC doesn't exist, try direct auth deletion
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)
      if (authDeleteError) {
        return NextResponse.json({ error: "Failed to delete account" }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

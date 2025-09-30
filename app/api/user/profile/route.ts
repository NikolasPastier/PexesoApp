import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email } = await request.json()

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: "Username cannot be empty" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({
      email: email,
      data: { username: username },
    })

    if (updateAuthError) {
      return NextResponse.json({ error: updateAuthError.message }, { status: 400 })
    }

    const { error: updateDbError } = await supabase
      .from("users")
      .update({
        username: username,
        email: email,
      })
      .eq("id", user.id)

    if (updateDbError) {
      console.error("Error updating users table:", updateDbError)
      return NextResponse.json({ error: "Failed to update profile in database" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

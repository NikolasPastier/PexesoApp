import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          },
        },
      },
    )

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's plan information
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan, monthly_generations_used, last_reset")
      .eq("id", user.id)
      .single()

    if (userError) {
      console.error("[v0] Failed to fetch user plan:", userError)
      return NextResponse.json({ error: "Failed to fetch plan information" }, { status: 500 })
    }

    // Calculate daily generations used (from deck_generations table)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { count: dailyGenerationsUsed, error: countError } = await supabase
      .from("deck_generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("generated_at", twentyFourHoursAgo.toISOString())

    if (countError) {
      console.error("[v0] Failed to count daily generations:", countError)
    }

    return NextResponse.json({
      plan: userData.plan || "free",
      monthlyGenerationsUsed: userData.monthly_generations_used || 0,
      dailyGenerationsUsed: dailyGenerationsUsed || 0,
      lastReset: userData.last_reset,
    })
  } catch (error) {
    console.error("[v0] Plan API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch top scores (highest final_score)
    const { data: topScores, error: scoresError } = await supabase
      .from("scores")
      .select(
        `
        id,
        user_id,
        final_score,
        time_taken,
        pairs_matched,
        mistakes,
        created_at,
        users!inner (
          username,
          avatar_url
        )
      `,
      )
      .order("final_score", { ascending: false })
      .limit(10)

    if (scoresError) {
      console.error("Error fetching top scores:", scoresError)
      throw scoresError
    }

    // Fetch fastest times (lowest time_taken, but only for completed games with pairs_matched > 0)
    const { data: fastestTimes, error: timesError } = await supabase
      .from("scores")
      .select(
        `
        id,
        user_id,
        final_score,
        time_taken,
        pairs_matched,
        mistakes,
        created_at,
        users!inner (
          username,
          avatar_url
        )
      `,
      )
      .gt("pairs_matched", 0)
      .order("time_taken", { ascending: true })
      .limit(10)

    if (timesError) {
      console.error("Error fetching fastest times:", timesError)
      throw timesError
    }

    // Fetch most pairs matched
    const { data: mostPairs, error: pairsError } = await supabase
      .from("scores")
      .select(
        `
        id,
        user_id,
        final_score,
        time_taken,
        pairs_matched,
        mistakes,
        created_at,
        users!inner (
          username,
          avatar_url
        )
      `,
      )
      .order("pairs_matched", { ascending: false })
      .limit(10)

    if (pairsError) {
      console.error("Error fetching most pairs:", pairsError)
      throw pairsError
    }

    // Transform the data to flatten the user object
    const transformData = (data: any[]) => {
      return data.map((entry) => ({
        ...entry,
        user: {
          username: entry.users?.username || "Anonymous",
          avatar_url: entry.users?.avatar_url,
        },
        users: undefined,
      }))
    }

    return NextResponse.json({
      topScores: transformData(topScores || []),
      fastestTimes: transformData(fastestTimes || []),
      mostPairs: transformData(mostPairs || []),
    })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard data" }, { status: 500 })
  }
}

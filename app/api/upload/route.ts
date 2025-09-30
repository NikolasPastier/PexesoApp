import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const DECK_LIMITS = {
  free: 5,
  pro: 25,
}

export async function POST(request: NextRequest) {
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

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single()

    if (userDataError) {
      console.error("[v0] Failed to fetch user data:", userDataError)
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    const userPlan = (userData?.plan || "free") as "free" | "pro"
    const deckLimit = DECK_LIMITS[userPlan]

    // Count user's existing decks
    const { count: deckCount, error: countError } = await supabase
      .from("decks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (countError) {
      console.error("[v0] Failed to count decks:", countError)
      return NextResponse.json({ error: "Failed to count decks" }, { status: 500 })
    }

    // Check if user has reached their limit
    if (deckCount !== null && deckCount >= deckLimit) {
      const message =
        userPlan === "free"
          ? `Free plan limit reached (${deckLimit} decks). Upgrade to Pro to upload more.`
          : `Pro plan limit reached (${deckLimit} decks). Delete a deck or wait until next reset.`

      return NextResponse.json({ error: message, limitReached: true, plan: userPlan }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const cardsCount = formData.get("cards_count") as string
    const images = formData.getAll("images") as File[]

    if (!title || images.length === 0) {
      return NextResponse.json({ error: "Title and at least one image are required" }, { status: 400 })
    }

    if (!cardsCount || !["16", "24", "32"].includes(cardsCount)) {
      return NextResponse.json({ error: "Valid card count (16, 24, or 32) is required" }, { status: 400 })
    }

    const cardCountNum = Number.parseInt(cardsCount)
    const requiredImages = cardCountNum / 2

    if (images.length !== requiredImages) {
      return NextResponse.json(
        {
          error: `You must upload exactly ${requiredImages} images for ${cardCountNum} cards`,
        },
        { status: 400 },
      )
    }

    // Validate image files
    for (const image of images) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
      }
    }

    // Upload images to Supabase Storage
    const imageUrls: string[] = []

    for (const image of images) {
      const fileExt = image.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("deck-images")
        .upload(fileName, image)

      if (uploadError) {
        return NextResponse.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 })
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("deck-images").getPublicUrl(uploadData.path)

      imageUrls.push(publicUrl)
    }

    const { data: deck, error: dbError } = await supabase
      .from("decks")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        images: imageUrls,
        cards_count: cardCountNum,
        is_public: true,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: `Failed to save deck: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ deck })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

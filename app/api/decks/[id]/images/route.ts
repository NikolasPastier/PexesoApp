import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Update deck images
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify deck ownership and get existing data
    const { data: existingDeck, error: fetchError } = await supabase
      .from("decks")
      .select("user_id, images, cards_count")
      .eq("id", id)
      .single()

    if (fetchError || !existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    if (existingDeck.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const images = formData.getAll("images") as File[]

    if (images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    const requiredImages = existingDeck.cards_count / 2

    if (images.length !== requiredImages) {
      return NextResponse.json(
        {
          error: `You must upload exactly ${requiredImages} images for ${existingDeck.cards_count} cards`,
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

    // Delete old images from storage
    if (existingDeck.images && Array.isArray(existingDeck.images)) {
      for (const imageUrl of existingDeck.images) {
        try {
          const urlParts = imageUrl.split("/deck-images/")
          if (urlParts.length === 2) {
            const filePath = urlParts[1]
            await supabase.storage.from("deck-images").remove([filePath])
          }
        } catch (error) {
          console.error("[v0] Failed to delete old image:", error)
          // Continue with upload even if deletion fails
        }
      }
    }

    // Upload new images
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

      const {
        data: { publicUrl },
      } = supabase.storage.from("deck-images").getPublicUrl(uploadData.path)

      imageUrls.push(publicUrl)
    }

    // Update deck with new images
    const { data: deck, error: updateError } = await supabase
      .from("decks")
      .update({ images: imageUrls })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Failed to update deck images:", updateError)
      return NextResponse.json({ error: "Failed to update deck images" }, { status: 500 })
    }

    return NextResponse.json({ deck })
  } catch (error) {
    console.error("[v0] Error updating deck images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

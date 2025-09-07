import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, images, prompt } = await request.json()

    if (!title || !images || images.length === 0) {
      return NextResponse.json({ error: "Title and images are required" }, { status: 400 })
    }

    // TODO: Implement Supabase deck creation
    // For now, just return success
    const mockDeck = {
      id: `deck-${Date.now()}`,
      title,
      images,
      prompt,
      created_at: new Date().toISOString(),
      user_id: "mock-user-id",
    }

    console.log("Mock deck created:", mockDeck)

    return NextResponse.json({ deck: mockDeck })
  } catch (error) {
    console.error("Error creating deck:", error)
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 })
  }
}

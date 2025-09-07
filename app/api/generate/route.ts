import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const imagePromises = Array.from({ length: 8 }, async (_, i) => {
      try {
        const result = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt: `${prompt}, memory card game style, clean background, high quality`,
            image_size: "square_hd",
            num_inference_steps: 4,
            num_images: 1,
          },
        })

        const imageUrl = result.images?.[0]?.url
        if (!imageUrl) {
          throw new Error("No image generated")
        }

        return {
          id: `img-${Date.now()}-${i}`,
          url: imageUrl,
        }
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error)
        // Fallback to placeholder if individual image fails
        return {
          id: `img-${Date.now()}-${i}`,
          url: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(prompt)}-${i + 1}`,
        }
      }
    })

    const images = await Promise.all(imagePromises)

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error generating images:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}

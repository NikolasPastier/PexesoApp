import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

fal.config({
  credentials: process.env.FAL_KEY,
})

const STYLE_TEMPLATES = {
  realistic:
    "High-quality, photorealistic illustration, single subject, full body, centered, clean soft background, consistent style across all images, sharp focus, no text, no numbers, no multiple characters, no collage.",
  cartoon:
    "Cute flat vector cartoon illustration, pastel colors, single subject, full body, simple background, consistent illustration style across all images, no text, no numbers, no multiple characters, no collage.",
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, cardCount = 8, style = "realistic" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!STYLE_TEMPLATES[style as keyof typeof STYLE_TEMPLATES]) {
      return NextResponse.json({ error: "Invalid style. Must be 'realistic' or 'cartoon'" }, { status: 400 })
    }

    const validCounts = [8, 12, 16]
    const imageCount = validCounts.includes(cardCount) ? cardCount : 8

    const styleTemplate = STYLE_TEMPLATES[style as keyof typeof STYLE_TEMPLATES]

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
      try {
        const finalPrompt = `${styleTemplate} ${prompt}, unique variation ${i + 1}`

        const result = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt: finalPrompt,
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

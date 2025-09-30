import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { createClient } from "@/lib/supabase/server"

fal.config({
  credentials: process.env.FAL_KEY,
})

const STYLE_TEMPLATES = {
  realistic:
    "High-quality, photorealistic illustration, single subject, full body, centered, sharp focus, professional photography style, consistent style across all images, no text, no numbers, no multiple characters, no collage.",
  cartoon:
    "Cute flat vector cartoon illustration, vibrant colors, single subject, full body, centered, consistent illustration style across all images, playful and friendly, no text, no numbers, no multiple characters, no collage.",
}

const QUALITY_PRESETS = {
  fast: 4,
  balanced: 12,
  high: 28,
}

const DEFAULT_NEGATIVE_PROMPT =
  "multiple subjects, duplicate characters, multiple people, multiple animals, text, watermarks, signatures, logos, numbers, letters, collage, split image, border, frame, low quality, blurry, distorted"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required to generate images" }, { status: 401 })
    }

    const {
      prompt,
      cardCount = 8,
      style = "realistic",
      quality = "high",
      negativePrompt,
      guidanceScale,
      backgroundStyle,
    } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!STYLE_TEMPLATES[style as keyof typeof STYLE_TEMPLATES]) {
      return NextResponse.json({ error: "Invalid style. Must be 'realistic' or 'cartoon'" }, { status: 400 })
    }

    const validCounts = [8, 12, 16]
    const imageCount = validCounts.includes(cardCount) ? cardCount : 8

    const inferenceSteps = QUALITY_PRESETS[quality as keyof typeof QUALITY_PRESETS] || QUALITY_PRESETS.high

    const finalNegativePrompt = negativePrompt || DEFAULT_NEGATIVE_PROMPT

    const finalGuidanceScale = guidanceScale || 7.5

    const styleTemplate = STYLE_TEMPLATES[style as keyof typeof STYLE_TEMPLATES]

    const backgroundSuffix = backgroundStyle ? `, ${backgroundStyle}` : ""

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
      try {
        const finalPrompt = `${styleTemplate} ${prompt}${backgroundSuffix}, unique variation ${i + 1}`

        console.log("[v0] Generating image with settings:", {
          inferenceSteps,
          guidanceScale: finalGuidanceScale,
          negativePrompt: finalNegativePrompt,
        })

        const result = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt: finalPrompt,
            image_size: "square_hd",
            num_inference_steps: inferenceSteps,
            num_images: 1,
            negative_prompt: finalNegativePrompt,
            guidance_scale: finalGuidanceScale,
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

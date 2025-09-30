import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/lib/plans"

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

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("plan, monthly_generations_used, last_reset")
      .eq("id", user.id)
      .single()

    if (userDataError) {
      console.error("[v0] Error fetching user data:", userDataError)
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    const userPlan = userData.plan || "free"
    const planConfig = PLANS.find((p) => p.id === userPlan)

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan configuration" }, { status: 500 })
    }

    const now = new Date()
    const lastReset = userData.last_reset ? new Date(userData.last_reset) : null
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (userPlan === "pro" && lastReset && lastReset < thirtyDaysAgo) {
      // Reset monthly counter
      const { error: resetError } = await supabase
        .from("users")
        .update({
          monthly_generations_used: 0,
          last_reset: now.toISOString(),
        })
        .eq("id", user.id)

      if (resetError) {
        console.error("[v0] Error resetting monthly counter:", resetError)
      } else {
        userData.monthly_generations_used = 0
      }
    }

    if (userPlan === "free") {
      // Free plan: 1 generation per day
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: recentGenerations, error: generationCheckError } = await supabase
        .from("deck_generations")
        .select("generated_at")
        .eq("user_id", user.id)
        .gte("generated_at", twentyFourHoursAgo)
        .order("generated_at", { ascending: false })
        .limit(1)

      if (generationCheckError) {
        console.error("[v0] Error checking generation limit:", generationCheckError)
        return NextResponse.json({ error: "Failed to check generation limit" }, { status: 500 })
      }

      if (recentGenerations && recentGenerations.length > 0) {
        const lastGeneration = new Date(recentGenerations[0].generated_at)
        const timeUntilReset = new Date(lastGeneration.getTime() + 24 * 60 * 60 * 1000)
        const hoursRemaining = Math.ceil((timeUntilReset.getTime() - Date.now()) / (1000 * 60 * 60))

        return NextResponse.json(
          {
            error: "Daily AI deck generation limit reached",
            limitReached: true,
            hoursRemaining,
            resetTime: timeUntilReset.toISOString(),
            plan: "free",
            upgradeAvailable: true,
          },
          { status: 429 },
        )
      }
    } else if (userPlan === "pro") {
      // Pro plan: 100 generations per month
      const monthlyUsed = userData.monthly_generations_used || 0

      if (monthlyUsed >= planConfig.generationsPerMonth) {
        return NextResponse.json(
          {
            error: "Monthly AI deck generation limit reached",
            limitReached: true,
            plan: "pro",
            monthlyLimit: planConfig.generationsPerMonth,
            monthlyUsed,
          },
          { status: 429 },
        )
      }
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

    const { error: logError } = await supabase.from("deck_generations").insert({
      user_id: user.id,
      generated_at: new Date().toISOString(),
    })

    if (logError) {
      console.error("[v0] Error logging generation:", logError)
    }

    if (userPlan === "pro") {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          monthly_generations_used: (userData.monthly_generations_used || 0) + 1,
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Error updating monthly counter:", updateError)
      }
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error("[v0] Error generating images:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}

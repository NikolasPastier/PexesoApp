import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Disable body parsing for webhook signature verification
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    console.error("[v0] Missing Stripe signature")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("[v0] Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Create Supabase admin client for database updates
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.user_id
          const planId = session.metadata?.plan_id

          if (!userId || !planId) {
            console.error("[v0] Missing metadata in checkout session")
            break
          }

          // Update user's plan
          const { error: userError } = await supabase
            .from("users")
            .update({
              plan: planId,
              monthly_generations_used: 0,
              last_reset: new Date().toISOString(),
            })
            .eq("id", userId)

          if (userError) {
            console.error("[v0] Failed to update user plan:", userError)
          }

          // Create subscription record
          const { error: subError } = await supabase.from("subscriptions").insert({
            user_id: userId,
            plan: planId,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: "active",
          })

          if (subError) {
            console.error("[v0] Failed to create subscription record:", subError)
          }

          console.log("[v0] Subscription activated for user:", userId)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          console.error("[v0] Failed to update subscription status:", error)
        }

        console.log("[v0] Subscription updated:", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Get user_id from subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (subData?.user_id) {
          // Downgrade user to free plan
          const { error: userError } = await supabase
            .from("users")
            .update({
              plan: "free",
              monthly_generations_used: 0,
            })
            .eq("id", subData.user_id)

          if (userError) {
            console.error("[v0] Failed to downgrade user:", userError)
          }
        }

        // Update subscription status
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
          })
          .eq("stripe_subscription_id", subscription.id)

        if (subError) {
          console.error("[v0] Failed to update subscription status:", subError)
        }

        console.log("[v0] Subscription cancelled:", subscription.id)
        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

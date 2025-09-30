export interface Plan {
  id: "free" | "pro"
  name: string
  description: string
  priceInCents: number
  features: string[]
  generationsPerMonth: number
  dailyGenerations: number
  deckUploadLimit: number
}

// This is the source of truth for all subscription plans.
// All UI to display plans should pull from this array.
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for casual users",
    priceInCents: 0,
    features: [
      "1 AI deck generation per day",
      "Upload up to 5 custom decks",
      "Play all game modes",
      "Track your scores",
    ],
    generationsPerMonth: 0,
    dailyGenerations: 1,
    deckUploadLimit: 5, // Added deck limit for free plan
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power users who love creating",
    priceInCents: 499, // $4.99
    features: [
      "100 AI deck generations per month",
      "1 generation per day included",
      "Upload up to 25 custom decks", // Updated from "unlimited" to 25
      "Play all game modes",
      "Track your scores",
      "Ad-free experience",
      "Priority support",
    ],
    generationsPerMonth: 100,
    dailyGenerations: 1,
    deckUploadLimit: 25, // Added deck limit for pro plan
  },
]

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId)
}

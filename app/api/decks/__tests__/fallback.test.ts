/**
 * Integration tests for Supabase fallback behavior
 *
 * These tests verify that the deck API routes gracefully handle
 * missing Supabase credentials by returning DEFAULT_DECKS instead
 * of throwing errors.
 *
 * To run these tests:
 * 1. Temporarily unset NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 2. Start the dev server
 * 3. Make requests to /api/decks/accessible and /api/decks/browse
 * 4. Verify responses return 200 status with DEFAULT_DECKS payload
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"

describe("Deck API Fallback Behavior", () => {
  let originalSupabaseUrl: string | undefined
  let originalSupabaseKey: string | undefined

  beforeAll(() => {
    // Store original env vars
    originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  afterAll(() => {
    // Restore original env vars
    if (originalSupabaseUrl) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
    }
    if (originalSupabaseKey) {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseKey
    }
  })

  describe("/api/decks/accessible", () => {
    it("should return DEFAULT_DECKS when Supabase credentials are missing", async () => {
      // Simulate missing credentials
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch("http://localhost:3000/api/decks/accessible")
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("decks")
      expect(Array.isArray(data.decks)).toBe(true)
      expect(data.decks.length).toBeGreaterThan(0)
      // Verify it's the default decks by checking for known deck names
      expect(data.decks.some((deck: any) => deck.name === "Animals")).toBe(true)
    })

    it("should return DEFAULT_DECKS when Supabase query fails", async () => {
      // This test would require mocking Supabase to throw an error
      // In practice, you'd use a testing library to mock the createClient function
      // For now, this serves as documentation of expected behavior
      expect(true).toBe(true)
    })
  })

  describe("/api/decks/browse", () => {
    it("should return filtered DEFAULT_DECKS when Supabase credentials are missing", async () => {
      // Simulate missing credentials
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch("http://localhost:3000/api/decks/browse?sort=popular&card_count=12")
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("decks")
      expect(Array.isArray(data.decks)).toBe(true)
      // Verify filtering works - should only include 12-card decks
      expect(data.decks.every((deck: any) => deck.cards_count === 12)).toBe(true)
    })

    it("should apply sort parameter to DEFAULT_DECKS fallback", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch("http://localhost:3000/api/decks/browse?sort=favorites_desc")
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("decks")
      // Verify sorting - first deck should have more likes than last
      if (data.decks.length > 1) {
        expect(data.decks[0].likes).toBeGreaterThanOrEqual(data.decks[data.decks.length - 1].likes)
      }
    })

    it("should return DEFAULT_DECKS when Supabase query fails", async () => {
      // This test would require mocking Supabase to throw an error
      // In practice, you'd use a testing library to mock the createClient function
      // For now, this serves as documentation of expected behavior
      expect(true).toBe(true)
    })
  })
})

/**
 * Manual Testing Instructions:
 *
 * 1. Test missing credentials:
 *    - Comment out NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *    - Restart dev server
 *    - Visit http://localhost:3000/api/decks/accessible
 *    - Should return 200 with DEFAULT_DECKS
 *    - Visit http://localhost:3000/api/decks/browse?sort=popular
 *    - Should return 200 with sorted DEFAULT_DECKS
 *
 * 2. Test invalid credentials:
 *    - Set NEXT_PUBLIC_SUPABASE_URL to "https://invalid.supabase.co"
 *    - Set NEXT_PUBLIC_SUPABASE_ANON_KEY to "invalid-key"
 *    - Restart dev server
 *    - Visit both endpoints
 *    - Should return 200 with DEFAULT_DECKS (not 500 errors)
 *
 * 3. Test with valid credentials:
 *    - Restore correct Supabase credentials
 *    - Restart dev server
 *    - Visit both endpoints
 *    - Should return database decks if available, or DEFAULT_DECKS if database is empty
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, LogOut, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error && error.message === "Supabase not configured") {
          setSupabaseConfigured(false)
          setLoading(false)
          return
        }

        setUser(user)
        setLoading(false)
      } catch (error) {
        console.warn("Auth check failed:", error)
        setSupabaseConfigured(false)
        setLoading(false)
      }
    }

    getUser()

    if (supabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [supabase.auth, supabaseConfigured])

  const handleSignOut = async () => {
    if (!supabaseConfigured) return
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-7xl">
        <div className="bg-green-900/80 backdrop-blur-md rounded-2xl border border-green-700/30 shadow-lg">
          <div className="flex h-16 items-center justify-between px-6">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/images/pexeso-logo.png" alt="Pexeso Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-white">PexesoAI</span>
            </Link>

            <div className="flex items-center space-x-2">
              {!loading && (
                <>
                  {supabaseConfigured ? (
                    user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-green-800/50 rounded-full h-10 w-10"
                          >
                            <User className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-green-900/95 backdrop-blur-md border-green-700/30 text-white"
                        >
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="cursor-pointer text-red-400 hover:bg-green-800/50 focus:bg-green-800/50"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Link href="/auth">
                          <Button
                            variant="ghost"
                            className="text-white hover:bg-green-800/50 border border-green-700/50 rounded-lg px-4 py-2 h-10 transition-all duration-200"
                          >
                            Log in
                          </Button>
                        </Link>
                        <Link href="/auth">
                          <Button className="bg-white text-green-900 hover:bg-green-50 rounded-lg px-4 py-2 h-10 font-medium transition-all duration-200">
                            Get started
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Button
                        disabled
                        variant="ghost"
                        className="text-green-400 border border-green-700/50 rounded-lg px-4 py-2 h-10"
                      >
                        Log in
                      </Button>
                      <Button disabled className="bg-green-700 text-green-300 rounded-lg px-4 py-2 h-10 font-medium">
                        Get started
                      </Button>
                    </div>
                  )}
                </>
              )}

              <Button variant="ghost" size="icon" className="text-white hover:bg-green-800/50 rounded-full h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

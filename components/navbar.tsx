"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Pexeso</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/play-options" className="text-foreground hover:text-primary transition-colors duration-300">
              Play
            </Link>
            <Link href="/gallery" className="text-foreground hover:text-primary transition-colors duration-300">
              Gallery
            </Link>
            <Link href="/profile" className="text-foreground hover:text-primary transition-colors duration-300">
              Profile
            </Link>
          </div>

          <div className="flex items-center">
            {!loading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {supabaseConfigured ? (
                    user ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer">
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/auth" className="cursor-pointer">
                            Login
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/auth" className="cursor-pointer">
                            Sign Up
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )
                  ) : (
                    <DropdownMenuItem disabled className="text-muted-foreground">
                      Auth not configured
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

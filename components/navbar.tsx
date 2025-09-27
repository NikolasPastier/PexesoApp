"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { useState } from "react"

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login")

  const handleShowLogin = () => {
    setAuthModalTab("login")
    setShowAuthModal(true)
  }

  const handleShowSignup = () => {
    setAuthModalTab("signup")
    setShowAuthModal(true)
  }

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
            <div className="flex h-16 items-center justify-between px-2.5">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/images/pexeso-logo.png" alt="Pexeso Logo" width={32} height={32} className="w-16 h-16" />
                <span className="text-xl font-bold text-white">Pexeso.app</span>
              </Link>

              <div className="flex items-center space-x-2">
                {!loading && (
                  <>
                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-gray-700/50 rounded-full h-10 w-10"
                          >
                            <User className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-gray-900/95 backdrop-blur-md border-gray-700/30 text-white"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer text-red-400 hover:bg-gray-700/50 focus:bg-gray-700/50"
                            onClick={signOut}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          onClick={handleShowLogin}
                          className="text-white hover:bg-gray-700/50 border border-gray-600/30 rounded-lg px-4 py-2 h-10 transition-all duration-200"
                        >
                          Log in
                        </Button>
                        <Button
                          onClick={handleShowSignup}
                          className="bg-white text-gray-900 hover:bg-gray-100 rounded-lg px-4 py-2 h-10 font-medium transition-all duration-200"
                        >
                          Get started
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-700/50 rounded-full h-10 w-10"
                ></Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />
    </>
  )
}

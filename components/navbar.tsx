"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, Heart, Settings, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { FavouritesModal } from "@/components/favourites-modal"
import { SettingsModal } from "@/components/settings-modal"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useState } from "react"
import { useTranslations } from "next-intl"

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login")
  const [showFavouritesModal, setShowFavouritesModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const t = useTranslations("navbar")

  const handleShowLogin = () => {
    setAuthModalTab("login")
    setShowAuthModal(true)
  }

  const handleShowSignup = () => {
    setAuthModalTab("signup")
    setShowAuthModal(true)
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split("@")[0]
    return "User"
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.charAt(0).toUpperCase()
  }

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 max-sm:left-2 max-sm:right-2 z-50">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
            <div className="flex h-16 items-center justify-between px-2.5 max-sm:px-3">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/pexeso-logo.png"
                  alt="Pexeso Logo"
                  width={32}
                  height={32}
                  className="w-10 h-10 sm:w-16 sm:h-16"
                />
                <span className="text-xl font-bold text-white">{t("title")}</span>
              </Link>

              <div className="flex items-center space-x-2 max-sm:flex-wrap max-sm:justify-end max-sm:gap-2">
                <LanguageSwitcher />

                {!loading && (
                  <>
                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-white hover:bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-2 h-10 max-sm:px-3 max-sm:text-sm transition-all duration-200"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium max-w-24 truncate">{getUserDisplayName()}</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 text-white"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-700/50 focus:bg-gray-700/50"
                            onClick={() => setShowFavouritesModal(true)}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            {t("favourites")}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-700/50 focus:bg-gray-700/50"
                            onClick={() => setShowSettingsModal(true)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            {t("settings")}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-gray-600/30" />

                          <DropdownMenuItem
                            className="cursor-pointer text-red-400 hover:bg-gray-700/50 focus:bg-gray-700/50"
                            onClick={signOut}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            {t("logout")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          onClick={handleShowLogin}
                          className="text-white hover:bg-gray-700/50 border border-gray-600/30 rounded-lg px-4 py-2 h-10 max-sm:px-3 max-sm:text-sm transition-all duration-200"
                        >
                          {t("login")}
                        </Button>
                        <Button
                          onClick={handleShowSignup}
                          className="bg-white text-gray-900 hover:bg-gray-100 rounded-lg px-4 py-2 h-10 max-sm:px-3 max-sm:text-sm font-medium transition-all duration-200"
                        >
                          {t("signup")}
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-700/50 rounded-full h-10 w-10 max-sm:hidden"
                ></Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />

      <FavouritesModal isOpen={showFavouritesModal} onClose={() => setShowFavouritesModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  )
}

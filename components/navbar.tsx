"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, Heart, Settings, ChevronDown, Menu, Sparkles, Crown, FolderOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { FavouritesModal } from "@/components/favourites-modal"
import { SettingsModal } from "@/components/settings-modal"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { UpgradeModal } from "@/components/upgrade-modal"
import { MyDecksModal } from "@/components/my-decks-modal"

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login")
  const [showFavouritesModal, setShowFavouritesModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showMyDecksModal, setShowMyDecksModal] = useState(false)
  const [userPlan, setUserPlan] = useState<{
    plan: "free" | "pro"
    monthlyGenerationsUsed: number
    dailyGenerationsUsed: number
  } | null>(null)

  const t = useTranslations("navbar")

  useEffect(() => {
    if (user) {
      fetch("/api/user/plan")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setUserPlan(data)
          }
        })
        .catch((error) => {
          console.error("[v0] Failed to fetch user plan:", error)
        })
    } else {
      setUserPlan(null)
    }
  }, [user])

  const handleShowLogin = () => {
    setAuthModalTab("login")
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  const handleShowSignup = () => {
    setAuthModalTab("signup")
    setShowAuthModal(true)
    setShowMobileMenu(false)
  }

  const handleShowFavourites = () => {
    setShowFavouritesModal(true)
    setShowMobileMenu(false)
  }

  const handleShowSettings = () => {
    setShowSettingsModal(true)
    setShowMobileMenu(false)
  }

  const handleSignOut = () => {
    signOut()
    setShowMobileMenu(false)
  }

  const handleShowUpgrade = () => {
    setShowUpgradeModal(true)
    setShowMobileMenu(false)
  }

  const handleShowMyDecks = () => {
    setShowMyDecksModal(true)
    setShowMobileMenu(false)
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

              <div className="hidden md:flex items-center space-x-2">
                <LanguageSwitcher />

                {!loading && (
                  <>
                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-white hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600/30 rounded-lg px-3 py-2 h-10 transition-all duration-200"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium max-w-24 truncate">{getUserDisplayName()}</span>
                            {userPlan?.plan === "pro" && <Crown className="h-4 w-4 text-yellow-500" />}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 text-white"
                        >
                          {userPlan && (
                            <>
                              <div className="px-2 py-2 text-xs text-gray-400">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-300">
                                    {userPlan.plan === "free" ? "Free Plan" : "Pro Plan"}
                                  </span>
                                  {userPlan.plan === "pro" && <Crown className="h-3 w-3 text-yellow-500" />}
                                </div>
                                {userPlan.plan === "free" ? (
                                  <div className="text-gray-400">
                                    Daily: {userPlan.dailyGenerationsUsed}/1 generations
                                  </div>
                                ) : (
                                  <div className="text-gray-400">
                                    Monthly: {userPlan.monthlyGenerationsUsed}/100 generations
                                  </div>
                                )}
                              </div>
                              <DropdownMenuSeparator className="bg-gray-600/30" />
                            </>
                          )}

                          {userPlan?.plan === "free" && (
                            <>
                              <DropdownMenuItem
                                className="cursor-pointer bg-gradient-to-r from-green-500/10 to-emerald-600/10 hover:from-green-500/20 hover:to-emerald-600/20 border border-green-500/30 hover:text-white focus:bg-green-500/20 focus:text-white mb-1"
                                onClick={() => setShowUpgradeModal(true)}
                              >
                                <Sparkles className="mr-2 h-4 w-4 text-green-500" />
                                <span className="font-medium text-green-400">Upgrade to Pro</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-600/30" />
                            </>
                          )}

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-700/50 hover:text-white focus:bg-gray-700/50 focus:text-white"
                            onClick={() => setShowMyDecksModal(true)}
                          >
                            <FolderOpen className="mr-2 h-4 w-4 text-white" />
                            My Decks
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-700/50 hover:text-white focus:bg-gray-700/50 focus:text-white"
                            onClick={() => setShowFavouritesModal(true)}
                          >
                            <Heart className="mr-2 h-4 w-4 text-white" />
                            {t("favourites")}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-700/50 hover:text-white focus:bg-gray-700/50 focus:text-white"
                            onClick={() => setShowSettingsModal(true)}
                          >
                            <Settings className="mr-2 h-4 w-4 text-white" />
                            {t("settings")}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-gray-600/30" />

                          <DropdownMenuItem
                            className="cursor-pointer text-red-400 hover:bg-gray-700/50 hover:text-red-400 focus:bg-gray-700/50 focus:text-red-400"
                            onClick={signOut}
                          >
                            <LogOut className="mr-2 h-4 w-4 text-white" />
                            {t("logout")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          onClick={handleShowLogin}
                          className="text-white hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600/30 rounded-lg px-4 py-2 h-10 transition-all duration-200"
                        >
                          {t("login")}
                        </Button>
                        <Button
                          onClick={handleShowSignup}
                          className="bg-green-500 hover:bg-green-600 text-white hover:text-white rounded-lg px-4 py-2 h-10 font-medium transition-all duration-200"
                        >
                          {t("signup")}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="md:hidden">
                <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-gray-700/50 rounded-lg h-10 w-10"
                    >
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border-gray-700/30 text-white w-[280px] sm:w-[320px]"
                  >
                    <SheetHeader>
                      <SheetTitle className="text-white text-lg font-semibold">Menu</SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 mt-6">
                      {/* Language Switcher */}
                      <div className="flex items-center justify-between px-2 py-2">
                        <span className="text-sm font-medium text-gray-300">Language</span>
                        <LanguageSwitcher />
                      </div>

                      <div className="h-px bg-gray-700/50" />

                      {!loading && (
                        <>
                          {user ? (
                            <>
                              {/* User Info */}
                              <div className="flex items-center gap-3 px-2 py-2">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {getUserInitials()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{getUserDisplayName()}</span>
                                    {userPlan?.plan === "pro" && <Crown className="h-3 w-3 text-yellow-500" />}
                                  </div>
                                  <span className="text-xs text-gray-400">{user.email}</span>
                                </div>
                              </div>

                              {/* Generation Count */}
                              {userPlan && (
                                <>
                                  <div className="px-2 py-2 bg-gray-800/30 rounded-lg border border-gray-600/30">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-gray-300">
                                        {userPlan.plan === "free" ? "Free Plan" : "Pro Plan"}
                                      </span>
                                    </div>
                                    {userPlan.plan === "free" ? (
                                      <div className="text-xs text-gray-400">
                                        Daily: {userPlan.dailyGenerationsUsed}/1 generations
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-400">
                                        Monthly: {userPlan.monthlyGenerationsUsed}/100 generations
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              <div className="h-px bg-gray-700/50" />

                              {/* Upgrade Button */}
                              {userPlan?.plan === "free" && (
                                <>
                                  <Button
                                    className="justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:text-white rounded-lg px-4 py-3 h-auto text-base font-semibold"
                                    onClick={handleShowUpgrade}
                                  >
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Upgrade to Pro
                                  </Button>
                                  <div className="h-px bg-gray-700/50" />
                                </>
                              )}

                              {/* Menu Items */}
                              <Button
                                variant="ghost"
                                className="justify-start text-white hover:text-white hover:bg-gray-700/50 rounded-lg px-4 py-3 h-auto"
                                onClick={handleShowMyDecks}
                              >
                                <FolderOpen className="mr-3 h-5 w-5" />
                                <span className="text-base">My Decks</span>
                              </Button>

                              <Button
                                variant="ghost"
                                className="justify-start text-white hover:text-white hover:bg-gray-700/50 rounded-lg px-4 py-3 h-auto"
                                onClick={handleShowFavourites}
                              >
                                <Heart className="mr-3 h-5 w-5" />
                                <span className="text-base">{t("favourites")}</span>
                              </Button>

                              <Button
                                variant="ghost"
                                className="justify-start text-white hover:text-white hover:bg-gray-700/50 rounded-lg px-4 py-3 h-auto"
                                onClick={handleShowSettings}
                              >
                                <Settings className="mr-3 h-5 w-5" />
                                <span className="text-base">{t("settings")}</span>
                              </Button>

                              <div className="h-px bg-gray-700/50" />

                              <Button
                                variant="ghost"
                                className="justify-start text-red-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg px-4 py-3 h-auto"
                                onClick={handleSignOut}
                              >
                                <LogOut className="mr-3 h-5 w-5" />
                                <span className="text-base">{t("logout")}</span>
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="ghost"
                                onClick={handleShowLogin}
                                className="justify-center text-white hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600/30 rounded-lg px-4 py-3 h-auto text-base"
                              >
                                {t("login")}
                              </Button>
                              <Button
                                onClick={handleShowSignup}
                                className="justify-center bg-green-500 hover:bg-green-600 text-white hover:text-white rounded-lg px-4 py-3 h-auto text-base font-medium"
                              >
                                {t("signup")}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />

      <MyDecksModal isOpen={showMyDecksModal} onClose={() => setShowMyDecksModal(false)} />
      <FavouritesModal isOpen={showFavouritesModal} onClose={() => setShowFavouritesModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}

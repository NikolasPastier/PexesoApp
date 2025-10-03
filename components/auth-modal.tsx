"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SocialAuth } from "@/components/social-auth"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { X } from "lucide-react"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"
import { TermsModal } from "@/components/terms-modal"
import { useTranslations } from "next-intl"
import { AdBanner } from "@/components/ad-banner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const { refreshUser } = useAuth()
  const supabase = createClient()

  const t = useTranslations("auth")
  const tNavbar = useTranslations("navbar")

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: t("loginSuccess") })
        await refreshUser()
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    } catch (error) {
      setMessage({ type: "error", text: t("unexpectedError") })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (signupData.password !== signupData.confirmPassword) {
      setMessage({ type: "error", text: t("passwordsDoNotMatch") })
      setLoading(false)
      return
    }

    if (signupData.password.length < 6) {
      setMessage({ type: "error", text: t("passwordTooShort") })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            username: signupData.username,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({
          type: "success",
          text: t("accountCreated"),
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: t("unexpectedError") })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-6 pt-2">
            <h2 className="text-2xl font-bold text-center text-white">{t("welcomeBack")}</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {message && (
              <Alert
                className={`mb-4 ${
                  message.type === "error"
                    ? "border-red-500/50 bg-red-500/20 text-white"
                    : "border-emerald-500/50 bg-emerald-500/20 text-white"
                }`}
              >
                <AlertDescription className="text-white font-medium">{message.text}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-600/30">
                <TabsTrigger
                  value="login"
                  className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700/50"
                >
                  {t("login")}
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700/50"
                >
                  {t("signup")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">
                      {t("email")}
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={loginData.email}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-white/70 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">
                      {t("password")}
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-white/70 focus:border-gray-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
                    disabled={loading}
                  >
                    {loading ? t("signingIn") : t("login")}
                  </Button>
                </form>

                <SocialAuth />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-gray-300">
                      {t("username")}
                    </Label>
                    <Input
                      id="signup-username"
                      placeholder={t("usernamePlaceholder")}
                      value={signupData.username}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-white/70 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">
                      {t("email")}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={signupData.email}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-white/70 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">
                      {t("password")}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      value={signupData.password}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-white/70 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-gray-300">
                      {t("confirmPassword")}
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-white/70 focus:border-gray-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
                    disabled={loading}
                  >
                    {loading ? t("creatingAccount") : t("signup")}
                  </Button>
                </form>

                <SocialAuth />
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <AdBanner
                adSlot="1234567890"
                adFormat="auto"
                style={{ minHeight: "50px" }}
                className="flex justify-center"
              />
            </div>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </>
  )
}

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
        setMessage({ type: "success", text: "Login successful!" })
        await refreshUser()
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (signupData.password !== signupData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setLoading(false)
      return
    }

    if (signupData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
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
          text: "Account created! Please check your email to verify your account.",
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
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
            <h2 className="text-2xl font-bold text-center text-white">Welcome to Pexeso</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {message && (
              <Alert
                className={`mb-4 ${
                  message.type === "error"
                    ? "border-red-500/50 bg-red-500/10 text-red-300"
                    : "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-600/30">
                <TabsTrigger
                  value="login"
                  className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700/50"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700/50"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                </form>

                <SocialAuth />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-gray-300">
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      placeholder="Choose a username"
                      value={signupData.username}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={signupData.password}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-gray-300">
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      disabled={loading}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-gray-500"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>

                <SocialAuth />
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-gray-600/30">
              <p className="text-xs text-gray-400 text-center">
                By continuing, you agree to the{" "}
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </>
  )
}

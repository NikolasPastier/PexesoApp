"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, refreshUser, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteOption, setDeleteOption] = useState<"keep-decks" | "delete-decks">("keep-decks")

  const t = useTranslations("settings")

  // Form states
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.user_metadata?.username || "")
      setEmail(user.email || "")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowDeleteConfirm(false)
    }
  }, [isOpen, user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || username.trim().length === 0) {
      const event = new CustomEvent("showToast", {
        detail: { message: t("usernameRequired") },
      })
      window.dispatchEvent(event)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      const event = new CustomEvent("showToast", {
        detail: { message: t("invalidEmail") },
      })
      window.dispatchEvent(event)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      })

      if (response.ok) {
        await refreshUser()
        const event = new CustomEvent("showToast", {
          detail: { message: t("profileUpdated") },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : t("updateProfileError") },
      })
      window.dispatchEvent(event)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      const event = new CustomEvent("showToast", {
        detail: { message: t("allPasswordFieldsRequired") },
      })
      window.dispatchEvent(event)
      return
    }

    if (newPassword !== confirmPassword) {
      const event = new CustomEvent("showToast", {
        detail: { message: t("passwordsDoNotMatch") },
      })
      window.dispatchEvent(event)
      return
    }

    if (newPassword.length < 6) {
      const event = new CustomEvent("showToast", {
        detail: { message: t("passwordTooShort") },
      })
      window.dispatchEvent(event)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        const event = new CustomEvent("showToast", {
          detail: { message: t("passwordUpdated") },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : t("updatePasswordError") },
      })
      window.dispatchEvent(event)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteDecks: deleteOption === "delete-decks" }),
      })

      if (response.ok) {
        const event = new CustomEvent("showToast", {
          detail: { message: t("accountDeleted") },
        })
        window.dispatchEvent(event)
        onClose()
        await signOut()
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : t("deleteAccountError") },
      })
      window.dispatchEvent(event)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="large">
      <div className="space-y-8">
        {/* Profile Settings */}
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <h3 className="text-lg font-semibold text-white">{t("profileSection")}</h3>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              {t("username")}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white/70"
              placeholder={t("usernamePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white/70"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
          >
            {isLoading ? t("updating") : t("updateProfile")}
          </Button>
        </form>

        {/* Password Settings */}
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <h3 className="text-lg font-semibold text-white">{t("passwordSection")}</h3>

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-gray-300">
              {t("currentPassword")}
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white/70"
              placeholder={t("currentPasswordPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-300">
              {t("newPassword")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white/70"
              placeholder={t("newPasswordPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">
              {t("confirmPassword")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white/70"
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
          >
            {isLoading ? t("updating") : t("updatePassword")}
          </Button>
        </form>

        {/* Danger Zone */}
        <div className="border-t border-gray-600/30 pt-8">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("dangerZone")}
          </h3>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("deleteAccount")}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">{t("deleteConfirmTitle")}</p>

              <div className="space-y-3 bg-gray-800/30 p-4 rounded-lg border border-gray-600/30">
                <p className="text-sm font-medium text-gray-200 mb-2">{t("deleteOptionTitle")}</p>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="keep-decks"
                    checked={deleteOption === "keep-decks"}
                    onChange={(e) => setDeleteOption(e.target.value as "keep-decks")}
                    className="mt-1 h-4 w-4 text-green-500 border-gray-600 focus:ring-green-500 focus:ring-offset-gray-900"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white">{t("keepDecks")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t("keepDecksDesc")}</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="delete-decks"
                    checked={deleteOption === "delete-decks"}
                    onChange={(e) => setDeleteOption(e.target.value as "delete-decks")}
                    className="mt-1 h-4 w-4 text-red-500 border-gray-600 focus:ring-red-500 focus:ring-offset-gray-900"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white">{t("deleteDecks")}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t("deleteDecksDesc")}</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteOption("keep-decks")
                  }}
                  className="flex-1 border-gray-600/30 text-gray-300 hover:bg-gray-700/50"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:text-white"
                >
                  {isLoading ? t("deleting") : t("deleteAccount")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

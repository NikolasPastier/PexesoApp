"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { AlertTriangle, Trash2 } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

    // Validate username is not empty
    if (!username || username.trim().length === 0) {
      const event = new CustomEvent("showToast", {
        detail: { message: "Username cannot be empty" },
      })
      window.dispatchEvent(event)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      const event = new CustomEvent("showToast", {
        detail: { message: "Please enter a valid email address" },
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
          detail: { message: "Profile updated successfully!" },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : "Could not update profile, please try again" },
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
        detail: { message: "All password fields are required" },
      })
      window.dispatchEvent(event)
      return
    }

    if (newPassword !== confirmPassword) {
      const event = new CustomEvent("showToast", {
        detail: { message: "New passwords don't match" },
      })
      window.dispatchEvent(event)
      return
    }

    if (newPassword.length < 6) {
      const event = new CustomEvent("showToast", {
        detail: { message: "Password must be at least 6 characters" },
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
          detail: { message: "Password updated successfully!" },
        })
        window.dispatchEvent(event)
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : "Could not update password, please try again" },
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
      })

      if (response.ok) {
        const event = new CustomEvent("showToast", {
          detail: { message: "Account deleted successfully" },
        })
        window.dispatchEvent(event)
        onClose()
        // User will be automatically signed out by the auth state change
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      const event = new CustomEvent("showToast", {
        detail: { message: error instanceof Error ? error.message : "Failed to delete account" },
      })
      window.dispatchEvent(event)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings">
      <div className="space-y-6">
        {/* Profile Settings */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white"
              placeholder="Enter your email"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>

        {/* Password Settings */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Change Password</h3>

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-gray-300">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white"
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-300">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-800/50 border-gray-600/30 text-white placeholder:text-white"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        {/* Danger Zone */}
        <div className="border-t border-gray-600/30 pt-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h3>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border-gray-600/30 text-gray-300 hover:bg-gray-700/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white hover:text-white"
                >
                  {isLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

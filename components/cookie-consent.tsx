"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PrivacyPolicyModal } from "./privacy-policy-modal"
import { useTranslations } from "next-intl"

export function CookieConsent() {
  const t = useTranslations("cookies")
  const [isVisible, setIsVisible] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookiesConsent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookiesConsent", "accepted")
    setIsVisible(false)
    // Reload page to load AdSense script
    window.location.reload()
  }

  const handleReject = () => {
    localStorage.setItem("cookiesConsent", "rejected")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 shadow-2xl rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-300 leading-relaxed">
                {t("message")}{" "}
                <button
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-purple-400 hover:text-purple-300 underline transition-colors"
                >
                  {t("privacyPolicy")}
                </button>
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex-1 sm:flex-none bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border-gray-600"
              >
                {t("reject")}
              </Button>
              <Button onClick={handleAccept} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white">
                {t("accept")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  )
}

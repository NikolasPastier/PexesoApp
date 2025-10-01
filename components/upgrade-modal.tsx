"use client"

import { useState } from "react"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap } from "lucide-react"
import { PLANS } from "@/lib/plans"
import { useTranslations } from "next-intl"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("plans")

  const freePlan = PLANS.find((p) => p.id === "free")!
  const proPlan = PLANS.find((p) => p.id === "pro")!

  const handleUpgrade = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro" }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || "Failed to create checkout session")
      }

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      const event = new CustomEvent("showToast", {
        detail: {
          message: error instanceof Error ? error.message : t("checkoutError"),
        },
      })
      window.dispatchEvent(event)
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("upgradeTitle")} size="large">
      <div className="space-y-8 py-2">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-3">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white">{t("upgradeHero")}</h3>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">{t("upgradeSubtitle")}</p>
        </div>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-6 md:p-8 space-y-4">
            <div>
              <h4 className="text-xl md:text-2xl font-semibold text-white">{t("free.name")}</h4>
              <p className="text-3xl md:text-4xl font-bold text-gray-300 mt-2">$0</p>
              <p className="text-sm text-gray-400 mt-1">{t("free.foreverFree")}</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-base text-gray-400">
                <Check className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{t("free.feature1")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-400">
                <Check className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{t("free.feature2")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-400">
                <Check className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{t("free.feature3")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-400">
                <Check className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{t("free.feature4")}</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-2 border-green-500/50 rounded-lg p-6 md:p-8 space-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                {t("pro.badge")}
              </span>
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-semibold text-white">{t("pro.name")}</h4>
              <p className="text-3xl md:text-4xl font-bold text-green-400 mt-2">
                ${(proPlan.priceInCents / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">{t("pro.perMonth")}</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature1")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature2")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature3")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature4")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature5")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature6")}</span>
              </li>
              <li className="flex items-start gap-3 text-base text-gray-200">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{t("pro.feature7")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-7 text-lg"
          >
            {isLoading ? (
              t("redirecting")
            ) : (
              <>
                <Zap className="mr-2 h-6 w-6" />
                {t("upgradeButton", { price: (proPlan.priceInCents / 100).toFixed(2) })}
              </>
            )}
          </Button>
          <p className="text-sm text-center text-gray-400">{t("upgradeFooter")}</p>
        </div>
      </div>
    </Modal>
  )
}

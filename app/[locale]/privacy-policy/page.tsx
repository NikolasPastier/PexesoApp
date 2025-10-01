"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacyPolicy")
  const router = useRouter()

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-purple-900/30 backdrop-blur-sm border border-gray-700/30 shadow-2xl rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-white">{t("title")}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-700/50 text-gray-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="text-sm text-gray-300 leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section1Title")}</h2>
              <p>{t("section1Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section2Title")}</h2>
              <p>{t("section2Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section3Title")}</h2>
              <p>{t("section3Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section4Title")}</h2>
              <p>{t("section4Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section5Title")}</h2>
              <p>{t("section5Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section6Title")}</h2>
              <p>{t("section6Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section7Title")}</h2>
              <p>{t("section7Content")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">{t("section8Title")}</h2>
              <p>{t("section8Content")}</p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleClose} className="bg-purple-600 hover:bg-purple-700 text-white">
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  )
}

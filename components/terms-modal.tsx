"use client"

import { Modal } from "./modal"
import { useTranslations } from "next-intl"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const t = useTranslations("terms")

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="large">
      <div className="space-y-6 text-base leading-relaxed">
        <p className="text-gray-300">{t("intro")}</p>
        <ol className="list-decimal list-inside space-y-4 ml-4 text-gray-300">
          <li className="pl-2">{t("term1")}</li>
          <li className="pl-2">{t("term2")}</li>
          <li className="pl-2">{t("term3")}</li>
          <li className="pl-2">{t("term4")}</li>
          <li className="pl-2">{t("term5")}</li>
        </ol>
        <p className="text-gray-300">{t("outro")}</p>
      </div>
    </Modal>
  )
}

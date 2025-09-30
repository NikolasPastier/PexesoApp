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
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")}>
      <div className="space-y-4">
        <p>{t("intro")}</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>{t("term1")}</li>
          <li>{t("term2")}</li>
          <li>{t("term3")}</li>
          <li>{t("term4")}</li>
          <li>{t("term5")}</li>
        </ol>
        <p>{t("outro")}</p>
      </div>
    </Modal>
  )
}

"use client"

import { Modal } from "./modal"
import { useTranslations } from "next-intl"

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const t = useTranslations("privacy")

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")}>
      <div className="space-y-4">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
        <p>{t("paragraph3")}</p>
        <p>{t("paragraph4")}</p>
      </div>
    </Modal>
  )
}

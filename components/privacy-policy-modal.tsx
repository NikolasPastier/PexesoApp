"use client"

import { Modal } from "./modal"

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
      <div className="space-y-4">
        <p>
          We respect your privacy. This site collects only the data necessary to operate the Pexeso game, such as user
          authentication, gameplay progress, and uploaded card images.
        </p>
        <p>
          We do not sell or share your personal data with third parties, except as required to provide core
          functionality (e.g., authentication, storage, hosting).
        </p>
        <p>
          All data is stored securely in our database (Supabase) and is only accessible to you and authorized
          administrators.
        </p>
        <p>
          By using this site, you consent to this collection and usage. For questions, please contact
          support@example.com.
        </p>
      </div>
    </Modal>
  )
}

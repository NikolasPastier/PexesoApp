"use client"

import { Modal } from "./modal"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Use">
      <div className="space-y-4">
        <p>By accessing and using this site, you agree to follow these terms:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>You may play the Pexeso game and use all features provided for personal, non-commercial use.</li>
          <li>
            You are responsible for the content you upload (e.g., card images) and agree not to upload harmful,
            offensive, or copyrighted material without permission.
          </li>
          <li>We may update or change the game features at any time without prior notice.</li>
          <li>We are not liable for any damages caused by use of the site.</li>
          <li>These terms are governed by the laws of [Your Country].</li>
        </ol>
        <p>If you do not agree with these terms, please discontinue using the site.</p>
      </div>
    </Modal>
  )
}

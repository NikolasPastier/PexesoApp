"use client"

import { useState } from "react"
import { PrivacyPolicyModal } from "./privacy-policy-modal"
import { TermsModal } from "./terms-modal"

export function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  return (
    <>
      <footer className="mt-16 py-2.5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-black my-0">
            <span className="text-black">© 2025 Pexeso.app All rights reserved</span>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-muted-foreground/50">|</span>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="hover:text-gray-800 transition-colors duration-200 text-black"
              >
                Privacy Policy
              </button>
              <span className="text-muted-foreground/50">|</span>
              <button
                onClick={() => setIsTermsOpen(true)}
                className="hover:text-gray-800 transition-colors duration-200 text-black"
              >
                Terms of Use
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </>
  )
}

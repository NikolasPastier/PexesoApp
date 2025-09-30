"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface AdBannerProps {
  adSlot: string
  adFormat?: "auto" | "fluid" | "rectangle"
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdBanner({ adSlot, adFormat = "auto", style, className = "" }: AdBannerProps) {
  const { user } = useAuth()
  const adRef = useRef<HTMLModElement>(null)
  const isAdPushed = useRef(false)
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Check if user has accepted cookies
    const consent = localStorage.getItem("cookiesConsent")
    setHasConsent(consent === "accepted")
  }, [])

  useEffect(() => {
    if (user?.plan !== "free" || !hasConsent) {
      return
    }

    // Push ad to AdSense queue
    if (adRef.current && !isAdPushed.current) {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        isAdPushed.current = true
      } catch (error) {
        console.error("AdSense error:", error)
      }
    }
  }, [user, hasConsent])

  if (!user || user.plan !== "free" || !hasConsent) {
    return null
  }

  return (
    <div className={`ad-banner-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client="ca-pub-1259430610730362"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}

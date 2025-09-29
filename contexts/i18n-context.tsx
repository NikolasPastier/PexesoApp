"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Locale, defaultLocale } from "@/lib/i18n/config"
import { detectLocale, saveLocale } from "@/lib/i18n/locale-detector"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectedLocale = detectLocale()
    setLocaleState(detectedLocale)
    setIsLoading(false)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    saveLocale(newLocale)
  }

  return <I18nContext.Provider value={{ locale, setLocale, isLoading }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

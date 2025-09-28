import { type Locale, defaultLocale, locales } from "./config"

export function detectLocale(): Locale {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && locales.includes(savedLocale)) {
      return savedLocale
    }
  }

  // Check browser language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0] as Locale
    if (locales.includes(browserLang)) {
      return browserLang
    }
  }

  return defaultLocale
}

export function saveLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale)
  }
}

export const locales = ["en", "cs", "sk", "es", "pt", "it"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "english",
  cs: "čeština",
  sk: "slovenčina",
  es: "español",
  pt: "português",
  it: "italiano",
}

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  cs: "🇨🇿",
  sk: "🇸🇰",
  es: "🇪🇸",
  pt: "🇵🇹",
  it: "🇮🇹",
}

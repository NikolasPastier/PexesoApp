import { getRequestConfig } from "next-intl/server"
import { defaultLocale, locales, type Locale } from "./config"

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale

  return {
    locale: validLocale, // Added required locale property
    messages: (await import(`../../locales/${validLocale}.json`)).default,
  }
})

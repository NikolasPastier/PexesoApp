import { getRequestConfig } from "next-intl/server"
import { defaultLocale, locales, type Locale } from "./config"

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    messages: (await import(`../../locales/${locale}.json`)).default,
  }
})

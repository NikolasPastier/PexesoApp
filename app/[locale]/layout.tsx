import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "../globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { I18nProvider } from "@/contexts/i18n-context"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, unstable_setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/lib/i18n/config"
import { CookieConsent } from "@/components/cookie-consent"

export const metadata: Metadata = {
  title: "Pexeso - Memory Card Game",
  description: "Train your memory with the classic Pexeso card matching game. Play solo, multiplayer, or against AI.",
  generator: "v0.app",
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  unstable_setRequestLocale(locale)

  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <I18nProvider>
            <AuthProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <CookieConsent />
            </AuthProvider>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

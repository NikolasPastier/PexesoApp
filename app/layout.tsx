import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { I18nProvider } from "@/contexts/i18n-context"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

export const metadata: Metadata = {
  title: "Pexeso - Memory Card Game",
  description: "Train your memory with the classic Pexeso card matching game. Play solo, multiplayer, or against AI.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <I18nProvider>
            <AuthProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </AuthProvider>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

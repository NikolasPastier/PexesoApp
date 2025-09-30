import { updateSession } from "@/lib/supabase/middleware"
import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "@/lib/i18n/config"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Always add locale prefix to URLs
})

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  const supabaseResponse = await updateSession(request)

  if (supabaseResponse.headers.get("set-cookie")) {
    intlResponse.headers.set("set-cookie", supabaseResponse.headers.get("set-cookie")!)
  }

  // Copy any other important headers from Supabase response
  supabaseResponse.headers.forEach((value, key) => {
    if (key.startsWith("x-") || key === "authorization") {
      intlResponse.headers.set(key, value)
    }
  })

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

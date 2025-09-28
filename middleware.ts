import { updateSession } from "@/lib/supabase/middleware"
import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "@/lib/i18n/config"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never", // Don't add locale prefix to URLs
})

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  // Apply Supabase session handling
  const response = await updateSession(request)

  // Merge headers from both middlewares
  if (intlResponse.headers.get("x-middleware-request-x-nextjs-data")) {
    response.headers.set(
      "x-middleware-request-x-nextjs-data",
      intlResponse.headers.get("x-middleware-request-x-nextjs-data")!,
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

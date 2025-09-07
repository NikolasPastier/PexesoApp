import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found in middleware. Auth protection disabled.")
    // Continue without auth protection if Supabase isn't configured
    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (
      !user &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/signup") &&
      request.nextUrl.pathname !== "/" &&
      request.nextUrl.pathname !== "/gallery" &&
      request.nextUrl.pathname !== "/play-options"
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Error in middleware auth check:", error)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}

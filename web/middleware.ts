import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create response with pathname header for layout
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Add pathname to headers for layout to access
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // Refresh session - this is critical for Supabase SSR
  // Without this, session tokens can expire between requests
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update cookies in the request for downstream code
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Create new response with updated cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.headers.set('x-pathname', request.nextUrl.pathname)
          // Set cookies in the response for the browser
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This will refresh the session if expired
  // IMPORTANT: Do not use getSession() here - it doesn't refresh tokens
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Match all pathnames except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

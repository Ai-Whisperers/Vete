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
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Redirect authenticated users away from login page
  if (user && path.endsWith('/portal/login')) {
    url.pathname = `/${path.split('/')[1]}/portal/dashboard`;
    return NextResponse.redirect(url);
  }

  // 1. Protected Routes Pattern Matching
  const isDashboard = path.includes('/dashboard')
  const isPortal = path.includes('/portal')
  const isProtected = isDashboard || isPortal

  // 2. Auth Check
  if (isProtected && !user) {
    // Redirect to login
    // Extract clinic slug if possible, default to generic login or root
    // Path format: /[clinic]/...
    const parts = path.split('/').filter(Boolean)
    const clinicSlug = parts[0]

    // Avoid redirect loop if we are already at login (though login usually isn't under dashboard)
    url.pathname = `/${clinicSlug}` // Redirect to clinic home/login
    url.searchParams.set('login', 'true') // Helper to open login modal if implemented
    url.searchParams.set('redirect_to', path)
    return NextResponse.redirect(url)
  }

  // 3. Role Check (Authorization)
  if (user && isDashboard) {
    // Dashboards are for Staff (vet/admin) only
    // We need to fetch the profile role.
    // Optimization: Check metadata first if available, otherwise DB
    let role = user.user_metadata?.role

    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role
    }

    if (!['vet', 'admin'].includes(role)) {
      // Forbidden: Redirect to portal or home
      const parts = path.split('/').filter(Boolean)
      const clinicSlug = parts[0]
      url.pathname = `/${clinicSlug}/portal` // Send them to the owner portal
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all pathnames except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

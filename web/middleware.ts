import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip root path
  if (path === '/') {
    return NextResponse.next()
  }

  // Create response with pathname header for layout
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Add pathname to headers for layout to access
  response.headers.set('x-pathname', path)

  // OPTIMIZATION: Skip auth for public routes to reduce latency
  // Public routes don't need session refresh (saves ~50-100ms per request)
  const isPublicRoute = !path.includes('/portal') &&
                        !path.includes('/dashboard') &&
                        !path.includes('/cart/checkout')

  if (isPublicRoute) {
    return response
  }

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
          response.headers.set('x-pathname', path)
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

  // Redirect authenticated users away from login page
  if (user && path.endsWith('/portal/login')) {
    url.pathname = `/${path.split('/')[1]}/portal/dashboard`
    return NextResponse.redirect(url)
  }

  // 1. Protected Routes Pattern Matching
  const isDashboard = path.includes('/dashboard')
  const isPortal = path.includes('/portal')
  const isProtected = isDashboard || isPortal

  // 2. Auth Check - redirect unauthenticated users to login page
  // EXCEPT if they're already trying to access the login or signup pages
  const isAuthPage = path.endsWith('/portal/login') || path.endsWith('/portal/signup')
  if (isProtected && !user && !isAuthPage) {
    const parts = path.split('/').filter(Boolean)
    const clinicSlug = parts[0]

    // Redirect to the actual login page, not the home page
    url.pathname = `/${clinicSlug}/portal/login`
    url.searchParams.set('returnTo', path)
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
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (.png, .jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
}

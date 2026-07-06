import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, getClientIdentifier, SECURITY_HEADERS } from '@/lib/security'

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes (except auth and admin endpoints)
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/') &&
      !request.nextUrl.pathname.startsWith('/api/admin-navigation') &&
      !request.nextUrl.pathname.startsWith('/api/global-styling') &&
      !request.nextUrl.pathname.startsWith('/api/page-layout') &&
      !request.nextUrl.pathname.startsWith('/api/home-content') &&
      !request.nextUrl.pathname.startsWith('/api/frontend-navigation') &&
      !request.nextUrl.pathname.startsWith('/api/events') &&
      !request.nextUrl.pathname.startsWith('/api/contact') &&
      !request.nextUrl.pathname.startsWith('/api/banner') &&
      !request.nextUrl.pathname.startsWith('/api/hours') &&
      !request.nextUrl.pathname.startsWith('/api/about') &&
      !request.nextUrl.pathname.startsWith('/api/upload')) {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimit(identifier)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.`,
          resetIn: rateLimitResult.resetIn
        },
        { status: 429 }
      )
    }
  }

  // Add security headers to all responses
  const requestHeaders = new Headers(request.headers)
  const responseHeaders = new Headers()

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    responseHeaders.set(key, value)
  })

  // Handle admin authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('admin-auth')?.value

    if (!authToken || authToken !== 'true') {
      // Redirect to login page if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
    headers: responseHeaders
  })
}

export const config = {
  matcher: [
    '/api/((?!auth/).*)' // Exclude all /api/auth/* routes
  ]
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, getClientIdentifier, SECURITY_HEADERS } from '@/lib/security'

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimit(identifier)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.`,
          resetIn: rateLimitResult.resetIn
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.resetIn?.toString() || '900',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + (rateLimitResult.resetIn || 900) * 1000) / 1000).toString()
          }
        }
      )
    }
  }

  // Get admin auth cookie
  const authCookie = request.cookies.get('admin-auth')?.value

  // Protect admin routes, but allow login page
  if (request.nextUrl.pathname.startsWith('/admin') && 
      request.nextUrl.pathname !== '/admin/login') {
    
    if (!authCookie || authCookie !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl.origin))
    }
  }

  // Apply security headers to all responses
  const responseHeaders = new Headers()
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    responseHeaders.set(key, value)
  })

  // Add rate limit headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimit(identifier)
    
    responseHeaders.set('X-RateLimit-Limit', '100')
    responseHeaders.set('X-RateLimit-Remaining', Math.max(0, 100 - (rateLimitResult.success ? 1 : 0)).toString())
    responseHeaders.set('X-RateLimit-Reset', Math.ceil((Date.now() + 15 * 60 * 1000) / 1000).toString())
  }

  // Add user info to request headers if authenticated
  const requestHeaders = new Headers()
  if (authCookie === 'true') {
    requestHeaders.set('x-user-id', '1')
    requestHeaders.set('x-user-name', 'admin')
    requestHeaders.set('x-user-role', 'admin')
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
    '/api/((?!auth/login).*)',
    '/admin/((?!login).*)'
  ]
}

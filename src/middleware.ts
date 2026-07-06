import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, getClientIdentifier, SECURITY_HEADERS } from '@/lib/security'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Rate limiting on API routes
  if (pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = rateLimit(identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.resetIn),
            ...SECURITY_HEADERS,
          },
        }
      )
    }
  }

  // 2. Apply security headers to all responses
  const response = NextResponse.next()
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get admin auth cookie
  const authCookie = request.cookies.get('admin-auth')?.value

  // Protect admin routes, but allow login page
  if (request.nextUrl.pathname.startsWith('/admin') && 
      request.nextUrl.pathname !== '/admin/login') {
    
    if (!authCookie || authCookie !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl.origin))
    }
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
    }
  })
}

export const config = {
  matcher: ['/admin/:path*']
}

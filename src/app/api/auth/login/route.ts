import { NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Handle both JSON and form data
    let username: string | undefined
    let password: string | undefined

    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      // JSON request (from JavaScript)
      const body = await request.json()
      username = body.username
      password = body.password
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      // Form submission (HTML form)
      const formData = await request.formData()
      username = formData.get('username') as string
      password = formData.get('password') as string
    }

    if (!username || !password) {
      // For form submissions, return HTML error page
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        return new Response(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px;">
              <h1 style="color: #dc3545;">Login Error</h1>
              <p>Username and password are required.</p>
              <a href="/admin/login-simple" style="color: #007bff;">Back to Login</a>
            </body>
          </html>
        `, {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        })
      }
      
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    const isValid = validateCredentials(username, password)

    if (isValid) {
      // For form submissions, redirect to admin dashboard
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        const response = NextResponse.redirect(new URL('/admin', request.url), 303)
        
        // Set secure cookie
        response.cookies.set('admin-auth', 'true', {
          httpOnly: false, // Allow client-side access for authentication check
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600, // 1 hour for better security
          path: '/',
        })

        return response
      }
      
      // For JSON requests, return success
      const response = NextResponse.json({ success: true })
      
      // Set secure cookie
      response.cookies.set('admin-auth', 'true', {
        httpOnly: false, // Allow client-side access for authentication check
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour for better security
        path: '/',
      })

      return response
    } else {
      // For form submissions, redirect back to login with error
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        return NextResponse.redirect(new URL('/admin?error=invalid', request.url), 303)
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

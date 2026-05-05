import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function BypassPage() {
  // Set authentication cookie and redirect
  async function authenticate() {
    'use server'
    
    const cookieStore = cookies()
    cookieStore.set('admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    })
    
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Bypass</h1>
          <p className="text-gray-600 mb-6">
            Click the button below to authenticate and access the admin dashboard.
            This method bypasses JavaScript requirements.
          </p>
          
          <form action={authenticate}>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Access Admin Dashboard
            </button>
          </form>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>This sets a secure authentication cookie and redirects to admin.</p>
            <p>Cookie expires in 1 hour for security.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

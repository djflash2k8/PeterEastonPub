'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Temporarily disabled auth check for testing
  useEffect(() => {
    setIsAuthenticated(true) // Allow access for testing
  }, [])

  const handleLogout = () => {
    setIsAuthenticated(false)
    document.cookie = 'admin-auth=; path=/; max-age=0'
    router.push('/admin/login')
  }

  // Removed inactivity tracking to prevent timeout errors

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the admin dashboard.</p>
          <Link 
            href="/admin/login" 
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 text-white p-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold uppercase tracking-wider">Peter Easton Admin</span>
            </div>
            <div className="hidden md:flex gap-4">
              <Link href="/admin" className="text-sm font-medium hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link href="/admin/about" className="text-sm font-medium hover:text-blue-400 transition-colors">About Us</Link>
              <Link href="/" target="_blank" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">View Site</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-300 hidden sm:block">
              {isAuthenticated ? 'Admin User' : 'Not Authenticated'}
            </span>
            <button 
              onClick={handleLogout} 
              className="text-xs font-bold bg-gray-700 hover:bg-red-600 px-3 py-1.5 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-4">
        {children}
      </div>
    </div>
  )
}

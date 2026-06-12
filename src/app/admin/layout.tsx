'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NavigationItem {
  id: string
  text: string
  href: string
  target: '_self' | '_blank'
}

interface NavigationSettings {
  adminTitle: string
  navigationItems: NavigationItem[]
}

const defaultNavigation: NavigationSettings = {
  adminTitle: 'Peter Easton Admin',
  navigationItems: [
    {
      id: 'dashboard',
      text: 'Dashboard',
      href: '/admin',
      target: '_self'
    },
    {
      id: 'about',
      text: 'About Us',
      href: '/admin/about',
      target: '_self'
    },
    {
      id: 'viewSite',
      text: 'View Site',
      href: '/',
      target: '_blank'
    }
  ]
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [navigation, setNavigation] = useState<NavigationSettings>(defaultNavigation)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    // Check for error in URL parameters using URLSearchParams
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      if (error === 'invalid') {
        setLoginError('Invalid username or password')
        // Clear error from URL but stay on login page
        const url = new URL(window.location.href)
        url.searchParams.delete('error')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [])

  const checkAuth = () => {
    const authCookie = document.cookie
      .split('; ')
      .find(cookie => cookie.trim().startsWith('admin-auth='))

    if (authCookie) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchNavigation()
    }
  }, [isAuthenticated])

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/admin-navigation')
      const data = await res.json()
      setNavigation(data)
    } catch (error) {
      console.error('Failed to fetch navigation settings:', error)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    document.cookie = 'admin-auth=; path=/; max-age=0'
    router.push('/admin/login')
  }

  // Removed inactivity tracking to prevent timeout errors

  if (!isAuthenticated) {

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">PE</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Peter Easton&apos;s Pub Management System
            </p>
          </div>
          
          <form className="mt-8 space-y-6" action="/api/auth/login" method="POST" autoComplete="on">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {loginError}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
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
              <span className="text-sm font-bold uppercase tracking-wider">{navigation.adminTitle}</span>
            </div>
            <div className="hidden md:flex gap-4">
              {navigation.navigationItems.map(item => (
                <Link 
                  key={item.id}
                  href={item.href} 
                  target={item.target}
                  className={`text-sm font-medium transition-colors ${
                    item.target === '_blank' ? 'text-gray-400 hover:text-white' : 'hover:text-blue-400'
                  }`}
                >
                  {item.text}
                </Link>
              ))}
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

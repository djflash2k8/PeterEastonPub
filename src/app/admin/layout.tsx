'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [navigation, setNavigation] = useState<NavigationSettings>(defaultNavigation)
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
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin-navigation', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setNavigation(data)
      }
    } catch (error) {
      console.error('Failed to fetch navigation settings:', error)
    }
  }

  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    router.replace('/admin/login')
  }

  // 1. If we're on the login page, just render the children (the login form)
  if (isLoginPage) {
    return <>{children}</>
  }

  // 2. While checking auth, show loading
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Authenticating...</p>
        </div>
      </div>
    )
  }

  // 3. If not authenticated and not on login page, return null (redirecting)
  if (isAuthenticated === false) {
    return null
  }

  // 4. Authenticated admin view
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
              Admin User
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

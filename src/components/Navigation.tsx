'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavigationItem {
  id: string
  text: string
  href: string
  target: '_self' | '_blank'
}

interface FrontendNavigationSettings {
  brandName: string
  navigationItems: NavigationItem[]
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navigation, setNavigation] = useState<FrontendNavigationSettings>({
    brandName: "Peter Easton's Pub",
    navigationItems: [
      {
        id: 'home',
        text: 'Home',
        href: '/',
        target: '_self'
      },
      {
        id: 'events',
        text: 'Events',
        href: '/events',
        target: '_self'
      },
      {
        id: 'about',
        text: 'About Us',
        href: '/about-us',
        target: '_self'
      },
      {
        id: 'contact',
        text: 'Contact Us',
        href: '/contact-us',
        target: '_self'
      }
    ]
  })

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/frontend-navigation')
      const data = await res.json()
      setNavigation(data)
    } catch (error) {
      console.error('Failed to fetch frontend navigation:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-gray-800 text-white relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <span className="text-xl font-bold">{navigation.brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.navigationItems.map(item => (
                <Link 
                  key={item.id}
                  href={item.href} 
                  target={item.target}
                  className="hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={closeMenu}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.navigationItems.map(item => (
              <Link
                key={item.id}
                href={item.href}
                target={item.target}
                className="hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenu}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
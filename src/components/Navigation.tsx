'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [navigation, setNavigation] = useState<FrontendNavigationSettings>({
    brandName: "Peter Easton's Pub",
    navigationItems: [
      { id: 'home', text: 'Home', href: '/', target: '_self' },
      { id: 'events', text: 'Events', href: '/events', target: '_self' },
      { id: 'about', text: 'About Us', href: '/about-us', target: '_self' },
      { id: 'contact', text: 'Contact Us', href: '/contact-us', target: '_self' },
    ]
  })

  useEffect(() => {
    fetchNavigation()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'shadow-lg'
          : ''
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(26, 28, 30, 0.97)' : '#1A1C1E',
        borderBottom: '1px solid rgba(243, 179, 64, 0.18)',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand / Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            style={{ textDecoration: 'none' }}
            onClick={closeMenu}
          >
            <span
              className="text-xl font-bold tracking-tight transition-colors duration-200"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#F3B340',
              }}
            >
              {navigation.brandName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.navigationItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  onClick={closeMenu}
                  className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 group"
                  style={{
                    color: isActive ? '#F3B340' : '#E0E0E0',
                    backgroundColor: isActive ? 'rgba(243, 179, 64, 0.1)' : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#F3B340'
                      ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(243, 179, 64, 0.08)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#E0E0E0'
                      ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {item.text}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                      style={{ backgroundColor: '#F3B340' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md transition-colors duration-200"
              style={{ color: '#E0E0E0' }}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t"
          id="mobile-menu"
          style={{
            backgroundColor: '#1A1C1E',
            borderColor: 'rgba(243, 179, 64, 0.15)',
          }}
        >
          <div className="px-3 pt-2 pb-4 space-y-1">
            {navigation.navigationItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                  style={{
                    color: isActive ? '#F3B340' : '#E0E0E0',
                    backgroundColor: isActive ? 'rgba(243, 179, 64, 0.1)' : 'transparent',
                    textDecoration: 'none',
                    borderLeft: isActive ? '3px solid #F3B340' : '3px solid transparent',
                  }}
                >
                  {item.text}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

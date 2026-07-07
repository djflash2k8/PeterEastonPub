'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Banner() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header style={{ backgroundColor: '#0D0E10', borderBottom: '1px solid rgba(243,179,64,0.2)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
            >
              Peter Easton's Pub
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="font-semibold transition-colors duration-300 hover:text-[#F3B340]"
              style={{ color: '#E0E0E0' }}
            >
              Home
            </Link>
            <Link
              href="/events"
              className="font-semibold transition-colors duration-300 hover:text-[#F3B340]"
              style={{ color: '#E0E0E0' }}
            >
              Events
            </Link>
            <Link
              href="/photo-gallery"
              className="font-semibold transition-colors duration-300 hover:text-[#F3B340]"
              style={{ color: '#E0E0E0' }}
            >
              Photo Gallery
            </Link>
            <Link
              href="/about-us"
              className="font-semibold transition-colors duration-300 hover:text-[#F3B340]"
              style={{ color: '#E0E0E0' }}
            >
              About Us
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(243,179,64,0.1)' }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#F3B340' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2 pb-4">
            <Link
              href="/"
              className="block px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              style={{ backgroundColor: 'rgba(243,179,64,0.1)', color: '#E0E0E0' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className="block px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              style={{ backgroundColor: 'rgba(243,179,64,0.1)', color: '#E0E0E0' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/photo-gallery"
              className="block px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              style={{ backgroundColor: 'rgba(243,179,64,0.1)', color: '#E0E0E0' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Photo Gallery
            </Link>
            <Link
              href="/about-us"
              className="block px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              style={{ backgroundColor: 'rgba(243,179,64,0.1)', color: '#E0E0E0' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

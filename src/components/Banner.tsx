'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Banner() {
  const [bannerUrl, setBannerUrl] = useState('/images/banner01.jpg')

  useEffect(() => {
    fetch('/api/banner')
      .then(res => res.json())
      .then(data => {
        if (data.url) setBannerUrl(data.url)
      })
      .catch(err => console.error('Failed to load banner:', err))
  }, [])

  return (
    <div className="relative w-full h-[55vh] min-h-[340px] max-h-[600px] overflow-hidden">
      {/* Background Image */}
      <img
        src={bannerUrl}
        alt="Peter Easton's Pub"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-[8000ms] ease-out"
        style={{ transform: 'scale(1.03)' }}
        loading="eager"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-10 px-4 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 drop-shadow-lg"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#F3B340',
            textShadow: '0 2px 16px rgba(0,0,0,0.7)',
          }}
        >
          Peter Easton&apos;s Pub
        </h1>
        <p
          className="text-base sm:text-lg md:text-xl mb-6 max-w-xl drop-shadow"
          style={{ color: '#E0E0E0', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
        >
          Live Music &bull; Karaoke &bull; Open Mic &bull; Good Times
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/events" className="btn-gold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            See Upcoming Events
          </Link>
          <Link href="/contact-us" className="btn-outline-gold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Find Us
          </Link>
        </div>
      </div>
    </div>
  )
}

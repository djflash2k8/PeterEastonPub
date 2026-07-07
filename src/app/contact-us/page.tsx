'use client'

import { useState, useEffect } from 'react'
import Banner from '@/components/Banner'

interface Address {
  street: string
  city: string
  province: string
  postal: string
  country: string
}

interface SocialMedia {
  facebook: string
  instagram: string
  snapchat: string
  x: string
}

interface ContactData {
  address: Address
  phone: string
  email: string
  socialMedia: SocialMedia
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContact()
  }, [])

  const fetchContact = async () => {
    try {
      const response = await fetch('/api/contact')
      const data = await response.json()
      setContact(data)
    } catch (error) {
      console.error('Failed to load contact information:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
        <Banner />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div
              className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-4"
              style={{ borderColor: '#F3B340', borderTopColor: 'transparent' }}
            />
            <p style={{ color: '#8C8C8C' }}>Loading contact information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
        <Banner />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#ef4444' }}>Failed to load contact information.</p>
        </div>
      </div>
    )
  }

  const hasSocialMedia = Object.values(contact.socialMedia).some(url => url && url.trim() !== '')
  const mapQuery = encodeURIComponent(
    `${contact.address.street}, ${contact.address.city}, ${contact.address.province} ${contact.address.postal}, ${contact.address.country}`
  )
  // OpenStreetMap — no API key required, always free
  // Exact coordinates: 47.5634619, -52.7159441 (29 Cookstown Rd, St. John's, NL)
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-52.7209%2C47.5585%2C-52.7110%2C47.5685&layer=mapnik&marker=47.5634619%2C-52.7159441`

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
      <Banner />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Page Header */}
          <div className="mb-10">
            <h1
              className="text-4xl sm:text-5xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
            >
              Contact Us
            </h1>
            <div className="w-16 h-1 rounded-full" style={{ background: '#F3B340' }} />
            <p className="mt-4 text-lg" style={{ color: '#E0E0E0' }}>
              We&apos;d love to hear from you. Come visit us or reach out anytime!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left column: Contact info cards */}
            <div className="space-y-5">

              {/* Address */}
              <div className="contact-card">
                <div className="contact-card-label">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address
                </div>
                <address className="not-italic text-base leading-relaxed" style={{ color: '#E0E0E0' }}>
                  {contact.address.street}<br />
                  {contact.address.city}, {contact.address.province} {contact.address.postal}<br />
                  {contact.address.country}
                </address>
              </div>

              {/* Phone */}
              <div className="contact-card">
                <div className="contact-card-label">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone
                </div>
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                  className="text-lg font-medium transition-opacity duration-200"
                  style={{ color: '#E0E0E0', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F3B340'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#E0E0E0'}
                >
                  {contact.phone}
                </a>
              </div>

              {/* Email */}
              <div className="contact-card">
                <div className="contact-card-label">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </div>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-base font-medium transition-opacity duration-200"
                  style={{ color: '#E0E0E0', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F3B340'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#E0E0E0'}
                >
                  {contact.email}
                </a>
              </div>

              {/* Social Media */}
              {hasSocialMedia && (
                <div className="contact-card">
                  <div className="contact-card-label">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Follow Us
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {contact.socialMedia.facebook && (
                      <a
                        href={contact.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn social-btn-facebook"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}
                    {contact.socialMedia.instagram && (
                      <a
                        href={contact.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn social-btn-instagram"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                    {contact.socialMedia.snapchat && (
                      <a
                        href={contact.socialMedia.snapchat}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn social-btn-snapchat"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
                        </svg>
                        Snapchat
                      </a>
                    )}
                    {contact.socialMedia.x && (
                      <a
                        href={contact.socialMedia.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn social-btn-x"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X (Twitter)
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Google Maps embed */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(243, 179, 64, 0.2)',
                minHeight: '380px',
              }}
            >
              <iframe
                title="Peter Easton's Pub Location — 29 Cookstown Rd, St. John's, NL"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px', display: 'block' }}
                allowFullScreen
                loading="lazy"
              />
              <a
                href="https://www.google.com/maps/search/29+Cookstown+Rd,+St.+John%27s,+NL"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 text-sm font-semibold transition-colors duration-200"
                style={{ background: 'rgba(243,179,64,0.08)', color: '#F3B340', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(243,179,64,0.16)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(243,179,64,0.08)'}
              >
                📍 Open in Google Maps →
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

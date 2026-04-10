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
      <div className="min-h-screen flex flex-col">
        <Banner />
        <div className="flex-1">

          <main className="p-8">
            <div className="text-center py-8">
              <div className="text-gray-500">Loading contact information...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <div className="flex-1">

          <main className="p-8">
            <div className="text-center py-8">
              <div className="text-red-500">Failed to load contact information</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const hasSocialMedia = Object.values(contact.socialMedia).some(url => url && url.trim() !== '')

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <div className="flex-1">
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Address</h2>
              <p className="text-gray-700 text-lg">
                {contact.address.street}<br />
                {contact.address.city}, {contact.address.province} {contact.address.postal}<br />
                {contact.address.country}
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Phone</h2>
              <p className="text-gray-700 text-lg">
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="hover:underline hover:text-blue-600 transition-colors">
                  {contact.phone}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Email</h2>
              <p className="text-gray-700 text-lg">
                <a href={`mailto:${contact.email}`} className="hover:underline hover:text-blue-600 transition-colors">
                  {contact.email}
                </a>
              </p>
            </section>

            {hasSocialMedia && (
              <section>
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Follow Us</h2>
                <div className="flex gap-4 flex-wrap">
                  {contact.socialMedia.facebook && (
                    <a 
                      href={contact.socialMedia.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  
                  {contact.socialMedia.snapchat && (
                    <a 
                      href={contact.socialMedia.snapchat} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
                      </svg>
                      Snapchat
                    </a>
                  )}
                  
                  {contact.socialMedia.x && (
                    <a 
                      href={contact.socialMedia.x} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X (Twitter)
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

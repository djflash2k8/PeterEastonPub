'use client'

import Banner from '@/components/Banner'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import EventModal from '@/components/EventModal'

// Icon map for offerings
const offeringIcons: Record<string, string> = {
  'live entertainment': '🎸',
  'great atmosphere': '🍺',
  'karaoke': '🎤',
  'open mic': '🎙️',
  'food': '🍔',
  'drinks': '🥃',
  'sports': '📺',
  'pool': '🎱',
  'darts': '🎯',
}

function getOfferingIcon(title: string): string {
  const key = title.toLowerCase()
  for (const [k, v] of Object.entries(offeringIcons)) {
    if (key.includes(k)) return v
  }
  return '⭐'
}

function formatTime12h(timeStr: string): string {
  if (!timeStr) return ''
  try {
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  } catch (e) {
    return timeStr
  }
}

export default function Home() {
  const [content, setContent] = useState({
    welcomeTitle: "Welcome to Peter Easton's Pub!",
    welcomeDescription: 'Your local destination for great entertainment and good times!',
    aboutTitle: 'About Us',
    aboutContent: "Located in the heart of St. John's, Peter Easton's Pub has been serving the community with great food, drinks, and entertainment for years. Join us for a memorable experience!",
    whatWeOfferTitle: 'What We Offer',
    offerings: [
      { title: 'Live Entertainment', description: 'Regular live music performances and special events' },
      { title: 'Great Atmosphere', description: 'Friendly staff and welcoming environment' }
    ],
    tags: ['Live Music', 'Karaoke', 'Open Mic']
  })
  const [nextEvent, setNextEvent] = useState<{
    id: string
    title: string
    date: string
    startTime?: string
    endTime?: string
    description: string
    imageUrl?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (event: any) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const contentResponse = await fetch('/api/home-content')
        if (contentResponse.ok) {
          const data = await contentResponse.json()
          setContent(data)
        }

        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const events = await eventsResponse.json()
          const today = new Date().toISOString().split('T')[0]
          const next = events
            .filter((e: any) => e.date >= today)
            .sort((a: any, b: any) => {
              const aDate = new Date(`${a.date}T${a.startTime || '00:00'}`)
              const bDate = new Date(`${b.date}T${b.startTime || '00:00'}`)
              return aDate.getTime() - bDate.getTime()
            })[0] || null
          setNextEvent(next)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Banner />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div
              className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-4"
              style={{ borderColor: '#F3B340', borderTopColor: 'transparent' }}
            />
            <p style={{ color: '#8C8C8C' }}>Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
      <Banner />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

          {/* ── Welcome & Tags ── */}
          <section>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
            >
              {content.welcomeTitle}
            </h2>
            <p className="text-lg mb-5" style={{ color: '#E0E0E0' }}>
              {content.welcomeDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              {(content.tags || []).map((tag, i) => (
                <span key={i} className="pub-tag">{tag}</span>
              ))}
            </div>
          </section>

          <hr className="gold-divider" />

          {/* ── Next Event ── */}
          {nextEvent && (
            <section>
              <h2 className="section-heading">Next Event</h2>
              <div
                className="pub-card p-5 flex flex-col sm:flex-row gap-5 cursor-pointer hover:bg-[#242628] transition-colors duration-300"
                style={{ borderLeft: '4px solid #F3B340' }}
                onClick={() => openModal(nextEvent)}
              >
                {nextEvent.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={nextEvent.imageUrl}
                      alt={nextEvent.title}
                      className="w-full sm:w-48 md:w-36 h-48 md:h-36 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
                  >
                    {nextEvent.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ background: 'rgba(243,179,64,0.12)', color: '#F3B340' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {nextEvent.date}
                    </span>
                    {nextEvent.startTime && (
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ background: 'rgba(140,140,140,0.12)', color: '#8C8C8C' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime12h(nextEvent.startTime)}{nextEvent.endTime ? ` – ${formatTime12h(nextEvent.endTime)}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#E0E0E0' }}>
                    {nextEvent.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/events" className="btn-outline-gold text-sm">
                  View All Events →
                </Link>
              </div>
            </section>
          )}

          {/* ── About Us ── */}
          <section>
            <h2 className="section-heading">{content.aboutTitle}</h2>
            <div
              className="pub-card p-6"
            >
              <p className="leading-relaxed" style={{ color: '#E0E0E0' }}>
                {content.aboutContent}
              </p>
              <div className="mt-4">
                <Link href="/about-us" className="btn-outline-gold text-sm">
                  Learn More →
                </Link>
              </div>
            </div>
          </section>

          {/* ── What We Offer ── */}
          <section>
            <h2 className="section-heading">{content.whatWeOfferTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(content.offerings || []).map((offering, i) => (
                <div key={i} className="pub-card p-6">
                  <div className="offering-icon">
                    {getOfferingIcon(offering.title)}
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
                  >
                    {offering.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#E0E0E0' }}>
                    {offering.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer strip ── */}
          <footer className="pt-6 pb-2 text-center" style={{ borderTop: '1px solid rgba(243,179,64,0.12)' }}>
            <p className="text-sm" style={{ color: '#8C8C8C' }}>
              &copy; {new Date().getFullYear()} Peter Easton&apos;s Pub &mdash; 29 Cookstown Rd, St. John&apos;s, NL
            </p>
          </footer>

        </div>
      </main>

      <EventModal 
        event={selectedEvent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

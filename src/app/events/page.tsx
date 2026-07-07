'use client'

<<<<<<< HEAD
import { useState } from 'react'
=======
import { useEffect, useState } from 'react'
>>>>>>> e0a5819471b71fea4a8fe0f9cd73a7d62950d7ce
import { useEvents } from './EventsContext'
import EventModal from '@/components/EventModal'

interface PublicInstagramSettings {
  enabled: boolean
  sourceAccountUrl: string
  defaultHashtag: string
  showSourceAttribution: boolean
}

export default function PublicEventsPage() {
  const { events, loading } = useEvents()
<<<<<<< HEAD
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (event: any) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

=======
  const [instagramSettings, setInstagramSettings] = useState<PublicInstagramSettings>({
    enabled: false,
    sourceAccountUrl: '',
    defaultHashtag: '',
    showSourceAttribution: false
  })

  useEffect(() => {
    const loadInstagramSettings = async () => {
      try {
        const response = await fetch('/api/instagram-settings/public')
        const data = await response.json()
        setInstagramSettings({
          enabled: Boolean(data.enabled),
          sourceAccountUrl: typeof data.sourceAccountUrl === 'string' ? data.sourceAccountUrl : '',
          defaultHashtag: typeof data.defaultHashtag === 'string' ? data.defaultHashtag : '',
          showSourceAttribution: Boolean(data.showSourceAttribution)
        })
      } catch {
        setInstagramSettings({
          enabled: false,
          sourceAccountUrl: '',
          defaultHashtag: '',
          showSourceAttribution: false
        })
      }
    }

    loadInstagramSettings()
  }, [])
      
>>>>>>> e0a5819471b71fea4a8fe0f9cd73a7d62950d7ce
  const format12Hour = (time?: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = events.filter(e => e.date >= today)
  const pastEvents = events.filter(e => e.date < today && e.archived)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">

        {/* Page Header */}
        <div className="mb-10">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
          >
            Upcoming Events
          </h1>
          <div className="w-16 h-1 rounded-full" style={{ background: '#F3B340' }} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-4"
              style={{ borderColor: '#F3B340', borderTopColor: 'transparent' }}
            />
            <p style={{ color: '#8C8C8C' }}>Gathering the schedule...</p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Upcoming Events */}
            <section>
              <div className="space-y-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="pub-card flex flex-col md:flex-row gap-0 overflow-hidden cursor-pointer hover:bg-[#242628] transition-colors duration-300"
                      style={{ borderLeft: '4px solid #F3B340' }}
                      onClick={() => openModal(event)}
                    >
                      {event.imageUrl && (
                        <div className="w-full md:w-52 h-64 md:h-48 flex-shrink-0 overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                          <h2
                            className="text-2xl font-bold leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
                          >
                            {event.title}
                          </h2>
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold flex-shrink-0"
                            style={{ background: 'rgba(243,179,64,0.12)', color: '#F3B340', border: '1px solid rgba(243,179,64,0.25)' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {event.date}
                          </span>
                        </div>
                        {instagramSettings.showSourceAttribution && event.sourceUrl && (
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-700">
                            <span>Instagram</span>
                            <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-pink-300 underline-offset-2">
                              View Post
                            </a>
                          </div>
                        )}
                        {event.startTime && (
                          <p
                            className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3 px-3 py-1 rounded-lg"
                            style={{ background: 'rgba(140,140,140,0.1)', color: '#E0E0E0' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {format12Hour(event.startTime)}
                            {event.endTime ? ` – ${format12Hour(event.endTime)}` : ''}
                          </p>
                        )}
                        <p className="leading-relaxed text-sm" style={{ color: '#E0E0E0' }}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="text-center py-20 rounded-2xl"
                    style={{ background: '#242628', border: '1px solid rgba(243,179,64,0.12)' }}
                  >
                    <div className="text-5xl mb-4">🎸</div>
                    <p
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
                    >
                      No Upcoming Events
                    </p>
                    <p style={{ color: '#8C8C8C' }}>
                      No upcoming events scheduled. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Past Events Gallery */}
            {pastEvents.length > 0 && (
              <section
                className="mt-12 pt-10"
                style={{ borderTop: '1px solid rgba(243,179,64,0.12)' }}
              >
                <h2
                  className="text-sm font-bold uppercase tracking-widest mb-6"
                  style={{ color: '#8C8C8C' }}
                >
                  Past Events Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                  {pastEvents.map(event => (
                    <div
                      key={event.id}
                      className="rounded-lg overflow-hidden text-center cursor-pointer"
                      style={{ background: '#242628', border: '1px solid rgba(243,179,64,0.1)' }}
                      onClick={() => openModal(event)}
                    >
                      {event.imageUrl && (
                        <img src={event.imageUrl} alt="" className="w-full h-24 object-cover" />
                      )}
                      <div className="p-2">
                        <p className="text-xs font-bold truncate" style={{ color: '#E0E0E0' }}>
                          {event.title}
                        </p>
                        <p className="text-[10px]" style={{ color: '#8C8C8C' }}>{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <EventModal 
        event={selectedEvent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useEvents } from './EventsContext'

interface PublicInstagramSettings {
  enabled: boolean
  sourceAccountUrl: string
  defaultHashtag: string
  showSourceAttribution: boolean
}

export default function PublicEventsPage() {
  const { events, loading } = useEvents()
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
     <div className="min-h-screen flex flex-col">     
      <main className="max-w-4xl mx-auto p-6 w-full flex-1">
        <h1 className="text-5xl font-black italic mb-10 border-b-8 border-black pb-2 uppercase tracking-tighter">
          Upcoming Events
        </h1>

        {loading ? (
          <p className="text-center font-bold py-20">Gathering the schedule...</p>
        ) : (
          <div className="space-y-12">
            <section>
              <div className="grid gap-8">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="border-4 border-black p-6 flex flex-col md:flex-row gap-6 hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                      {event.imageUrl && (
                        <div className="w-full md:w-48 h-48 flex-shrink-0">
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover border-2 border-black" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                          <h2 className="text-3xl font-black uppercase leading-tight">{event.title}</h2>
                          <div className="inline-block bg-black text-white px-3 py-1 text-lg font-bold">
                            {event.date}
                          </div>
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
                          <p className="text-xl font-bold text-red-600 mb-4">
                            {format12Hour(event.startTime)} 
                            {event.endTime ? ` - ${format12Hour(event.endTime)}` : ''}
                          </p>
                        )}
                        <p className="text-lg leading-relaxed text-gray-800">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-2xl italic text-gray-400 text-center py-10">No upcoming events scheduled. Check back soon!</p>
                )}
              </div>
            </section>

            {pastEvents.length > 0 && (
              <section className="mt-20 pt-10 border-t-2 border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-400 uppercase tracking-widest">Past Events Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                  {pastEvents.map(event => (
                    <div key={event.id} className="border border-gray-200 p-2 text-center">
                      {event.imageUrl && <img src={event.imageUrl} alt="" className="w-full h-24 object-cover mb-2" />}
                      <p className="text-xs font-bold truncate">{event.title}</p>
                      <p className="text-[10px]">{event.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
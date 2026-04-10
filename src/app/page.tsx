'use client'

import Banner from '@/components/Banner'
import { useState, useEffect } from 'react'

export default function Home() {
  const [content, setContent] = useState({
    welcomeTitle: 'Welcome to Peter Easton\'s Pub!',
    welcomeDescription: 'Your local destination for great entertainment and good times!',
    aboutTitle: 'About Us',
    aboutContent: 'Located in the heart of St. John\'s, Peter Easton\'s Pub has been serving the community with great food, drinks, and entertainment for years. Join us for a memorable experience!',
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

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load home page content
        const contentResponse = await fetch('/api/home-content')
        if (contentResponse.ok) {
          const data = await contentResponse.json()
          setContent(data)
        }

        // Load events and find next upcoming event
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const events = await eventsResponse.json()
          const today = new Date().toISOString().split('T')[0]
          
          const nextEvent = events
            .filter(e => e.date >= today)
            .sort((a, b) => {
              const aDate = new Date(`${a.date}T${a.startTime || '00:00'}`)
              const bDate = new Date(`${b.date}T${b.startTime || '00:00'}`)
              return aDate.getTime() - bDate.getTime()
            })[0] || null
          
          setNextEvent(nextEvent)
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
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      
      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile-First Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Main Content - Takes priority on mobile */}
            <div className="flex-1 order-1 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {content.welcomeTitle}
                </h1>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    {content.welcomeDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {(content.tags || []).map((tag, index) => (
                      <span 
                        key={index}
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          index === 0 ? 'bg-blue-100 text-blue-800' :
                          index === 1 ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  

                  {/* Additional content sections */}
                  <div className="mt-6 space-y-6">
                    {/* Next Event Section */}
                    {nextEvent && (
                      <section className="border-t pt-6">
                        <h2 className="text-xl font-semibold mb-3">Next Event</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {nextEvent.imageUrl && (
                              <div className="flex-shrink-0">
                                <img
                                  src={nextEvent.imageUrl}
                                  alt={nextEvent.title}
                                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{nextEvent.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                                  {nextEvent.date}
                                </span>
                                {nextEvent.startTime && (
                                  <span className="inline-block bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                                    {nextEvent.startTime}
                                    {nextEvent.endTime ? ` - ${nextEvent.endTime}` : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{nextEvent.description}</p>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    <section className="border-t pt-6">
                      <h2 className="text-xl font-semibold mb-3">{content.aboutTitle}</h2>
                      <p className="text-gray-600 leading-relaxed">
                        {content.aboutContent}
                      </p>
                    </section>
                    
                    <section className="border-t pt-6">
                      <h2 className="text-xl font-semibold mb-3">{content.whatWeOfferTitle}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(content.offerings || []).map((offering, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">{offering.title}</h3>
                            <p className="text-sm text-gray-600">{offering.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Event {
  id: string
  date: string
  startTime?: string
  endTime?: string
  title: string
  description: string
  imageUrl?: string
  isRecurring?: boolean
  archived?: boolean
}

interface EventsContextType {
  events: Event[]
  loading: boolean
  refreshEvents: () => Promise<void>
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch events if we're on a page that needs them
    // Check if we're on the events page or admin pages that need events
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname.includes('/events') || pathname.includes('/admin/edit-events')) {
        fetchEvents()
      }
    }
  }, [])

  return (
    <EventsContext.Provider value={{ events, loading, refreshEvents: fetchEvents }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within an EventsProvider')
  return context
}
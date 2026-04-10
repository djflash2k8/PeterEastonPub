'use client'

import { EventsProvider } from '../app/events/EventsContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EventsProvider>
      {children}
    </EventsProvider>
  )
}

'use client'
// @ts-ignore
import 'react-calendar/dist/Calendar.css'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'

interface Event {
  id: string
  date: string
  startTime?: string
  endTime?: string
  title: string
  description: string
}

export default function CalendarComponent() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventsOnDate, setEventsOnDate] = useState<Event[]>([])

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents)
  }, [])

  // --- HELPER TO PREVENT "NOT DEFINED" ERROR ---
  const format12Hour = (time?: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const hasEvent = (date: Date) => {
    return events.some(event => event.date === getDateString(date))
  }

  const handleDateClick = (date: Date) => {
    const dateStr = getDateString(date)
    const dayEvents = events.filter(event => event.date === dateStr)
    const sortedEvents = [...dayEvents].sort((a, b) => 
      (a.startTime || '').localeCompare(b.startTime || '')
    )

    if (dayEvents.length > 0) {
      setSelectedDate(date)
      setEventsOnDate(sortedEvents)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Calendar</h3>
      <Calendar
        onClickDay={handleDateClick}
        tileContent={({ date, view }) => {
          if (view === 'month' && hasEvent(date)) {
            return <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
          }
          return null
        }}
      />

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Events on {selectedDate.toDateString()}</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {eventsOnDate.map(event => (
                <div key={event.id} className="p-3 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-blue-900">{event.title}</h3>
                    {event.startTime && (
                      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {format12Hour(event.startTime)} 
                        {event.endTime ? ` - ${format12Hour(event.endTime)}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDate(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
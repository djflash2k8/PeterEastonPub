'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useEvents } from '../../events/EventsContext'
import InstagramSync from '@/components/Admin/InstagramSync'

interface Event {
  id: string
  date: string
  startTime?: string
  endTime?: string
  title: string
  description: string
  imageUrl?: string
  isRecurring?: boolean
  archived?: boolean
  sourceId?: string
  sourceUrl?: string
  sourceLabel?: string
}

export default function EditEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const { refreshEvents } = useEvents()
  const [isInstagramSyncOpen, setIsInstagramSyncOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newEvent, setNewEvent] = useState({ 
    date: '', 
    startTime: '', 
    endTime: '', 
    title: '', 
    description: '',
    imageUrl: '',
    isRecurring: false,
    archived: false
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPastEvents, setShowPastEvents] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    console.log('Fetching events...')
    const res = await fetch('/api/events')
    const data = await res.json()
    console.log('Events received:', data)
    setEvents(Array.isArray(data) ? data : [])
    refreshEvents() // Keep the SidePane in sync
  }

  const format12Hour = (time?: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('date', newEvent.date)
    formData.append('startTime', newEvent.startTime)
    formData.append('endTime', newEvent.endTime)
    formData.append('title', newEvent.title)
    formData.append('description', newEvent.description)
    formData.append('isRecurring', String(newEvent.isRecurring))
    formData.append('archived', String(newEvent.archived))

    if (selectedFile) {
      formData.append('image', selectedFile)
    } else {
      formData.append('imageUrl', newEvent.imageUrl)
    }

    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/events/${editingId}` : '/api/events'

    try {
      const res = await fetch(url, {
        method,
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Server error: ${res.status}`);
      }

      setEditingId(null)
      setNewEvent({ date: '', startTime: '', endTime: '', title: '', description: '', imageUrl: '', isRecurring: false, archived: false })
      setSelectedFile(null)
      fetchEvents()
    } catch (err: any) {
      alert(`Failed to save event: ${err.message}`)
    }
  }

  const handleEdit = (event: Event) => {
    setNewEvent({ 
      date: event.date, 
      startTime: event.startTime || '', 
      endTime: event.endTime || '', 
      title: event.title, 
      description: event.description,
      imageUrl: event.imageUrl || '',
      isRecurring: event.isRecurring || false,
      archived: event.archived || false
    })
    setEditingId(event.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    fetchEvents()
  }

  const handleReAddNextWeek = async (event: Event) => {
    // Calculate same day next week from today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDayOfWeek = new Date(event.date + 'T00:00:00').getDay()
    
    // Find the next occurrence of the same day of week
    let nextWeekDate = new Date(today)
    nextWeekDate.setDate(today.getDate() + (7 - today.getDay() + eventDayOfWeek) % 7 || 7)
    
    // If that date is in the past or today, add 7 more days
    if (nextWeekDate <= today) {
      nextWeekDate.setDate(nextWeekDate.getDate() + 7)
    }
    
    const formattedDate = nextWeekDate.toISOString().split('T')[0]

    console.log('Original event:', event)
    console.log('Today:', today.toISOString().split('T')[0])
    console.log('Next week date:', formattedDate)

    const formData = new FormData()
    formData.append('title', event.title)
    formData.append('date', formattedDate)
    formData.append('startTime', event.startTime || '')
    formData.append('endTime', event.endTime || '')
    formData.append('description', event.description)
    formData.append('isRecurring', String(event.isRecurring))
    if (event.imageUrl) {
      formData.append('imageUrl', event.imageUrl)
    }

    try {
      console.log('Sending request to /api/events')
      const res = await fetch('/api/events', { method: 'POST', body: formData })
      console.log('Response status:', res.status)
      
      if (res.ok) {
        const result = await res.json()
        console.log('Event created:', result)
        fetchEvents()
        alert('Event successfully added for next week!')
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Server error:', errorData)
        throw new Error(errorData.error || errorData.message || `Server error: ${res.status}`)
      }
    } catch (err: any) {
      console.error('Failed to clone event:', err)
      alert(`Failed to add event for next week: ${err.message}`)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = events.filter(e => e.date >= today)
  const pastEvents = events.filter(e => e.date < today && e.archived)

  const openInstagramSync = () => setIsInstagramSyncOpen(true)
  const closeInstagramSync = () => setIsInstagramSyncOpen(false)

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
      </div>
      <div className="mb-6 border border-dashed border-gray-300 rounded p-4 bg-gray-50 text-sm text-gray-700">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>
            Instagram import is being added as a layer on top of this editor, so future posts can become regular events without changing the current workflow.
          </p>
          <Link href="/admin/instagram-settings" className="text-blue-600 hover:underline font-bold whitespace-nowrap">
            Configure Instagram Settings
          </Link>
        </div>
      </div>
      <h1 className="text-xl font-bold mb-4 text-black">Edit Events</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openInstagramSync}
          className="rounded border-2 border-black bg-pink-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white hover:bg-pink-700"
        >
          Instagram Import
        </button>
        <span className="text-sm text-gray-500">Search posts, preview them, and create events from selected Instagram content.</span>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-4 items-end border-b pb-6 text-black">
        <div className="flex flex-col">
          <label className="text-xs font-bold mb-1">Date</label>
          <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="border p-2" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold mb-1">Start</label>
          <input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className="border p-2" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold mb-1">End</label>
          <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className="border p-2" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold mb-1">Title</label>
          <input type="text" placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="border p-2" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold mb-1">Event Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
            className="border p-2" 
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="text-xs font-bold mb-1">Description</label>
          <input type="text" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="border p-2" required />
        </div>
        <div className="flex items-center gap-2 pb-3">
          <input 
            type="checkbox" 
            id="recurring"
            checked={newEvent.isRecurring} 
            onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })} 
          />
          <label htmlFor="recurring" className="text-xs font-bold cursor-pointer">Recurring Weekly</label>
        </div>
        <div className="flex items-center gap-2 pb-3">
          <input 
            type="checkbox" 
            id="archived"
            checked={newEvent.archived} 
            onChange={(e) => setNewEvent({ ...newEvent, archived: e.target.checked })} 
          />
          <label htmlFor="archived" className="text-xs font-bold cursor-pointer">Archive</label>
        </div>
        <button type="submit" className="p-2 bg-green-500 text-white rounded font-bold px-4">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4 text-black border-b pb-2">Upcoming Events</h2>
        <ul className="text-black">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <li 
                key={event.id} 
                className="border-2 border-black p-3 mb-3 flex justify-between items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleEdit(event)}
              >
                <div className="flex gap-4 items-center">
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt="" className="w-16 h-16 object-cover rounded bg-gray-100" />
                  )}
                  <div>
                    <span className="font-bold text-lg">{event.title}</span>
                    <div className="text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">{event.date}</span>
                      {event.startTime && (
                        <span className="text-blue-600 font-medium">
                          {format12Hour(event.startTime)} 
                          {event.endTime ? ` to ${format12Hour(event.endTime)}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-1 text-sm line-clamp-1">{event.description}</p>
                    {(event.sourceUrl || event.sourceLabel) && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pink-700">
                        <span>{event.sourceLabel || 'Imported'}</span>
                        {event.sourceUrl && <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="underline">Source</a>}
                      </div>
                    )}
                    {event.isRecurring && (
                      <span className="text-[10px] uppercase font-black bg-yellow-300 px-1 mt-1 inline-block">Recurring</span>
                    )}
                    {event.archived && (
                      <span className="text-[10px] uppercase font-black bg-purple-300 px-1 mt-1 inline-block">Archive</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleReAddNextWeek(event)} 
                    className="p-2 bg-orange-400 text-white rounded text-xs font-bold px-3 hover:bg-orange-500"
                  >+ Next Week</button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-500 text-white rounded text-sm px-4">Delete</button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic mb-4">No upcoming events scheduled.</p>
          )}
        </ul>

        {pastEvents.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-400">Past Events</h2>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="show-past-events"
                  checked={showPastEvents} 
                  onChange={(e) => setShowPastEvents(e.target.checked)} 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="show-past-events" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Show Past Events
                </label>
              </div>
            </div>
            {showPastEvents && (
              <ul className="text-black opacity-60">
                {pastEvents.map(event => (
                  <li 
                    key={event.id} 
                    className="border p-3 mb-2 flex justify-between items-center bg-gray-50 rounded grayscale hover:grayscale-0 cursor-pointer transition-all"
                    onClick={() => handleEdit(event)}
                  >
                    <div className="flex gap-4 items-center">
                      {event.imageUrl && (
                        <img src={event.imageUrl} alt="" className="w-16 h-16 object-cover rounded bg-gray-100" />
                      )}
                      <div>
                        <span className="font-bold text-lg">{event.title}</span>
                        <div className="text-sm">
                          <span className="bg-gray-200 px-2 py-0.5 rounded mr-2">{event.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleReAddNextWeek(event)} 
                        className="p-2 bg-green-600 text-white rounded text-xs font-bold px-3 hover:bg-green-700"
                      >+ Next Week</button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-400 text-white rounded text-sm px-4">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <InstagramSync
        isOpen={isInstagramSyncOpen}
        onClose={closeInstagramSync}
        onImported={fetchEvents}
        existingEvents={events}
      />
    </div>
  )
}
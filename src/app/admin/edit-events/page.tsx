'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useEvents } from '../../events/EventsContext'
import MediaLibrary from '@/components/Admin/MediaLibrary'
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
}

export default function EditEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const { refreshEvents } = useEvents()
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
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [showInstagramSync, setShowInstagramSync] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    console.log('Fetching events...')
    const res = await fetch(`/api/events?t=${Date.now()}`)
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
      const token = localStorage.getItem('admin_token')
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
    const token = localStorage.getItem('admin_token')
    await fetch(`/api/events/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    fetchEvents()
  }

  const handleAutoCreateEvents = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      alert('Not authenticated')
      return
    }

    if (!confirm('Auto-create events from Instagram posts using settings?')) {
      return
    }

    try {
      const res = await fetch('/api/instagram-auto-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Server error: ${res.status}`)
      }

      const data = await res.json()
      alert(`Success! Created ${data.createdCount} event(s) from Instagram posts.`)
      fetchEvents()
    } catch (err: any) {
      alert(`Failed to auto-create events: ${err.message}`)
    }
  }

  const handleInstagramPostsSelected = async (instagramPosts: any[]) => {
    // Create events from selected Instagram posts
    for (const post of instagramPosts) {
      const formData = new FormData()
      formData.append('date', post.date)
      formData.append('startTime', '') // Instagram posts don't have time info
      formData.append('endTime', '')
      formData.append('title', post.title)
      formData.append('description', post.description)
      formData.append('isRecurring', 'false')
      formData.append('archived', 'false')
      formData.append('imageUrl', post.imageUrl)

      try {
        const token = localStorage.getItem('admin_token')
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error('Failed to create event from Instagram post:', errorData)
        }
      } catch (err: any) {
        console.error('Error creating event from Instagram post:', err)
      }
    }

    // Refresh events list and close modal
    setShowInstagramSync(false)
    fetchEvents()
    alert(`Successfully created ${instagramPosts.length} event${instagramPosts.length !== 1 ? 's' : ''} from Instagram posts!`)
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
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/events', { 
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData 
      })
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

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
      </div>
      <h1 className="text-xl font-bold mb-4 text-black">Edit Events</h1>

      {/* Instagram Sync Modal */}
      {showInstagramSync && (
        <InstagramSync
          onPostsSelected={handleInstagramPostsSelected}
          onClose={() => setShowInstagramSync(false)}
        />
      )}

      {showMediaLibrary && (
        <MediaLibrary 
          onClose={() => setShowMediaLibrary(false)}
          onSelect={(url) => {
            setNewEvent({ ...newEvent, imageUrl: url })
            setSelectedFile(null)
            setShowMediaLibrary(false)
          }}
        />
      )}
      
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
          <div className="flex gap-2">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null)
                setNewEvent({ ...newEvent, imageUrl: '' })
              }} 
              className="border p-2 text-xs w-48" 
            />
            <button 
              type="button"
              onClick={() => setShowMediaLibrary(true)}
              className="bg-gray-800 text-white px-3 py-2 rounded text-xs font-bold hover:bg-gray-700"
            >
              Library
            </button>
          </div>
          {newEvent.imageUrl && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-green-600 font-bold italic">Image selected from library</span>
              <button type="button" onClick={() => setNewEvent({...newEvent, imageUrl: ''})} className="text-[10px] text-red-500 underline">Clear</button>
            </div>
          )}
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
        <button 
          type="button"
          onClick={() => setShowInstagramSync(true)}
          className="p-2 bg-pink-500 hover:bg-pink-600 text-white rounded font-bold px-4 transition-colors"
          title="Import events from Instagram posts with a specific hashtag"
        >
          📷 Instagram
        </button>
        <button 
          type="button"
          onClick={handleAutoCreateEvents}
          className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-bold px-4 transition-colors"
          title="Auto-create events from Instagram based on settings"
        >
          ⚡ Auto-Create
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
    </div>
  )
}
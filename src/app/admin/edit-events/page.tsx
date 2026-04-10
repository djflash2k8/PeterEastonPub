'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useEvents } from '../../events/EventsContext'

interface Event {
  id: string
  date: string
  startTime?: string
  endTime?: string
  title: string
  description: string
  imageUrl?: string
  isRecurring?: boolean
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
    isRecurring: false
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch('/api/events')
    const data = await res.json()
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
      setNewEvent({ date: '', startTime: '', endTime: '', title: '', description: '', imageUrl: '', isRecurring: false })
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
      isRecurring: event.isRecurring || false
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
    // Calculate same day next week
    const d = new Date(event.date + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    const nextWeekDate = d.toISOString().split('T')[0]

    const formData = new FormData()
    formData.append('title', event.title)
    formData.append('date', nextWeekDate)
    formData.append('startTime', event.startTime || '')
    formData.append('endTime', event.endTime || '')
    formData.append('description', event.description)
    formData.append('isRecurring', String(event.isRecurring))
    if (event.imageUrl) {
      formData.append('imageUrl', event.imageUrl)
    }

    try {
      const res = await fetch('/api/events', { method: 'POST', body: formData })
      if (res.ok) {
        fetchEvents()
      }
    } catch (err) {
      console.error('Failed to clone event:', err)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = events.filter(e => e.date >= today)
  const pastEvents = events.filter(e => e.date < today)

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
      </div>
      <h1 className="text-xl font-bold mb-4 text-black">Edit Events</h1>
      
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
                    {event.isRecurring && (
                      <span className="text-[10px] uppercase font-black bg-yellow-300 px-1 mt-1 inline-block">Recurring</span>
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
            <h2 className="text-lg font-bold mb-4 text-gray-400 border-b pb-2">Past Events</h2>
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
          </div>
        )}
      </div>
    </div>
  )
}
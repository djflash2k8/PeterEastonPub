'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface HoursData {
  [key: string]: DayHours
}

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
]

export default function EditHours() {
  const [hours, setHours] = useState<HoursData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchHours()
  }, [])

  const fetchHours = async () => {
    try {
      const response = await fetch('/api/hours')
      const data = await response.json()
      setHours(data)
    } catch (error) {
      setMessage('Failed to load hours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDayChange = (dayId: string, field: keyof DayHours, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hours)
      })

      if (!response.ok) {
        throw new Error('Failed to save hours')
      }

      setMessage('Hours updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save hours. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading hours...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 text-black">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Business Hours</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white border rounded-lg p-6">
        <div className="space-y-4">
          {daysOfWeek.map(day => (
            <div key={day.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="w-24 font-medium capitalize">
                {day.label}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hours[day.id]?.closed || false}
                  onChange={(e) => handleDayChange(day.id, 'closed', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-600">Closed</label>
              </div>

              {!hours[day.id]?.closed && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Open:</label>
                    <input
                      type="time"
                      value={hours[day.id]?.open || ''}
                      onChange={(e) => handleDayChange(day.id, 'open', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Close:</label>
                    <input
                      type="time"
                      value={hours[day.id]?.close || ''}
                      onChange={(e) => handleDayChange(day.id, 'close', e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-300 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

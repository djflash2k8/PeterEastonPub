'use client'

import { useState, useEffect } from 'react'

interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface HoursData {
  [key: string]: DayHours
}

const dayNames: { [key: string]: string } = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}

export default function Hours() {
  const [hours, setHours] = useState<HoursData>({})

  useEffect(() => {
    fetch('/api/hours')
      .then(res => res.json())
      .then(setHours)
      .catch(err => console.error('Failed to load hours:', err))
  }, [])

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  const formatDayHours = (dayHours: DayHours) => {
    if (dayHours.closed) return 'Closed'
    return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`
  }

  return (
    <div className="mt-4 text-black">
      <h3 className="text-lg font-semibold mb-3 sm:mb-4">Hours of Operation</h3>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-1">
          {Object.entries(dayNames).map(([key, name]) => (
            <div 
              key={key} 
              className="flex justify-between items-center py-1 sm:py-0 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm sm:text-base font-medium text-gray-900">{name}:</span>
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                {hours[key] ? formatDayHours(hours[key]) : 'Loading...'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
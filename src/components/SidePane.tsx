'use client'

import { useEvents } from '../app/events/EventsContext'
import Hours from './Hours'

export default function SidePane() {
  const { events, loading } = useEvents()
  const today = new Date().toISOString().split('T')[0]

  try {

    const nextEvent = events
    .filter(e => e.date >= today)
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.startTime || '00:00'}`)
      const bDate = new Date(`${b.date}T${b.startTime || '00:00'}`)
      return aDate.getTime() - bDate.getTime()
    })[0] || null

  const format12Hour = (time?: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  return (
      <aside className="w-full lg:w-1/3 xl:w-1/4 p-4 sm:p-6 bg-gray-50 min-h-screen lg:min-h-0 flex flex-col gap-6">
        {/* NEXT EVENT */}
        <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg sm:text-xl font-black uppercase mb-3 sm:mb-4">
            Next Event
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm animate-pulse italic text-gray-400">Loading events...</p>
            </div>
          ) : nextEvent ? (
            <div className="flex flex-col gap-3 sm:gap-4">
              {nextEvent.imageUrl && (
                <div className="relative overflow-hidden rounded-lg border-2 border-black">
                  <img
                    src={nextEvent.imageUrl}
                    alt={nextEvent.title}
                    className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold leading-tight text-gray-900">
                  {nextEvent.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold bg-black text-white px-2 py-1 rounded">
                    {nextEvent.date}
                  </span>
                  {nextEvent.startTime && (
                    <span className="text-xs sm:text-sm font-bold bg-red-600 text-white px-2 py-1 rounded">
                      {format12Hour(nextEvent.startTime)}
                      {nextEvent.endTime
                        ? ` - ${format12Hour(nextEvent.endTime)}`
                        : ''}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                  {nextEvent.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm italic text-gray-400">
                No upcoming events
              </p>
            </div>
          )}
        </div>

        {/* HOURS */}
        <div className="flex-1">
          <Hours />
        </div>
      </aside>
    )
  } catch (error) {
    console.error('SidePane error:', error)
    return (
      <aside className="w-full lg:w-1/3 xl:w-1/4 p-4 sm:p-6 bg-gray-50 min-h-screen lg:min-h-0 flex flex-col gap-6">
        <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg sm:text-xl font-black uppercase mb-3 sm:mb-4">
            Next Event
          </h2>
          <div className="text-center py-6">
            <p className="text-sm italic text-gray-400">
              Unable to load events
            </p>
          </div>
        </div>
        <div className="flex-1">
          <Hours />
        </div>
      </aside>
    )
  }
}

'use client'

import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  description: string
  imageUrl?: string
}

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300)
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen && !isAnimating) return null

  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return ''
    try {
      const [hours, minutes] = timeStr.split(':')
      const h = parseInt(hours, 10)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      return `${h12}:${minutes} ${ampm}`
    } catch (e) {
      return timeStr
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl bg-[#1A1C1E] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        style={{ border: '1px solid rgba(243, 179, 64, 0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-[#F3B340] hover:text-black transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          {event?.imageUrl && (
            <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Section */}
          <div className={`flex-1 p-8 ${!event?.imageUrl ? 'w-full' : ''}`}>
            <div className="mb-6">
              <h2
                className="text-3xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
              >
                {event?.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(243,179,64,0.12)', color: '#F3B340', border: '1px solid rgba(243,179,64,0.25)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event?.date}
                </span>
                {event?.startTime && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ background: 'rgba(140,140,140,0.12)', color: '#E0E0E0' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime12h(event.startTime)}
                    {event.endTime ? ` – ${formatTime12h(event.endTime)}` : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-[#E0E0E0]">
                {event?.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-bold transition-all duration-300"
                style={{ backgroundColor: '#F3B340', color: '#000' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

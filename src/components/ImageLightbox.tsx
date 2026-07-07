'use client'

import { useEffect } from 'react'

interface GalleryImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
  caption?: string
  order: number
}

interface ImageLightboxProps {
  image: GalleryImage | null
  isOpen: boolean
  onClose: () => void
}

export default function ImageLightbox({ image, isOpen, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !image) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col"
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

        {/* Image */}
        <img
          src={image.url}
          alt={image.altText}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />

        {/* Caption */}
        {image.caption && (
          <div className="mt-4 text-center">
            <p style={{ color: '#E0E0E0' }} className="text-lg">
              {image.caption}
            </p>
          </div>
        )}

        {/* Alt Text */}
        <div className="mt-2 text-center">
          <p style={{ color: '#8C8C8C' }} className="text-sm">
            {image.altText}
          </p>
        </div>
      </div>
    </div>
  )
}

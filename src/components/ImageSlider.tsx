'use client'

import { useState, useEffect } from 'react'

interface GalleryImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
  caption?: string
  order: number
}

interface ImageSliderProps {
  images: GalleryImage[]
  autoScroll?: boolean
  onImageClick?: (image: GalleryImage) => void
}

export default function ImageSlider({ images, autoScroll = true, onImageClick }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll)

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || images.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoScrolling, images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsAutoScrolling(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsAutoScrolling(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoScrolling(false)
  }

  const resumeAutoScroll = () => {
    setIsAutoScrolling(autoScroll)
  }

  if (images.length === 0) {
    return (
      <div
        className="w-full h-96 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: '#242628', border: '1px solid rgba(243,179,64,0.2)' }}
      >
        <p style={{ color: '#8C8C8C' }}>No images in this gallery</p>
      </div>
    )
  }

  const currentImage = images[currentIndex]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: '66.67%' }}>
          <img
            src={currentImage.url}
            alt={currentImage.altText}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={() => onImageClick?.(currentImage)}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-[#F3B340] hover:text-black transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-[#F3B340] hover:text-black transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-semibold">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Auto-scroll Indicator */}
          {isAutoScrolling && (
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#F3B340]/80 text-black text-sm font-semibold">
              Auto-scrolling
            </div>
          )}
        </div>

        {/* Caption */}
        {currentImage.caption && (
          <p className="mt-3 text-center text-sm" style={{ color: '#E0E0E0' }}>
            {currentImage.caption}
          </p>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="space-y-2">
          <p style={{ color: '#8C8C8C' }} className="text-sm font-semibold">
            Select a photo:
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                onMouseEnter={resumeAutoScroll}
                className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex ? 'ring-2 ring-[#F3B340]' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image.thumbnailUrl}
                  alt={image.altText}
                  className="w-full h-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto-scroll Toggle */}
      {autoScroll && images.length > 1 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
            style={{
              backgroundColor: isAutoScrolling ? '#F3B340' : '#242628',
              color: isAutoScrolling ? '#000' : '#E0E0E0',
              border: isAutoScrolling ? 'none' : '1px solid rgba(243,179,64,0.2)',
            }}
          >
            {isAutoScrolling ? '⏸ Pause Auto-scroll' : '▶ Resume Auto-scroll'}
          </button>
        </div>
      )}
    </div>
  )
}

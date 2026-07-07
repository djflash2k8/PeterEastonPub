'use client'

import { useState, useEffect } from 'react'
import ImageSlider from '@/components/ImageSlider'
import ImageLightbox from '@/components/ImageLightbox'

interface GalleryImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
  caption?: string
  order: number
}

interface Gallery {
  id: string
  title: string
  description: string
  slug: string
  published: boolean
  autoScroll: boolean
  images: GalleryImage[]
}

export default function PhotoGalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/galleries')
      if (response.ok) {
        const data = await response.json()
        setGalleries(data)
      }
    } catch (error) {
      console.error('Error loading galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    setIsLightboxOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div
              className="inline-block w-10 h-10 border-4 rounded-full animate-spin mb-4"
              style={{ borderColor: '#F3B340', borderTopColor: 'transparent' }}
            />
            <p style={{ color: '#8C8C8C' }}>Loading galleries...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        {/* Page Header */}
        <div className="mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
          >
            Photo Gallery
          </h1>
          <div className="w-16 h-1 rounded-full" style={{ background: '#F3B340' }} />
          <p className="mt-4 text-lg" style={{ color: '#E0E0E0' }}>
            Explore moments from Peter Easton's Pub
          </p>
        </div>

        {/* Galleries */}
        {galleries.length > 0 ? (
          <div className="space-y-16">
            {galleries.map((gallery) => (
              <section key={gallery.id}>
                {/* Gallery Header */}
                <div className="mb-8">
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
                  >
                    {gallery.title}
                  </h2>
                  <p style={{ color: '#E0E0E0' }} className="text-lg">
                    {gallery.description}
                  </p>
                </div>

                {/* Gallery Slider */}
                <div className="pub-card p-6">
                  <ImageSlider
                    images={gallery.images || []}
                    autoScroll={gallery.autoScroll}
                    onImageClick={handleImageClick}
                  />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: '#242628', border: '1px solid rgba(243,179,64,0.12)' }}
          >
            <div className="text-5xl mb-4">📷</div>
            <p
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
            >
              No Galleries Yet
            </p>
            <p style={{ color: '#8C8C8C' }}>
              Check back soon for photos from our events and gatherings!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 text-center" style={{ borderTop: '1px solid rgba(243,179,64,0.12)' }}>
          <p className="text-sm" style={{ color: '#8C8C8C' }}>
            &copy; {new Date().getFullYear()} Peter Easton&apos;s Pub &mdash; 29 Cookstown Rd, St. John&apos;s, NL
          </p>
        </footer>
      </main>

      {/* Lightbox */}
      <ImageLightbox
        image={selectedImage}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  createdAt?: any
  updatedAt?: any
}

export default function AdminPhotoGalleryPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    published: false,
    autoScroll: true,
  })
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load galleries on mount
  useEffect(() => {
    loadGalleries()
  }, [])

  const loadGalleries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/galleries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGalleries(data)
      }
    } catch (error) {
      console.error('Error loading galleries:', error)
      setMessage({ type: 'error', text: 'Failed to load galleries' })
    } finally {
      setLoading(false)
    }
  }

  const handleNewGallery = () => {
    setSelectedGallery(null)
    setFormData({ title: '', description: '', published: false, autoScroll: true })
    setUploadedImages([])
    setIsFormOpen(true)
  }

  const handleEditGallery = (gallery: Gallery) => {
    setSelectedGallery(gallery)
    setFormData({
      title: gallery.title,
      description: gallery.description,
      published: gallery.published,
      autoScroll: gallery.autoScroll,
    })
    setUploadedImages(gallery.images || [])
    setIsFormOpen(true)
  }

  const handleSaveGallery = async () => {
    try {
      if (!formData.title || !formData.description) {
        setMessage({ type: 'error', text: 'Title and description are required' })
        return
      }

      const token = localStorage.getItem('authToken')
      const galleryData = {
        ...formData,
        images: uploadedImages,
      }

      let response
      if (selectedGallery) {
        // Update existing gallery
        response = await fetch(`/api/galleries/${selectedGallery.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(galleryData),
        })
      } else {
        // Create new gallery
        response = await fetch('/api/galleries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(galleryData),
        })
      }

      if (response.ok) {
        setMessage({
          type: 'success',
          text: selectedGallery ? 'Gallery updated successfully!' : 'Gallery created successfully!',
        })
        setIsFormOpen(false)
        loadGalleries()
      } else {
        setMessage({ type: 'error', text: 'Failed to save gallery' })
      }
    } catch (error) {
      console.error('Error saving gallery:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    }
  }

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Gallery deleted successfully!' })
        loadGalleries()
      } else {
        setMessage({ type: 'error', text: 'Failed to delete gallery' })
      }
    } catch (error) {
      console.error('Error deleting gallery:', error)
      setMessage({ type: 'error', text: 'An error occurred while deleting' })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      // Create a simple image object (in production, upload to Cloudinary)
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData: GalleryImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: event.target?.result as string,
          thumbnailUrl: event.target?.result as string,
          altText: file.name,
          order: uploadedImages.length,
        }
        setUploadedImages([...uploadedImages, imageData])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== imageId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1A1C1E' }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        <div className="mb-10">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F3B340' }}
          >
            Photo Gallery Management
          </h1>
          <p style={{ color: '#E0E0E0' }}>Create and manage photo galleries for your pub</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              borderLeft: `4px solid ${message.type === 'success' ? '#4CAF50' : '#F44336'}`,
              color: message.type === 'success' ? '#4CAF50' : '#F44336',
            }}
          >
            {message.text}
          </div>
        )}

        {/* New Gallery Button */}
        <button
          onClick={handleNewGallery}
          className="mb-8 px-6 py-3 rounded-lg font-bold transition-all duration-300"
          style={{ backgroundColor: '#F3B340', color: '#000' }}
        >
          + Create New Gallery
        </button>

        {/* Gallery List */}
        <div className="space-y-4">
          {galleries.length > 0 ? (
            galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="p-6 rounded-lg"
                style={{ backgroundColor: '#242628', border: '1px solid rgba(243,179,64,0.2)' }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ color: '#F3B340' }}
                    >
                      {gallery.title}
                    </h3>
                    <p style={{ color: '#E0E0E0' }} className="mb-2">
                      {gallery.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: gallery.published ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          color: gallery.published ? '#4CAF50' : '#F44336',
                        }}
                      >
                        {gallery.published ? 'Published' : 'Draft'}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: 'rgba(243,179,64,0.1)',
                          color: '#F3B340',
                        }}
                      >
                        {gallery.images?.length || 0} images
                      </span>
                      {gallery.autoScroll && (
                        <span
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            color: '#2196F3',
                          }}
                        >
                          Auto-scroll enabled
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGallery(gallery)}
                      className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                      style={{ backgroundColor: '#F3B340', color: '#000' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(gallery.id)}
                      className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                      style={{ backgroundColor: '#F44336', color: '#fff' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="text-center py-12 rounded-lg"
              style={{ backgroundColor: '#242628', border: '1px solid rgba(243,179,64,0.2)' }}
            >
              <p style={{ color: '#8C8C8C' }}>No galleries yet. Create one to get started!</p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setIsFormOpen(false)}
          >
            <div
              className="w-full max-w-2xl bg-[#1A1C1E] rounded-2xl p-8 overflow-y-auto max-h-[90vh]"
              style={{ border: '1px solid rgba(243, 179, 64, 0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: '#F3B340' }}
              >
                {selectedGallery ? 'Edit Gallery' : 'Create New Gallery'}
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label style={{ color: '#E0E0E0' }} className="block mb-2 font-semibold">
                  Gallery Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[#242628] text-white border border-gray-600 focus:outline-none focus:border-[#F3B340]"
                  placeholder="e.g., Summer Nights 2026"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label style={{ color: '#E0E0E0' }} className="block mb-2 font-semibold">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[#242628] text-white border border-gray-600 focus:outline-none focus:border-[#F3B340]"
                  placeholder="Describe this gallery..."
                  rows={3}
                />
              </div>

              {/* Settings */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span style={{ color: '#E0E0E0' }}>Publish this gallery</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.autoScroll}
                    onChange={(e) => setFormData({ ...formData, autoScroll: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span style={{ color: '#E0E0E0' }}>Enable auto-scroll</span>
                </label>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label style={{ color: '#E0E0E0' }} className="block mb-2 font-semibold">
                  Gallery Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 rounded-lg bg-[#242628] text-white border border-gray-600"
                />
                <p style={{ color: '#8C8C8C' }} className="text-sm mt-2">
                  Upload one or more images
                </p>
              </div>

              {/* Image Preview */}
              {uploadedImages.length > 0 && (
                <div className="mb-6">
                  <p style={{ color: '#E0E0E0' }} className="font-semibold mb-3">
                    Uploaded Images ({uploadedImages.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.altText}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveGallery}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-300"
                  style={{ backgroundColor: '#F3B340', color: '#000' }}
                >
                  {selectedGallery ? 'Update Gallery' : 'Create Gallery'}
                </button>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-300"
                  style={{ backgroundColor: '#242628', color: '#E0E0E0', border: '1px solid rgba(243,179,64,0.2)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

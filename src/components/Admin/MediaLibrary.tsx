'use client'

import { useState, useEffect } from 'react'

interface MediaItem {
  id: string
  url: string
  name: string
  folder: string
  createdAt: any
}

interface MediaLibraryProps {
  onSelect: (url: string) => void
  onClose: () => void
}

export default function MediaLibrary({ onSelect, onClose }: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/media', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'library')

    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      if (res.ok) {
        fetchMedia()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
            <p className="text-xs text-gray-500">Select or upload images for your site</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
              {uploading ? 'Uploading...' : 'Upload New'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-transparent hover:border-blue-500 cursor-pointer transition-all"
                  onClick={() => onSelect(item.url)}
                >
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Select Image</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">No images in your library yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

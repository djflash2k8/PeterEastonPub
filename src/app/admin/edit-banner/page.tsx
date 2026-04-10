'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BannerData {
  url: string
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  resize?: {
    width: number
    height: number
  }
  position?: {
    x: number
    y: number
    scale: number
  }
  quality?: number
}

export default function EditBanner() {
  const [banner, setBanner] = useState<BannerData>({ url: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editSettings, setEditSettings] = useState({
    crop: { x: 0, y: 0, width: 100, height: 100 },
    resize: { width: 1920, height: 400 },
    position: { x: 0, y: 0, scale: 1 },
    quality: 85
  })

  useEffect(() => {
    fetchBanner()
  }, [])

  // Update local preview when a new file is selected
  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setLocalPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/banner')
      const data = await response.json()
      setBanner(data)
    } catch (error) {
      setMessage('Failed to load banner')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
    } else {
      setSelectedFile(null)
      setMessage('Please select a valid image file')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      if (!selectedFile) {
        setMessage('Please select an image file')
        setIsSaving(false)
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)

      // Add editing settings if edit mode is enabled
      if (editMode) {
        formData.append('resize', JSON.stringify(editSettings.resize))
        formData.append('position', JSON.stringify(editSettings.position))
        formData.append('quality', editSettings.quality.toString())
      }

      const response = await fetch('/api/banner', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to save banner')
      }

      const result = await response.json()
      setBanner(result.banner)
      setSelectedFile(null)
      setLocalPreview(null)
      setMessage('Banner updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save banner. Please try again.')
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
          <div className="text-gray-500">Loading banner...</div>
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
        <h1 className="text-2xl font-bold">Edit Banner</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Current Banner Preview */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Current Banner</h2>
          {banner.url && (
            <div className="mb-4">
              <img 
                src={banner.url} 
                alt="Current banner" 
                className="w-full max-w-2xl h-48 object-cover border rounded"
              />
              <p className="text-sm text-gray-500 mt-2">Current URL: {banner.url}</p>
            </div>
          )}
        </div>

        {/* Upload New Banner */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Upload New Banner</h2>
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                editMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {editMode ? 'Editing ON' : 'Editing OFF'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WebP. Recommended size: 1920x400px
              </p>
            </div>

            {/* Preview of selected file */}
            {(localPreview || banner.url) && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview {editMode && '(with editing applied)'}
                </label>
                <div className="border rounded overflow-hidden bg-gray-100">
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      width: '100%',
                      maxWidth: '768px',
                      height: '200px'
                    }}
                  >
                    <img 
                      src={localPreview || banner.url} 
                      alt="Preview" 
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        transform: editMode 
                          ? `translate(${editSettings.position.x}px, ${editSettings.position.y}px) scale(${editSettings.position.scale})`
                          : 'none',
                        transformOrigin: 'center'
                      }}
                    />
                  </div>
                </div>
                {localPreview && (
                  <p className="text-sm text-green-600 mt-2">
                    New image selected (will replace current banner)
                  </p>
                )}
                {editMode && (
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>• Size: {editSettings.resize.width} x {editSettings.resize.height}px</p>
                    <p>• Position: X:{editSettings.position.x}px, Y:{editSettings.position.y}px</p>
                    <p>• Scale: {editSettings.position.scale}x</p>
                    <p>• Quality: {editSettings.quality}%</p>
                  </div>
                )}
              </div>
            )}

            
            {/* Editing Controls */}
            {editMode && (
              <div className="border-t pt-4 space-y-4">
                <h3 className="text-md font-semibold text-gray-700">Image Editing Options</h3>
                
                {/* Resize Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={editSettings.resize.width}
                      onChange={(e) => setEditSettings(prev => ({
                        ...prev,
                        resize: { ...prev.resize, width: parseInt(e.target.value) || 1920 }
                      }))}
                      className="w-full border rounded px-2 py-1"
                      min="100"
                      max="4000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={editSettings.resize.height}
                      onChange={(e) => setEditSettings(prev => ({
                        ...prev,
                        resize: { ...prev.resize, height: parseInt(e.target.value) || 400 }
                      }))}
                      className="w-full border rounded px-2 py-1"
                      min="100"
                      max="2000"
                    />
                  </div>
                </div>

                {/* Position Controls */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">X Position</label>
                    <input
                      type="range"
                      value={editSettings.position.x}
                      onChange={(e) => setEditSettings(prev => ({
                        ...prev,
                        position: { ...prev.position, x: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                      min="-100"
                      max="100"
                    />
                    <span className="text-xs text-gray-500">{editSettings.position.x}px</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Y Position</label>
                    <input
                      type="range"
                      value={editSettings.position.y}
                      onChange={(e) => setEditSettings(prev => ({
                        ...prev,
                        position: { ...prev.position, y: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                      min="-100"
                      max="100"
                    />
                    <span className="text-xs text-gray-500">{editSettings.position.y}px</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Scale</label>
                    <input
                      type="range"
                      value={editSettings.position.scale}
                      onChange={(e) => setEditSettings(prev => ({
                        ...prev,
                        position: { ...prev.position, scale: parseFloat(e.target.value) }
                      }))}
                      className="w-full"
                      min="0.5"
                      max="2"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-500">{editSettings.position.scale}x</span>
                  </div>
                </div>

                {/* Quality Control */}
                <div>
                  <label className="block text-sm font-medium mb-1">Image Quality ({editSettings.quality}%)</label>
                  <input
                    type="range"
                    value={editSettings.quality}
                    onChange={(e) => setEditSettings(prev => ({
                      ...prev,
                      quality: parseInt(e.target.value)
                    }))}
                    className="w-full"
                    min="10"
                    max="100"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Lower quality (smaller file)</span>
                    <span>Higher quality (larger file)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-300 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>
    </div>
  )
}

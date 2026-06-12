'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PageLayout {
  showWelcome: boolean
  showAbout: boolean
  showOfferings: boolean
  showNextEvent: boolean
  showTags: boolean
  layoutStyle: string
  welcomePosition: string
  aboutPosition: string
  offeringsPosition: string
  eventPosition: string
  tagsPosition: string
  spacing: string
  maxContentWidth: string
  sidebarEnabled: boolean
  footerEnabled: boolean
  updatedAt?: string
}

export default function PageLayoutPage() {
  const [layout, setLayout] = useState<PageLayout>({
    showWelcome: true,
    showAbout: true,
    showOfferings: true,
    showNextEvent: true,
    showTags: true,
    layoutStyle: 'centered',
    welcomePosition: 'top',
    aboutPosition: 'middle',
    offeringsPosition: 'middle',
    eventPosition: 'bottom',
    tagsPosition: 'bottom',
    spacing: 'normal',
    maxContentWidth: '1200px',
    sidebarEnabled: false,
    footerEnabled: true
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetchLayout()
  }, [])

  const fetchLayout = async () => {
    try {
      const response = await fetch('/api/page-layout')
      const data = await response.json()
      setLayout(data)
    } catch (error) {
      console.error('Failed to fetch layout:', error)
      setMessage('Failed to load layout settings')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/page-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layout),
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage(result.message)
        setMessageType('success')
      } else {
        setMessage(result.error || 'Failed to save layout')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Failed to save layout:', error)
      setMessage('Failed to save layout settings')
      setMessageType('error')
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  const handleInputChange = (field: keyof PageLayout, value: any) => {
    setLayout(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading layout settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-yellow-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Main Page Layout Management</h1>
          <Link 
            href="/admin" 
            className="bg-yellow-600 text-gray-900 px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
          >
            Back to Admin Dashboard
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded ${
            messageType === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          
          {/* Section Visibility */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Section Visibility</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showWelcome}
                  onChange={(e) => handleInputChange('showWelcome', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span>Show Welcome Section</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showAbout}
                  onChange={(e) => handleInputChange('showAbout', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span>Show About Section</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showOfferings}
                  onChange={(e) => handleInputChange('showOfferings', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span>Show Offerings Section</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showNextEvent}
                  onChange={(e) => handleInputChange('showNextEvent', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span>Show Next Event</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.showTags}
                  onChange={(e) => handleInputChange('showTags', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span>Show Tags</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layout.footerEnabled}
                  onChange={(e) => handleInputChange('footerEnabled', e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                />
                <span>Show Footer</span>
              </label>
            </div>
          </div>

          {/* Layout Style */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Layout Style</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium mb-2">Overall Layout Style</label>
                <select
                  value={layout.layoutStyle}
                  onChange={(e) => handleInputChange('layoutStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="centered">Centered</option>
                  <option value="left-aligned">Left Aligned</option>
                  <option value="right-aligned">Right Aligned</option>
                  <option value="grid">Grid Layout</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content Width</label>
                <select
                  value={layout.maxContentWidth}
                  onChange={(e) => handleInputChange('maxContentWidth', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="800px">Narrow (800px)</option>
                  <option value="1000px">Medium (1000px)</option>
                  <option value="1200px">Wide (1200px)</option>
                  <option value="full">Full Width</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Spacing</label>
                <select
                  value={layout.spacing}
                  onChange={(e) => handleInputChange('spacing', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layout.sidebarEnabled}
                    onChange={(e) => handleInputChange('sidebarEnabled', e.target.checked)}
                    className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <span>Enable Sidebar</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section Positioning */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Section Positioning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium mb-2">Welcome Position</label>
                <select
                  value={layout.welcomePosition}
                  onChange={(e) => handleInputChange('welcomePosition', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">About Position</label>
                <select
                  value={layout.aboutPosition}
                  onChange={(e) => handleInputChange('aboutPosition', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Offerings Position</label>
                <select
                  value={layout.offeringsPosition}
                  onChange={(e) => handleInputChange('offeringsPosition', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Position</label>
                <select
                  value={layout.eventPosition}
                  onChange={(e) => handleInputChange('eventPosition', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags Position</label>
                <select
                  value={layout.tagsPosition}
                  onChange={(e) => handleInputChange('tagsPosition', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Future Options Placeholder */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Future Options</h2>
            <div className="text-gray-400">
              <p className="mb-2">Additional layout options will be added here in future updates:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Custom section ordering</li>
                <li>Advanced positioning controls</li>
                <li>Responsive layout settings</li>
                <li>Animation and transition effects</li>
                <li>Custom CSS injection</li>
                <li>Theme presets</li>
                <li>Layout templates</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Save Layout Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

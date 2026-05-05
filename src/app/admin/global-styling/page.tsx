'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GlobalStyling {
  backgroundColor: string
  primaryTextColor: string
  secondaryTextColor: string
  accentTextColor: string
  altTextColor: string
  fontFamily: string
  fontSize: string
  borderRadius: string
  padding: string
  updatedAt?: string
}

export default function GlobalStylingPage() {
  const [styling, setStyling] = useState<GlobalStyling>({
    backgroundColor: '#36454F',
    primaryTextColor: '#FFD700',
    secondaryTextColor: '#FFD700',
    accentTextColor: '#FFD700',
    altTextColor: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    borderRadius: '8px',
    padding: '16px'
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetchStyling()
  }, [])

  const fetchStyling = async () => {
    try {
      const response = await fetch('/api/global-styling')
      const data = await response.json()
      setStyling(data)
    } catch (error) {
      console.error('Failed to fetch styling:', error)
      setMessage('Failed to load styling settings')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/global-styling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(styling),
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage(result.message)
        setMessageType('success')
        // Apply styles immediately
        applyStylingChanges()
      } else {
        setMessage(result.error || 'Failed to save styling')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Failed to save styling:', error)
      setMessage('Failed to save styling settings')
      setMessageType('error')
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  const applyStylingChanges = () => {
    // Apply background color
    document.body.style.backgroundColor = styling.backgroundColor
    document.body.style.color = styling.primaryTextColor
    
    // Apply font settings
    document.body.style.fontFamily = styling.fontFamily
    document.body.style.fontSize = styling.fontSize
  }

  const handleInputChange = (field: keyof GlobalStyling, value: string) => {
    setStyling(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading styling settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-yellow-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Global Styling Management</h1>
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

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Color Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">Color Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={styling.backgroundColor}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styling.backgroundColor}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="#36454F"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Text Color</label>
                <input
                  type="color"
                  value={styling.primaryTextColor}
                  onChange={(e) => handleInputChange('primaryTextColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styling.primaryTextColor}
                  onChange={(e) => handleInputChange('primaryTextColor', e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="#FFD700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Secondary Text Color</label>
                <input
                  type="color"
                  value={styling.secondaryTextColor}
                  onChange={(e) => handleInputChange('secondaryTextColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styling.secondaryTextColor}
                  onChange={(e) => handleInputChange('secondaryTextColor', e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="#FFD700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accent Text Color</label>
                <input
                  type="color"
                  value={styling.accentTextColor}
                  onChange={(e) => handleInputChange('accentTextColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styling.accentTextColor}
                  onChange={(e) => handleInputChange('accentTextColor', e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="#FFD700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alt Text Color</label>
                <input
                  type="color"
                  value={styling.altTextColor}
                  onChange={(e) => handleInputChange('altTextColor', e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styling.altTextColor}
                  onChange={(e) => handleInputChange('altTextColor', e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* Typography & Spacing Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">Typography & Spacing</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={styling.fontFamily}
                  onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <select
                  value={styling.fontSize}
                  onChange={(e) => handleInputChange('fontSize', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="22px">22px</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Border Radius</label>
                <select
                  value={styling.borderRadius}
                  onChange={(e) => handleInputChange('borderRadius', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="0px">None</option>
                  <option value="4px">Small</option>
                  <option value="8px">Medium</option>
                  <option value="12px">Large</option>
                  <option value="16px">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Padding</label>
                <select
                  value={styling.padding}
                  onChange={(e) => handleInputChange('padding', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="8px">Compact</option>
                  <option value="16px">Normal</option>
                  <option value="24px">Spacious</option>
                  <option value="32px">Extra Spacious</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Save Global Styling
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

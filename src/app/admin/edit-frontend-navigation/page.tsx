'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavigationItem {
  id: string
  text: string
  href: string
  target: '_self' | '_blank'
}

interface FrontendNavigationSettings {
  brandName: string
  navigationItems: NavigationItem[]
}

export default function EditFrontendNavigation() {
  const [navigation, setNavigation] = useState<FrontendNavigationSettings>({
    brandName: "Peter Easton's Pub",
    navigationItems: [
      {
        id: 'home',
        text: 'Home',
        href: '/',
        target: '_self'
      },
      {
        id: 'events',
        text: 'Events',
        href: '/events',
        target: '_self'
      },
      {
        id: 'about',
        text: 'About Us',
        href: '/about-us',
        target: '_self'
      },
      {
        id: 'contact',
        text: 'Contact Us',
        href: '/contact-us',
        target: '_self'
      }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/frontend-navigation')
      const data = await res.json()
      setNavigation(data)
    } catch (error) {
      console.error('Failed to fetch frontend navigation settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/frontend-navigation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(navigation),
      })

      if (res.ok) {
        alert('Frontend navigation settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save frontend navigation settings:', error)
      alert('Failed to save frontend navigation settings')
    } finally {
      setSaving(false)
    }
  }

  const handleBrandNameChange = (value: string) => {
    setNavigation(prev => ({ ...prev, brandName: value }))
  }

  const handleNavigationItemChange = (id: string, field: keyof NavigationItem, value: string) => {
    setNavigation(prev => ({
      ...prev,
      navigationItems: prev.navigationItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const addNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      text: 'New Item',
      href: '/',
      target: '_self'
    }
    setNavigation(prev => ({
      ...prev,
      navigationItems: [...prev.navigationItems, newItem]
    }))
  }

  const removeNavigationItem = (id: string) => {
    setNavigation(prev => ({
      ...prev,
      navigationItems: prev.navigationItems.filter(item => item.id !== id)
    }))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-2/3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 italic uppercase border-b-4 border-black pb-2 text-black">
        Edit Frontend Navigation
      </h1>

      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Customize the website navigation bar that appears on all public pages.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-black">Brand Name</label>
            <input
              type="text"
              value={navigation.brandName}
              onChange={(e) => handleBrandNameChange(e.target.value)}
              className="w-full p-3 border-2 border-black rounded focus:outline-none focus:border-blue-500"
              placeholder="Peter Easton's Pub"
            />
            <p className="text-xs text-gray-500 mt-1">Brand name shown in the navigation bar</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-black">Navigation Items</label>
              <button
                onClick={addNavigationItem}
                className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm"
              >
                + Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {navigation.navigationItems.map((item, index) => (
                <div key={item.id} className="border-2 border-gray-300 p-4 rounded">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm">Item {index + 1}</h4>
                    <button
                      onClick={() => removeNavigationItem(item.id)}
                      className="px-3 py-1 bg-red-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-black">Link Text</label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleNavigationItemChange(item.id, 'text', e.target.value)}
                        className="w-full p-2 border-2 border-black rounded focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="Home"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold mb-1 text-black">URL/Path</label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => handleNavigationItemChange(item.id, 'href', e.target.value)}
                        className="w-full p-2 border-2 border-black rounded focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="/"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold mb-1 text-black">Target</label>
                      <select
                        value={item.target}
                        onChange={(e) => handleNavigationItemChange(item.id, 'target', e.target.value as '_self' | '_blank')}
                        className="w-full p-2 border-2 border-black rounded focus:outline-none focus:border-blue-500 text-sm"
                      >
                        <option value="_self">Same Window</option>
                        <option value="_blank">New Window</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-green-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            onClick={fetchNavigation}
            className="px-6 py-3 bg-gray-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded">
        <h3 className="font-bold text-blue-800 mb-2">Preview</h3>
        <div className="bg-gray-800 text-white p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold">{navigation.brandName}</span>
            </div>
            <div className="hidden md:flex space-x-4">
              {navigation.navigationItems.map(item => (
                <span 
                  key={item.id} 
                  className="hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

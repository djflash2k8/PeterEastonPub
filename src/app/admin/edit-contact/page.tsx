'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Address {
  street: string
  city: string
  province: string
  postal: string
  country: string
}

interface SocialMedia {
  facebook: string
  instagram: string
  snapchat: string
  x: string
}

interface ContactData {
  address: Address
  phone: string
  email: string
  socialMedia: SocialMedia
}

export default function EditContact() {
  const [contact, setContact] = useState<ContactData>({
    address: {
      street: '',
      city: '',
      province: '',
      postal: '',
      country: ''
    },
    phone: '',
    email: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      snapchat: '',
      x: ''
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchContact()
  }, [])

  const fetchContact = async () => {
    try {
      const response = await fetch('/api/contact')
      const data = await response.json()
      setContact(data)
    } catch (error) {
      setMessage('Failed to load contact information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressChange = (field: keyof Address, value: string) => {
    setContact(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
  }

  const handleSocialMediaChange = (platform: keyof SocialMedia, value: string) => {
    setContact(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
      })

      if (!response.ok) {
        throw new Error('Failed to save contact information')
      }

      setMessage('Contact information updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save contact information. Please try again.')
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
          <div className="text-gray-500">Loading contact information...</div>
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
        <h1 className="text-2xl font-bold">Edit Contact Information</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Address Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={contact.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={contact.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Province</label>
              <input
                type="text"
                value={contact.address.province}
                onChange={(e) => handleAddressChange('province', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <input
                type="text"
                value={contact.address.postal}
                onChange={(e) => handleAddressChange('postal', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                value={contact.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook URL</label>
              <input
                type="url"
                placeholder="https://facebook.com/pagename"
                value={contact.socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/username"
                value={contact.socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Snapchat URL</label>
              <input
                type="url"
                placeholder="https://snapchat.com/add/username"
                value={contact.socialMedia.snapchat}
                onChange={(e) => handleSocialMediaChange('snapchat', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">X (Twitter) URL</label>
              <input
                type="url"
                placeholder="https://x.com/username"
                value={contact.socialMedia.x}
                onChange={(e) => handleSocialMediaChange('x', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-green-300 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

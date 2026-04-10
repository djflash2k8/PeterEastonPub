'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditHomePage() {
  const [welcomeTitle, setWelcomeTitle] = useState('')
  const [welcomeDescription, setWelcomeDescription] = useState('')
  const [aboutTitle, setAboutTitle] = useState('')
  const [aboutContent, setAboutContent] = useState('')
  const [whatWeOfferTitle, setWhatWeOfferTitle] = useState('')
  const [offerings, setOfferings] = useState([
    { title: 'Live Entertainment', description: 'Regular live music performances and special events' },
    { title: 'Great Atmosphere', description: 'Friendly staff and welcoming environment' }
  ])
  const [tags, setTags] = useState([
    'Live Music',
    'Karaoke', 
    'Open Mic'
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Load current home page content
    const loadContent = async () => {
      try {
        const response = await fetch('/api/home-content')
        if (response.ok) {
          const data = await response.json()
          setWelcomeTitle(data.welcomeTitle || 'Welcome to Peter Easton\'s Pub!')
          setWelcomeDescription(data.welcomeDescription || 'Your local destination for great entertainment and good times!')
          setAboutTitle(data.aboutTitle || 'About Us')
          setAboutContent(data.aboutContent || 'Located in the heart of St. John\'s, Peter Easton\'s Pub has been serving the community with great food, drinks, and entertainment for years. Join us for a memorable experience!')
          setWhatWeOfferTitle(data.whatWeOfferTitle || 'What We Offer')
          setOfferings(data.offerings || offerings)
          setTags(data.tags || tags)
        }
      } catch (error) {
        console.error('Failed to load content:', error)
      }
    }

    loadContent()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/home-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          welcomeTitle,
          welcomeDescription,
          aboutTitle,
          aboutContent,
          whatWeOfferTitle,
          offerings,
          tags
        }),
      })

      if (response.ok) {
        setMessage('Home page updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to save. Please try again.')
      }
    } catch (error) {
      setMessage('Failed to save. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addOffering = () => {
    setOfferings([...offerings, { title: '', description: '' }])
  }

  const updateOffering = (index: number, field: 'title' | 'description', value: string) => {
    const updatedOfferings = [...offerings]
    updatedOfferings[index][field] = value
    setOfferings(updatedOfferings)
  }

  const removeOffering = (index: number) => {
    setOfferings(offerings.filter((_, i) => i !== index))
  }

  const addTag = () => {
    const newTag = prompt('Enter new tag:')
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Home Page</h1>
            <Link 
              href="/admin" 
              className="text-blue-600 hover:text-blue-400 text-sm font-medium"
            >
              Back to Admin Dashboard
            </Link>
          </div>

          {message && (
            <div className={`p-4 rounded-md mb-6 ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold mb-4">Welcome Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={welcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={welcomeDescription}
                    onChange={(e) => setWelcomeDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold mb-4">About Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About Content</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* What We Offer Section */}
            <div className="pb-8">
              <h2 className="text-xl font-semibold mb-4">What We Offer Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={whatWeOfferTitle}
                    onChange={(e) => setWhatWeOfferTitle(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Offerings</label>
                    <button
                      type="button"
                      onClick={addOffering}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      + Add Offering
                    </button>
                  </div>
                  {offerings.map((offering, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={offering.title}
                          onChange={(e) => updateOffering(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={offering.description}
                          onChange={(e) => updateOffering(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={() => removeOffering(index)}
                          className="px-3 py-1 border border-red-300 rounded-md text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface ProcessedInstagramPost {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL'
  media_url: string
  caption: string
  permalink: string
  timestamp: string
  title: string
  date: string
  description: string
  imageUrl: string
}

interface InstagramSyncProps {
  onPostsSelected: (posts: ProcessedInstagramPost[]) => void
  onClose: () => void
}

export default function InstagramSync({ onPostsSelected, onClose }: InstagramSyncProps) {
  const [hashtag, setHashtag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<ProcessedInstagramPost[]>([])
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set())

  // Load default hashtag from settings on mount
  useEffect(() => {
    const loadDefaultHashtag = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const settings = await res.json()
          setHashtag(settings.instagram?.defaultHashtag || 'petereastonpub')
        }
      } catch (err) {
        console.error('Failed to load default hashtag:', err)
        setHashtag('petereastonpub')
      }
    }
    loadDefaultHashtag()
  }, [])

  const handleFetchPosts = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPosts([])
    setSelectedPostIds(new Set())

    if (!hashtag.trim()) {
      setError('Please enter a hashtag')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/instagram-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ hashtag: hashtag.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch posts (${response.status})`)
      }

      const data = await response.json()
      setPosts(data.posts || [])

      if (data.posts.length === 0) {
        setError('No posts found for this hashtag')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Instagram posts')
      console.error('Instagram sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPostIds)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPostIds(newSelected)
  }

  const handleCreateEvents = () => {
    const selectedPosts = posts.filter((post) => selectedPostIds.has(post.id))
    onPostsSelected(selectedPosts)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-black">Import Events from Instagram</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Form */}
          <form onSubmit={handleFetchPosts} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter hashtag (e.g., #petereastonpub)"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold px-6 py-2 rounded transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Posts Grid */}
          {posts.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-black">
                  Found {posts.length} post{posts.length !== 1 ? 's' : ''}
                </h3>
                <label className="flex items-center gap-2 text-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPostIds.size === posts.length && posts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPostIds(new Set(posts.map((p) => p.id)))
                      } else {
                        setSelectedPostIds(new Set())
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Select All</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => togglePostSelection(post.id)}
                  >
                    <div className="relative">
                      {/* Checkbox Overlay */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedPostIds.has(post.id)}
                          onChange={() => togglePostSelection(post.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>

                      {/* Image */}
                      {post.media_type === 'VIDEO' ? (
                        <video
                          src={post.media_url}
                          className="w-full h-48 object-cover bg-gray-100"
                          muted
                        />
                      ) : (
                        <img
                          src={post.media_url}
                          alt={post.caption}
                          className="w-full h-48 object-cover bg-gray-100"
                        />
                      )}
                    </div>

                    {/* Post Details */}
                    <div className="p-3 bg-gray-50">
                      <h4 className="font-bold text-black text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {post.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{post.date}</span>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-500 hover:underline"
                        >
                          View on Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvents}
                  disabled={selectedPostIds.size === 0}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded font-bold transition-colors"
                >
                  Create {selectedPostIds.size > 0 ? `${selectedPostIds.size} Event${selectedPostIds.size !== 1 ? 's' : ''}` : 'Events'}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Enter a hashtag and click "Search" to find Instagram posts
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-gray-600 mt-4">Fetching Instagram posts...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

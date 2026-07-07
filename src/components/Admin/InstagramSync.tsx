'use client'

<<<<<<< HEAD
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
=======
import { useEffect, useMemo, useState } from 'react'

interface Event {
  id: string
  date: string
  startTime?: string
  endTime?: string
  title: string
  description: string
  imageUrl?: string
  sourceId?: string
  sourceUrl?: string
  sourceLabel?: string
}

interface InstagramSettings {
  enabled: boolean
  sourceAccountUrl: string
  defaultHashtag: string
  autoCreateMode: 'off' | 'review' | 'auto'
  reviewBeforePublish: boolean
  showSourceAttribution: boolean
  defaultStartTime: string
  defaultEndTime: string
  duplicateWindowDays: number
  instagramAccessToken: string
  instagramBusinessAccountId: string
  notes?: string
}

interface InstagramDraft {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  imageUrl: string
  sourceId: string
  sourceUrl: string
  sourceLabel: string
}

interface InstagramSyncProps {
  isOpen: boolean
  onClose: () => void
  onImported: () => void
  existingEvents: Event[]
}

function getInstagramDuplicateKey(event: Pick<InstagramDraft, 'sourceId' | 'sourceUrl'>) {
  return `${event.sourceId || ''}::${event.sourceUrl || ''}`
}

export default function InstagramSync({ isOpen, onClose, onImported, existingEvents }: InstagramSyncProps) {
  const [settings, setSettings] = useState<InstagramSettings | null>(null)
  const [hashtag, setHashtag] = useState('')
  const [drafts, setDrafts] = useState<InstagramDraft[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [lastSyncMode, setLastSyncMode] = useState<'off' | 'review' | 'auto'>('off')

  const existingKeys = useMemo(() => {
    return new Set(existingEvents.map((event) => getInstagramDuplicateKey(event)))
  }, [existingEvents])

  const filteredDrafts = useMemo(() => {
    return drafts.map((draft) => ({
      ...draft,
      isDuplicate: existingKeys.has(getInstagramDuplicateKey(draft)) || existingEvents.some((event) => event.sourceId && event.sourceId === draft.sourceId)
    }))
  }, [drafts, existingEvents, existingKeys])

  const selectedDrafts = filteredDrafts.filter((draft) => selected[draft.sourceId])
  const importableDrafts = filteredDrafts.filter((draft) => !draft.isDuplicate)
  const selectedCount = selectedDrafts.length
  const importableCount = importableDrafts.length

  useEffect(() => {
    if (!isOpen) return

    const loadSettings = async () => {
      setIsLoadingSettings(true)
      setError('')

      try {
        const response = await fetch('/api/instagram-settings')
        const data = await response.json()
        const nextSettings = data as InstagramSettings
        setSettings(nextSettings)
        setHashtag(nextSettings.defaultHashtag || 'petereastonpub')
      } catch {
        setError('Failed to load Instagram settings.')
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSettings()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setDrafts([])
      setSelected({})
      setStatus('')
      setError('')
      setIsSearching(false)
      setIsImporting(false)
      setLastSyncMode('off')
    }
  }, [isOpen])

  const runSearch = async () => {
    setIsSearching(true)
    setError('')
    setStatus('')

    try {
      const response = await fetch('/api/instagram-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hashtag })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch Instagram posts.')
      }

      const nextDrafts = Array.isArray(data.drafts) ? data.drafts : []
      const syncMode = (data.mode as 'off' | 'review' | 'auto') || 'off'
      setLastSyncMode(syncMode)
      setDrafts(nextDrafts)
      setSelected(
        nextDrafts.reduce<Record<string, boolean>>((acc, draft) => {
          acc[draft.sourceId] = !existingKeys.has(getInstagramDuplicateKey(draft))
          return acc
        }, {})
      )
      if (syncMode === 'auto') {
        const importedCount = Number(data?.imported?.createdCount || 0)
        const skippedCount = Number(data?.imported?.skippedCount || 0)
        setStatus(`Auto-created ${importedCount} event${importedCount === 1 ? '' : 's'} and skipped ${skippedCount} duplicate${skippedCount === 1 ? '' : 's'}.`)
      } else {
        setStatus(`Found ${nextDrafts.length} Instagram post${nextDrafts.length === 1 ? '' : 's'}.`)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch Instagram posts.')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleAll = (checked: boolean) => {
    setSelected(
      filteredDrafts.reduce<Record<string, boolean>>((acc, draft) => {
        acc[draft.sourceId] = checked && !draft.isDuplicate
        return acc
      }, {})
    )
  }

  const importSelected = async () => {
    if (settings?.autoCreateMode === 'auto') {
      setError('Auto-create mode is enabled. Use Sync to import posts automatically.')
      return
    }

    const draftsToImport = selectedDrafts.filter((draft) => !draft.isDuplicate)

    if (draftsToImport.length === 0) {
      setError('Select at least one non-duplicate Instagram post to import.')
      return
    }

    setIsImporting(true)
    setError('')
    setStatus('')

    const results: Array<{ title: string; ok: boolean }> = []

    try {
      for (const draft of draftsToImport) {
        const formData = new FormData()
        formData.append('date', draft.date)
        formData.append('startTime', draft.startTime)
        formData.append('endTime', draft.endTime)
        formData.append('title', draft.title)
        formData.append('description', draft.description)
        formData.append('imageUrl', draft.imageUrl)
        formData.append('isRecurring', 'false')
        formData.append('sourceId', draft.sourceId)
        formData.append('sourceUrl', draft.sourceUrl)
        formData.append('sourceLabel', draft.sourceLabel || 'Instagram')

        const response = await fetch('/api/events', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const failure = await response.json().catch(() => ({}))
          throw new Error(failure?.error || `Failed to import ${draft.title}`)
        }

        results.push({ title: draft.title, ok: true })
      }

      setStatus(`Imported ${results.length} Instagram event${results.length === 1 ? '' : 's'} successfully.`)
      onImported()
      await runSearch()
    } catch (err: any) {
      setError(err?.message || 'Failed to import selected Instagram posts.')
    } finally {
      setIsImporting(false)
    }
  }

  if (!isOpen) return null

  const selectAllChecked = filteredDrafts.length > 0 && filteredDrafts.every((draft) => selected[draft.sourceId] || draft.isDuplicate)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between gap-4 border-b-4 border-black bg-pink-50 px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-700">Instagram Import</p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">Fetch posts and create events</h2>
            <p className="mt-1 text-sm text-gray-700">
              Search by hashtag, preview the posts, skip duplicates, and import the selected ones into the existing events workflow.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
            Close
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[380px_1fr]">
          <div className="border-b-4 border-black bg-gray-50 p-6 md:border-b-0 md:border-r-4">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-700">Hashtag</label>
                <div className="flex gap-2">
                  <input
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                    className="w-full rounded border-2 border-black px-3 py-2 text-sm"
                    placeholder="#petereastonpub"
                  />
                  <button
                    onClick={runSearch}
                    disabled={isSearching || isLoadingSettings}
                    className="rounded border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Sync'}
                  </button>
                </div>
              </div>

              <div className="rounded border-2 border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
                <p className="font-black uppercase tracking-widest text-gray-900">Connected Settings</p>
                {isLoadingSettings && <p className="mt-2 text-gray-500">Loading Instagram settings...</p>}
                {settings && (
                  <div className="mt-3 space-y-2 text-sm">
                    <p><span className="font-bold">Status:</span> {settings.enabled ? 'Enabled' : 'Disabled'}</p>
                    <p><span className="font-bold">Default hashtag:</span> #{settings.defaultHashtag || 'not set'}</p>
                    <p><span className="font-bold">Mode:</span> {settings.autoCreateMode}</p>
                    <p><span className="font-bold">Review before publish:</span> {settings.reviewBeforePublish ? 'Yes' : 'No'}</p>
                    <p><span className="font-bold">Show source on public page:</span> {settings.showSourceAttribution ? 'Yes' : 'No'}</p>
                    <p><span className="font-bold">Default time:</span> {settings.defaultStartTime} - {settings.defaultEndTime}</p>
                  </div>
                )}
              </div>

              <div className="rounded border-2 border-gray-200 bg-white p-4 text-sm text-gray-700">
                <p className="font-black uppercase tracking-widest text-gray-900">Import Rules</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  <li>Duplicate Instagram posts are skipped automatically.</li>
                  <li>Each imported card keeps the original post link for traceability.</li>
                  <li>Selected drafts are created through the same event API as manual entries.</li>
                </ul>
              </div>

              {(status || error) && (
                <div className={`rounded border-2 px-4 py-3 text-sm ${error ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-700'}`}>
                  {error || status}
                </div>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b-4 border-black px-6 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Results</p>
                <h3 className="text-lg font-black uppercase text-black">
                  {filteredDrafts.length > 0 ? `${filteredDrafts.length} posts found` : 'No posts loaded yet'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {settings?.autoCreateMode !== 'auto' && (
                  <label className="flex items-center gap-2 rounded border-2 border-black px-3 py-2 text-xs font-black uppercase tracking-widest">
                    <input
                      type="checkbox"
                      checked={selectAllChecked}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                    Select All
                  </label>
                )}
                {settings?.autoCreateMode === 'auto' ? (
                  <span className="rounded border-2 border-black bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-green-700">
                    Auto-create enabled
                  </span>
                ) : (
                  <button
                    onClick={importSelected}
                    disabled={isImporting || selectedCount === 0}
                    className="rounded border-2 border-black bg-pink-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {isImporting ? 'Importing...' : `Import ${selectedCount}`}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[62vh] flex-1 overflow-y-auto bg-white p-4 md:p-6">
              {filteredDrafts.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-gray-500">
                  <div>
                    <p className="text-lg font-black uppercase tracking-tight text-gray-700">Search for Instagram posts</p>
                    <p className="mt-2 text-sm">Use the hashtag from your settings or enter a new one to fetch posts.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredDrafts.map((draft) => {
                    const duplicate = Boolean(draft.isDuplicate)
                    const checked = settings?.autoCreateMode === 'auto' ? !duplicate : Boolean(selected[draft.sourceId])
                    return (
                      <label
                        key={draft.sourceId}
                        className={`group relative overflow-hidden rounded-2xl border-2 ${duplicate ? 'border-gray-300 bg-gray-50 opacity-70' : checked ? 'border-pink-500 bg-pink-50' : 'border-gray-300 bg-white'} ${settings?.autoCreateMode === 'auto' ? 'cursor-default' : 'cursor-pointer'} transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          disabled={duplicate || settings?.autoCreateMode === 'auto'}
                          onChange={(e) => setSelected((prev) => ({ ...prev, [draft.sourceId]: e.target.checked }))}
                        />
                        <div className="relative aspect-square bg-gray-200">
                          {draft.imageUrl ? (
                            <img src={draft.imageUrl} alt={draft.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">No image</div>
                          )}
                          <div className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                            Instagram
                          </div>
                          {duplicate && (
                            <div className="absolute right-3 top-3 rounded-full bg-gray-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                              Duplicate
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-base font-black leading-tight text-black">{draft.title}</h4>
                              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-500">{draft.date} · {draft.startTime} to {draft.endTime}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${checked ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {checked ? 'Selected' : 'Preview'}
                            </span>
                          </div>

                          <p className="line-clamp-4 text-sm leading-relaxed text-gray-700">{draft.description}</p>

                          <div className="flex flex-wrap items-center gap-2">
                            <a href={draft.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest text-pink-700 underline decoration-pink-300 underline-offset-4">
                              Open source
                            </a>
                            {duplicate && <span className="text-xs font-bold text-gray-500">Already imported</span>}
                            {settings?.autoCreateMode === 'auto' && !duplicate && <span className="text-xs font-bold text-green-700">Will auto-create on sync</span>}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
>>>>>>> e0a5819471b71fea4a8fe0f9cd73a7d62950d7ce
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> e0a5819471b71fea4a8fe0f9cd73a7d62950d7ce

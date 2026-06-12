'use client'

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
        </div>
      </div>
    </div>
  )
}
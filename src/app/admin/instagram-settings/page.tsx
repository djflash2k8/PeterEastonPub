'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type AutoCreateMode = 'off' | 'review' | 'auto'

interface InstagramSettings {
  enabled: boolean
  sourceAccountUrl: string
  defaultHashtag: string
  autoCreateMode: AutoCreateMode
  reviewBeforePublish: boolean
  showSourceAttribution: boolean
  defaultStartTime: string
  defaultEndTime: string
  duplicateWindowDays: number
  instagramAccessToken: string
  instagramBusinessAccountId: string
  notes?: string
}

const defaultSettings: InstagramSettings = {
  enabled: false,
  sourceAccountUrl: 'https://www.instagram.com/petereastonpub/',
  defaultHashtag: 'petereastonpub',
  autoCreateMode: 'review',
  reviewBeforePublish: true,
  showSourceAttribution: false,
  defaultStartTime: '20:00',
  defaultEndTime: '23:00',
  duplicateWindowDays: 30,
  instagramAccessToken: '',
  instagramBusinessAccountId: '',
  notes: 'Use this page to prepare the Instagram sync layer before credentials are available.'
}

export default function InstagramSettingsPage() {
  const [settings, setSettings] = useState<InstagramSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/instagram-settings')
      const data = await response.json()
      setSettings({ ...defaultSettings, ...data })
    } catch {
      setMessage('Failed to load Instagram settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/instagram-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to save Instagram settings')
      }

      setMessage('Instagram settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Failed to save Instagram settings. Please try again.')
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
          <div className="text-gray-500">Loading Instagram settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 text-black">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold">&larr; Back to Dashboard</Link>
        <Link href="/admin/edit-events" className="text-blue-500 hover:underline font-bold">Go to Events Editor</Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Instagram Sync Settings</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Instagram Account URL</span>
              <input
                type="url"
                value={settings.sourceAccountUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, sourceAccountUrl: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Default Hashtag</span>
              <input
                type="text"
                value={settings.defaultHashtag}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultHashtag: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Instagram Access Token</span>
              <input
                type="password"
                value={settings.instagramAccessToken}
                onChange={(e) => setSettings(prev => ({ ...prev, instagramAccessToken: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Business Account ID</span>
              <input
                type="text"
                value={settings.instagramBusinessAccountId}
                onChange={(e) => setSettings(prev => ({ ...prev, instagramBusinessAccountId: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Behavior</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Auto Create Mode</span>
              <select
                value={settings.autoCreateMode}
                onChange={(e) => {
                  const mode = e.target.value as AutoCreateMode
                  setSettings(prev => ({
                    ...prev,
                    autoCreateMode: mode,
                    reviewBeforePublish: mode !== 'auto'
                  }))
                }}
                className="w-full border rounded px-3 py-2"
              >
                <option value="off">Off</option>
                <option value="review">Review First</option>
                <option value="auto">Auto Publish</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Default Start Time</span>
              <input
                type="time"
                value={settings.defaultStartTime}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultStartTime: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Default End Time</span>
              <input
                type="time"
                value={settings.defaultEndTime}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultEndTime: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Duplicate Window (days)</span>
              <input
                type="number"
                min={1}
                max={365}
                value={settings.duplicateWindowDays}
                onChange={(e) => setSettings(prev => ({ ...prev, duplicateWindowDays: Number(e.target.value) || 30 }))}
                className="w-full border rounded px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 pt-7 md:pt-8">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              <span className="text-sm font-medium">Enable Instagram Sync</span>
            </label>
            <label className="flex items-center gap-2 pt-7 md:pt-8">
              <input
                type="checkbox"
                checked={settings.reviewBeforePublish}
                onChange={(e) => setSettings(prev => ({ ...prev, reviewBeforePublish: e.target.checked }))}
              />
              <span className="text-sm font-medium">Review Before Publish</span>
            </label>
            <label className="flex items-center gap-2 pt-7 md:pt-8 md:col-span-2">
              <input
                type="checkbox"
                checked={settings.showSourceAttribution}
                onChange={(e) => setSettings(prev => ({ ...prev, showSourceAttribution: e.target.checked }))}
              />
              <span className="text-sm font-medium">Show Source Attribution on Public Events</span>
            </label>
            <p className="text-sm text-gray-500 md:col-span-3 -mt-2">
              When enabled later, Instagram-imported events can show a small source badge or link on the public events page.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Notes</h2>
          <textarea
            value={settings.notes || ''}
            onChange={(e) => setSettings(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full border rounded px-3 py-2 min-h-32"
            placeholder="Add internal instructions or reminders for your Instagram workflow"
          />
          <p className="text-sm text-gray-500 mt-3">
            This page is the configuration layer for the Instagram importer. The event editor will use these values once the sync modal is wired in.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            When a scheduler hits the cron endpoint, the default hashtag is checked and non-duplicate posts are imported automatically.
          </p>
        </div>

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
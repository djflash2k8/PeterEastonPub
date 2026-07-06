'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Settings {
  admin: {
    username: string
    password?: string
  }
  instagram: {
    accessToken: string
    businessAccountId: string
    defaultHashtag: string
  }
  autoCreation: {
    enabled: boolean
    autoApprove: boolean
    defaultStartTime: string
    defaultEndTime: string
    markAsRecurring: boolean
    markAsArchived: boolean
  }
  sync: {
    lastSyncDate: string | null
    syncFrequency: 'manual' | 'daily' | 'weekly'
  }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data)
      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      const data = await res.json()
      setSettings(data.settings)
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-4">
        <p className="text-red-600">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin" className="text-blue-500 hover:underline font-bold mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-600">Manage Instagram integration and auto-creation preferences</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Admin Account Settings */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
            <span>👤</span> Admin Account Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={settings.admin.username}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    admin: { ...settings.admin, username: e.target.value },
                  })
                }
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Change Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={settings.admin.password || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    admin: { ...settings.admin, password: e.target.value },
                  })
                }
                placeholder="New Password"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Instagram API Settings */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
            <span>📷</span> Instagram API Configuration
          </h2>

          <div className="space-y-4">
            {/* Business Account ID */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Instagram Business Account ID
              </label>
              <input
                type="text"
                value={settings.instagram.businessAccountId}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    instagram: { ...settings.instagram, businessAccountId: e.target.value },
                  })
                }
                placeholder="e.g., 17841234567890"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Found in Meta App Dashboard → Instagram Account Settings
              </p>
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Instagram Access Token
              </label>
              <div className="flex gap-2">
                <input
                  type={showTokenInput ? 'text' : 'password'}
                  value={settings.instagram.accessToken}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, accessToken: e.target.value },
                    })
                  }
                  placeholder="Paste your long-lived access token here"
                  className="flex-1 border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-black transition-colors"
                >
                  {showTokenInput ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Generate from Meta App Dashboard → Tools → Graph API Explorer
              </p>
            </div>

            {/* Default Hashtag */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Default Hashtag to Search
              </label>
              <div className="flex gap-2">
                <span className="px-3 py-2 bg-gray-100 rounded text-black font-semibold">#</span>
                <input
                  type="text"
                  value={settings.instagram.defaultHashtag}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, defaultHashtag: e.target.value },
                    })
                  }
                  placeholder="e.g., petereastonpub"
                  className="flex-1 border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Used as default when syncing Instagram posts
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Creation Settings */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
            <span>⚙️</span> Auto-Creation Settings
          </h2>

          <div className="space-y-4">
            {/* Enable Auto-Creation */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
              <input
                type="checkbox"
                id="autoCreationEnabled"
                checked={settings.autoCreation.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoCreation: { ...settings.autoCreation, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="autoCreationEnabled" className="flex-1 cursor-pointer">
                <div className="font-bold text-black">Enable Auto-Creation</div>
                <div className="text-xs text-gray-600">
                  Automatically create events from Instagram posts (requires sync schedule)
                </div>
              </label>
            </div>

            {/* Auto-Approve */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
              <input
                type="checkbox"
                id="autoApprove"
                checked={settings.autoCreation.autoApprove}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoCreation: { ...settings.autoCreation, autoApprove: e.target.checked },
                  })
                }
                className="w-5 h-5 cursor-pointer"
                disabled={!settings.autoCreation.enabled}
              />
              <label htmlFor="autoApprove" className="flex-1 cursor-pointer">
                <div className="font-bold text-black">Auto-Approve Events</div>
                <div className="text-xs text-gray-600">
                  Automatically publish events without manual review
                </div>
              </label>
            </div>

            {/* Default Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Default Start Time
                </label>
                <input
                  type="time"
                  value={settings.autoCreation.defaultStartTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoCreation: { ...settings.autoCreation, defaultStartTime: e.target.value },
                    })
                  }
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Default End Time
                </label>
                <input
                  type="time"
                  value={settings.autoCreation.defaultEndTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoCreation: { ...settings.autoCreation, defaultEndTime: e.target.value },
                    })
                  }
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Recurring & Archive */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="checkbox"
                  id="markRecurring"
                  checked={settings.autoCreation.markAsRecurring}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoCreation: { ...settings.autoCreation, markAsRecurring: e.target.checked },
                    })
                  }
                  className="w-5 h-5 cursor-pointer"
                />
                <label htmlFor="markRecurring" className="flex-1 cursor-pointer">
                  <div className="font-bold text-black text-sm">Mark as Recurring</div>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="checkbox"
                  id="markArchived"
                  checked={settings.autoCreation.markAsArchived}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoCreation: { ...settings.autoCreation, markAsArchived: e.target.checked },
                    })
                  }
                  className="w-5 h-5 cursor-pointer"
                />
                <label htmlFor="markArchived" className="flex-1 cursor-pointer">
                  <div className="font-bold text-black text-sm">Mark as Archived</div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Schedule */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
            <span>🔄</span> Sync Schedule
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Sync Frequency
              </label>
              <select
                value={settings.sync.syncFrequency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sync: {
                      ...settings.sync,
                      syncFrequency: e.target.value as 'manual' | 'daily' | 'weekly',
                    },
                  })
                }
                className="w-full border-2 border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-blue-500"
              >
                <option value="manual">Manual (Click button to sync)</option>
                <option value="daily">Daily (Once per day)</option>
                <option value="weekly">Weekly (Once per week)</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                How often to automatically check for new Instagram posts
              </p>
            </div>

            {settings.sync.lastSyncDate && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Last Sync:</strong> {new Date(settings.sync.lastSyncDate).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
          <button
            onClick={() => fetchSettings()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded font-bold hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Reset
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded font-bold transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

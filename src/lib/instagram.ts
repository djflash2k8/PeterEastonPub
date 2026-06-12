import fs from 'fs'
import path from 'path'

export type InstagramAutoCreateMode = 'off' | 'review' | 'auto'

export interface InstagramSettings {
  enabled: boolean
  sourceAccountUrl: string
  defaultHashtag: string
  autoCreateMode: InstagramAutoCreateMode
  reviewBeforePublish: boolean
  showSourceAttribution: boolean
  defaultStartTime: string
  defaultEndTime: string
  duplicateWindowDays: number
  instagramAccessToken: string
  instagramBusinessAccountId: string
  notes?: string
}

export interface InstagramPost {
  id: string
  caption: string
  mediaUrl: string
  permalink: string
  timestamp: string
  title: string
}

export interface InstagramEventDraft {
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

export interface ImportedInstagramResult {
  createdCount: number
  skippedCount: number
  createdEvents: Array<InstagramEventDraft & { id: string }>
  skippedDrafts: InstagramEventDraft[]
}

export interface InstagramSyncResult {
  hashtag: string
  count: number
  mode: InstagramAutoCreateMode | 'off'
  imported: {
    createdCount: number
    skippedCount: number
  }
  drafts: InstagramEventDraft[]
}

const settingsFile = path.join(process.cwd(), 'src/lib/instagram-settings.json')
const eventsFile = path.join(process.cwd(), 'src/lib/events.json')

export const defaultInstagramSettings: InstagramSettings = {
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
  notes: 'Instagram sync scaffold. Credentials can be added later.'
}

function ensureSettingsFile() {
  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify(defaultInstagramSettings, null, 2))
  }
}

export function readInstagramSettings(): InstagramSettings {
  ensureSettingsFile()

  try {
    const data = fs.readFileSync(settingsFile, 'utf8')
    return { ...defaultInstagramSettings, ...JSON.parse(data) }
  } catch {
    return defaultInstagramSettings
  }
}

export function writeInstagramSettings(settings: InstagramSettings) {
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2))
}

export function buildInstagramTitle(caption: string) {
  const cleanedCaption = caption.trim()
  if (!cleanedCaption) {
    return 'Instagram Event'
  }

  const firstSentence = cleanedCaption.split(/[.!?]\s/)[0].trim()
  return firstSentence.length > 60 ? `${firstSentence.slice(0, 57)}...` : firstSentence
}

export function normalizeInstagramPost(post: InstagramPost, settings = readInstagramSettings()): InstagramEventDraft {
  const postDate = new Date(post.timestamp)
  const date = Number.isNaN(postDate.getTime()) ? new Date().toISOString().split('T')[0] : postDate.toISOString().split('T')[0]

  return {
    title: post.title || buildInstagramTitle(post.caption),
    description: post.caption || 'Imported from Instagram.',
    date,
    startTime: settings.defaultStartTime,
    endTime: settings.defaultEndTime,
    imageUrl: post.mediaUrl,
    sourceId: post.id,
    sourceUrl: post.permalink,
    sourceLabel: 'Instagram'
  }
}

export async function fetchInstagramPostsByHashtag(hashtag: string, settings = readInstagramSettings()) {
  const accessToken = settings.instagramAccessToken || process.env.INSTAGRAM_ACCESS_TOKEN || ''
  const businessAccountId = settings.instagramBusinessAccountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || ''

  if (!accessToken || !businessAccountId) {
    throw new Error('Instagram credentials are not configured yet.')
  }

  const normalizedTag = hashtag.replace(/^#/, '').trim()
  if (!normalizedTag) {
    throw new Error('A hashtag is required to fetch Instagram posts.')
  }

  const hashtagLookup = await fetch(`https://graph.facebook.com/v20.0/ig_hashtag_search?user_id=${encodeURIComponent(businessAccountId)}&q=${encodeURIComponent(normalizedTag)}&access_token=${encodeURIComponent(accessToken)}`)
  const hashtagData = await hashtagLookup.json()

  if (!hashtagLookup.ok) {
    throw new Error(hashtagData?.error?.message || 'Failed to resolve Instagram hashtag.')
  }

  const hashtagId = hashtagData?.data?.[0]?.id
  if (!hashtagId) {
    throw new Error('No Instagram hashtag ID was returned.')
  }

  const mediaResponse = await fetch(`https://graph.facebook.com/v20.0/${hashtagId}/recent_media?user_id=${encodeURIComponent(businessAccountId)}&fields=id,caption,media_url,permalink,timestamp&access_token=${encodeURIComponent(accessToken)}`)
  const mediaData = await mediaResponse.json()

  if (!mediaResponse.ok) {
    throw new Error(mediaData?.error?.message || 'Failed to fetch Instagram posts.')
  }

  return (mediaData?.data || []).map((item: any) => ({
    id: item.id,
    caption: item.caption || '',
    mediaUrl: item.media_url || '',
    permalink: item.permalink || '',
    timestamp: item.timestamp || new Date().toISOString(),
    title: buildInstagramTitle(item.caption || '')
  })) as InstagramPost[]
}

function ensureEventsFile() {
  if (!fs.existsSync(eventsFile)) {
    fs.writeFileSync(eventsFile, '[]')
  }
}

function readEvents() {
  ensureEventsFile()

  try {
    const data = fs.readFileSync(eventsFile, 'utf8')
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeEvents(events: any[]) {
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
}

function getEventSourceKey(event: { sourceId?: string; sourceUrl?: string; title?: string; date?: string; imageUrl?: string }) {
  if (event.sourceId || event.sourceUrl) {
    return `${event.sourceId || ''}::${event.sourceUrl || ''}`
  }

  return `${event.title || ''}::${event.date || ''}::${event.imageUrl || ''}`
}

export function importInstagramDraftsToEvents(drafts: InstagramEventDraft[], settings = readInstagramSettings()): ImportedInstagramResult {
  const existingEvents = readEvents()
  const existingKeys = new Set(existingEvents.map((event: any) => getEventSourceKey(event)))

  const createdEvents: Array<InstagramEventDraft & { id: string }> = []
  const skippedDrafts: InstagramEventDraft[] = []

  for (const draft of drafts) {
    const duplicateKey = getEventSourceKey(draft)

    if (existingKeys.has(duplicateKey)) {
      skippedDrafts.push(draft)
      continue
    }

    const newEvent = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
      title: draft.title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      description: draft.description,
      imageUrl: draft.imageUrl,
      isRecurring: false,
      sourceId: draft.sourceId,
      sourceUrl: draft.sourceUrl,
      sourceLabel: draft.sourceLabel || 'Instagram'
    }

    existingEvents.push(newEvent)
    existingKeys.add(duplicateKey)
    createdEvents.push(newEvent)
  }

  writeEvents(existingEvents)

  return {
    createdCount: createdEvents.length,
    skippedCount: skippedDrafts.length,
    createdEvents,
    skippedDrafts
  }
}

export async function syncInstagramByHashtag(hashtag: string, settings = readInstagramSettings(), forceImport = false): Promise<InstagramSyncResult> {
  const posts = await fetchInstagramPostsByHashtag(hashtag, settings)
  const drafts = posts.map((post) => normalizeInstagramPost(post, settings))

  let imported = {
    createdCount: 0,
    skippedCount: 0
  }

  const shouldImport = forceImport || (settings.enabled && settings.autoCreateMode === 'auto')

  if (shouldImport) {
    const result = importInstagramDraftsToEvents(drafts, settings)
    imported = {
      createdCount: result.createdCount,
      skippedCount: result.skippedCount
    }
  }

  return {
    hashtag,
    count: drafts.length,
    mode: settings.enabled ? settings.autoCreateMode : 'off',
    imported,
    drafts
  }
}
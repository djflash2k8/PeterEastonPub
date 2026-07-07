<<<<<<< HEAD
/**
 * Instagram Graph API Client
 * Handles authentication and API calls to fetch hashtag data and recent media
 */

interface InstagramPost {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL'
  media_url: string
  caption: string
  permalink: string
  timestamp: string
}

interface ProcessedInstagramPost extends InstagramPost {
  title: string
  date: string
  description: string
  imageUrl: string
}

/**
 * Get the hashtag ID for a given hashtag name
 */
export async function getHashtagId(hashtag: string, accessToken?: string, businessAccountId?: string): Promise<string | null> {
  // Use provided credentials, fall back to env vars, then to Firestore
  let token = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN
  let accountId = businessAccountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

  // If not found in env, try to get from Firestore settings
  if (!token || !accountId) {
    try {
      const { queryCollectionFromFirebase } = await import('@/lib/firebase')
      const settings = await queryCollectionFromFirebase('settings')
      if (settings.length > 0 && settings[0].instagram) {
        token = token || settings[0].instagram.accessToken
        accountId = accountId || settings[0].instagram.businessAccountId
      }
    } catch (error) {
      console.error('Failed to fetch credentials from Firestore:', error)
    }
  }

  if (!token || !accountId) {
    throw new Error('Instagram API credentials not configured in environment or settings')
  }

  const hashtagName = hashtag.replace(/^#/, '') // Remove # if present

  try {
    const url = new URL('https://graph.instagram.com/v19.0/ig_hashtag_search')
    url.searchParams.append('user_id', accountId)
    url.searchParams.append('q', hashtagName)
    url.searchParams.append('access_token', token)

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return null
    }

    return data.data[0].id
  } catch (error) {
    console.error('Error fetching hashtag ID:', error)
    throw error
  }
}

/**
 * Get recent media posts for a given hashtag ID
 */
export async function getRecentMediaByHashtag(hashtagId: string, accessToken?: string, businessAccountId?: string): Promise<InstagramPost[]> {
  // Use provided credentials, fall back to env vars, then to Firestore
  let token = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN
  let accountId = businessAccountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

  // If not found in env, try to get from Firestore settings
  if (!token || !accountId) {
    try {
      const { queryCollectionFromFirebase } = await import('@/lib/firebase')
      const settings = await queryCollectionFromFirebase('settings')
      if (settings.length > 0 && settings[0].instagram) {
        token = token || settings[0].instagram.accessToken
        accountId = accountId || settings[0].instagram.businessAccountId
      }
    } catch (error) {
      console.error('Failed to fetch credentials from Firestore:', error)
    }
  }

  if (!token || !accountId) {
    throw new Error('Instagram API credentials not configured in environment or settings')
  }

  try {
    const url = new URL(`https://graph.instagram.com/v19.0/${hashtagId}/recent_media`)
    url.searchParams.append('user_id', accountId)
    url.searchParams.append('fields', 'id,media_type,media_url,caption,permalink,timestamp')
    url.searchParams.append('access_token', token)

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Instagram API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    if (!data.data) {
      return []
    }

    return data.data
  } catch (error) {
    console.error('Error fetching recent media:', error)
    throw error
  }
}

/**
 * Extract title from Instagram caption (first 50 characters or first sentence)
 */
function extractTitle(caption: string): string {
  if (!caption) return 'Instagram Post'

  // Try to get the first sentence (up to a period, exclamation, or question mark)
  const sentenceMatch = caption.match(/^[^.!?]*[.!?]?/)
  let title = sentenceMatch ? sentenceMatch[0] : caption

  // Limit to 50 characters
  if (title.length > 50) {
    title = title.substring(0, 50).trim() + '...'
  }

  return title.trim() || 'Instagram Post'
}

/**
 * Convert Instagram post timestamp to YYYY-MM-DD format
 */
function formatInstagramDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toISOString().split('T')[0]
}

/**
 * Process Instagram posts and map them to Event structure
 */
export function processInstagramPosts(posts: InstagramPost[]): ProcessedInstagramPost[] {
  return posts.map((post) => ({
    ...post,
    title: extractTitle(post.caption),
    date: formatInstagramDate(post.timestamp),
    description: post.caption || 'Instagram post',
    imageUrl: post.media_url,
  }))
}

/**
 * Fetch and process Instagram posts by hashtag
 */
export async function fetchInstagramPostsByHashtag(hashtag: string): Promise<ProcessedInstagramPost[]> {
  try {
    const hashtagId = await getHashtagId(hashtag)

    if (!hashtagId) {
      throw new Error(`Hashtag "${hashtag}" not found`)
    }

    const posts = await getRecentMediaByHashtag(hashtagId)
    const processedPosts = processInstagramPosts(posts)

    return processedPosts
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    throw error
  }
}
=======
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
>>>>>>> e0a5819471b71fea4a8fe0f9cd73a7d62950d7ce

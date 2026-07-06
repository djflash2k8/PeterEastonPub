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

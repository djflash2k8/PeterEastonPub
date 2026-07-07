<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { fetchInstagramPostsByHashtag } from '@/lib/instagram'

export const dynamic = 'force-dynamic'

/**
 * POST /api/instagram-sync
 * Fetches Instagram posts by hashtag and returns them in a format ready to be converted to events
 * Requires admin authentication via JWT token
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { hashtag } = body

    if (!hashtag || typeof hashtag !== 'string') {
      return NextResponse.json(
        { error: 'Hashtag is required and must be a string' },
        { status: 400 }
      )
    }

    // 3. Validate Instagram credentials are configured
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      console.error('Instagram API credentials not configured')
      return NextResponse.json(
        { error: 'Instagram integration is not configured on the server' },
        { status: 500 }
      )
    }

    // 4. Fetch Instagram posts
    const posts = await fetchInstagramPostsByHashtag(hashtag)

    // 5. Return processed posts
    return NextResponse.json(
      {
        success: true,
        hashtag,
        count: posts.length,
        posts,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Instagram sync error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    // Handle specific error cases
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: `Hashtag not found or has no recent posts` },
        { status: 404 }
      )
    }

    if (errorMessage.includes('credentials')) {
      return NextResponse.json(
        { error: 'Instagram API credentials are not properly configured' },
        { status: 500 }
      )
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'Instagram API rate limit reached. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: `Failed to fetch Instagram posts: ${errorMessage}` },
      { status: 500 }
    )
  }
}
=======
import { NextResponse } from 'next/server'
import { readInstagramSettings, syncInstagramByHashtag } from '@/lib/instagram'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const settings = readInstagramSettings()
    const hashtag = typeof body.hashtag === 'string' && body.hashtag.trim().length > 0
      ? body.hashtag
      : settings.defaultHashtag

    const syncResult = await syncInstagramByHashtag(hashtag, settings)

    return NextResponse.json({
      ...syncResult,
      settings
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to sync Instagram posts' },
      { status: 500 }
    )
  }
}
>>>>>>> e0a5819471b71fea4a8fe0f9cd73a7d62950d7ce

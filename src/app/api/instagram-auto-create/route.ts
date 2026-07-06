import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getInstagramCredentials, getAutoCreationSettings, getDefaultHashtag } from '@/lib/settings'
import { fetchInstagramPostsByHashtag } from '@/lib/instagram'
import { setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/instagram-auto-create
 * Automatically fetch Instagram posts and create events based on settings
 * Can be triggered manually or by scheduled tasks
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

    // 2. Get settings
    const instagramCreds = await getInstagramCredentials()
    const autoCreationSettings = await getAutoCreationSettings()
    const defaultHashtag = await getDefaultHashtag()

    // 3. Validate settings
    if (!instagramCreds?.accessToken || !instagramCreds?.businessAccountId) {
      return NextResponse.json(
        { error: 'Instagram credentials not configured in settings' },
        { status: 400 }
      )
    }

    if (!autoCreationSettings?.enabled) {
      return NextResponse.json(
        { error: 'Auto-creation is not enabled in settings' },
        { status: 400 }
      )
    }

    // 4. Parse request body (optional hashtag override)
    let hashtag = defaultHashtag
    try {
      const body = await request.json()
      if (body.hashtag) {
        hashtag = body.hashtag
      }
    } catch {
      // If no body, use default hashtag
    }

    // 5. Fetch Instagram posts
    const instagramPosts = await fetchInstagramPostsByHashtag(hashtag)

    if (instagramPosts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No new Instagram posts found',
          createdCount: 0,
          posts: [],
        },
        { status: 200 }
      )
    }

    // 6. Create events from Instagram posts
    const createdEvents = []
    const failedPosts = []

    for (const post of instagramPosts) {
      try {
        const eventId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

        const newEvent = {
          id: eventId,
          title: post.title,
          date: post.date,
          startTime: autoCreationSettings.defaultStartTime || '19:00',
          endTime: autoCreationSettings.defaultEndTime || '23:00',
          description: post.description,
          imageUrl: post.imageUrl,
          isRecurring: autoCreationSettings.markAsRecurring || false,
          archived: autoCreationSettings.markAsArchived || false,
          instagramPostId: post.id,
          instagramPermalink: post.permalink,
          createdFromInstagram: true,
          createdAt: serverTimestamp(),
        }

        // Save to Firebase
        await setDocumentInFirebase('events', eventId, newEvent)
        createdEvents.push(newEvent)
      } catch (error) {
        console.error(`Failed to create event from Instagram post ${post.id}:`, error)
        failedPosts.push({
          instagramPostId: post.id,
          title: post.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // 7. Update last sync date in settings
    try {
      const settingsCollection = await import('@/lib/firebase').then((m) =>
        m.queryCollectionFromFirebase('settings')
      )
      if (settingsCollection.length > 0) {
        const currentSettings = settingsCollection[0]
        await setDocumentInFirebase('settings', currentSettings.id, {
          ...currentSettings,
          sync: {
            ...currentSettings.sync,
            lastSyncDate: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      console.error('Failed to update last sync date:', error)
    }

    return NextResponse.json(
      {
        success: true,
        message: `Auto-created ${createdEvents.length} event(s) from Instagram posts`,
        hashtag,
        createdCount: createdEvents.length,
        failedCount: failedPosts.length,
        events: createdEvents,
        failed: failedPosts.length > 0 ? failedPosts : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auto-create error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

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

    return NextResponse.json(
      { error: `Failed to auto-create events: ${errorMessage}` },
      { status: 500 }
    )
  }
}

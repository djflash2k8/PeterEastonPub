import { NextRequest, NextResponse } from 'next/server'
import { getInstagramCredentials, getAutoCreationSettings, getDefaultHashtag } from '@/lib/settings'
import { fetchInstagramPostsByHashtag } from '@/lib/instagram'
import { setDocumentInFirebase, serverTimestamp, queryCollectionFromFirebase } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/instagram-sync
 * Scheduled CRON endpoint for automatic Instagram post fetching
 * 
 * Vercel CRON Configuration (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/instagram-sync",
 *     "schedule": "0 0 * * *"  // Daily at midnight UTC
 *   }]
 * }
 * 
 * Vercel will send a request with header: Authorization: Bearer <CRON_SECRET>
 * The secret should be set in Vercel environment variables as CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify CRON request (optional but recommended)
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[CRON] Starting Instagram sync...')

    // 2. Get settings
    const autoCreationSettings = await getAutoCreationSettings()

    // Check if auto-creation is enabled
    if (!autoCreationSettings?.enabled) {
      console.log('[CRON] Auto-creation is disabled, skipping sync')
      return NextResponse.json(
        {
          success: true,
          message: 'Auto-creation is disabled',
          skipped: true,
        },
        { status: 200 }
      )
    }

    // 3. Get credentials and hashtag
    const instagramCreds = await getInstagramCredentials()
    const defaultHashtag = await getDefaultHashtag()

    if (!instagramCreds?.accessToken || !instagramCreds?.businessAccountId) {
      console.log('[CRON] Instagram credentials not configured')
      return NextResponse.json(
        {
          success: false,
          error: 'Instagram credentials not configured',
        },
        { status: 400 }
      )
    }

    // 4. Fetch Instagram posts
    console.log(`[CRON] Fetching posts for hashtag: ${defaultHashtag}`)
    const instagramPosts = await fetchInstagramPostsByHashtag(defaultHashtag)

    if (instagramPosts.length === 0) {
      console.log('[CRON] No new Instagram posts found')
      return NextResponse.json(
        {
          success: true,
          message: 'No new Instagram posts found',
          createdCount: 0,
        },
        { status: 200 }
      )
    }

    console.log(`[CRON] Found ${instagramPosts.length} posts, creating events...`)

    // 5. Create events from Instagram posts
    const createdEvents = []
    const failedPosts = []

    for (const post of instagramPosts) {
      try {
        // Check if event already exists with this Instagram post ID
        const existingEvents = await queryCollectionFromFirebase('events')
        const alreadyExists = existingEvents.some((e: any) => e.instagramPostId === post.id)

        if (alreadyExists) {
          console.log(`[CRON] Event already exists for Instagram post ${post.id}, skipping`)
          continue
        }

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
        console.log(`[CRON] Created event: ${newEvent.title}`)
      } catch (error) {
        console.error(`[CRON] Failed to create event from Instagram post ${post.id}:`, error)
        failedPosts.push({
          instagramPostId: post.id,
          title: post.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // 6. Update last sync date in settings
    try {
      const settings = await queryCollectionFromFirebase('settings')
      if (settings.length > 0) {
        const currentSettings = settings[0]
        await setDocumentInFirebase('settings', currentSettings.id, {
          ...currentSettings,
          sync: {
            ...currentSettings.sync,
            lastSyncDate: new Date().toISOString(),
          },
        })
        console.log('[CRON] Updated last sync date')
      }
    } catch (error) {
      console.error('[CRON] Failed to update last sync date:', error)
    }

    const message = `Auto-created ${createdEvents.length} event(s) from Instagram posts`
    console.log(`[CRON] ${message}`)

    return NextResponse.json(
      {
        success: true,
        message,
        createdCount: createdEvents.length,
        failedCount: failedPosts.length,
        events: createdEvents,
        failed: failedPosts.length > 0 ? failedPosts : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[CRON] Unexpected error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: `CRON sync failed: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}

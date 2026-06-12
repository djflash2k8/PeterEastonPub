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
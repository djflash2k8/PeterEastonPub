import { NextResponse } from 'next/server'
import { readInstagramSettings, syncInstagramByHashtag } from '@/lib/instagram'

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET || ''
  if (!secret) {
    return request.headers.get('x-vercel-cron') === '1'
  }

  const url = new URL(request.url)
  const token = url.searchParams.get('secret') || request.headers.get('x-cron-secret') || ''
  return token === secret || request.headers.get('x-vercel-cron') === '1'
}

async function runScheduledSync(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = readInstagramSettings()
  const hashtag = settings.defaultHashtag

  try {
    const result = await syncInstagramByHashtag(hashtag, settings, true)

    return NextResponse.json({
      ok: true,
      triggeredAt: new Date().toISOString(),
      ...result
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        triggeredAt: new Date().toISOString(),
        error: error?.message || 'Scheduled Instagram sync failed'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  return runScheduledSync(request)
}

export async function POST(request: Request) {
  return runScheduledSync(request)
}
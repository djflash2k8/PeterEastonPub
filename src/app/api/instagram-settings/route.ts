import { NextResponse } from 'next/server'
import { defaultInstagramSettings, readInstagramSettings, writeInstagramSettings, type InstagramSettings } from '@/lib/instagram'

function isAutoCreateMode(value: unknown): value is InstagramSettings['autoCreateMode'] {
  return value === 'off' || value === 'review' || value === 'auto'
}

export async function GET() {
  return NextResponse.json(readInstagramSettings())
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const nextSettings: InstagramSettings = {
      ...defaultInstagramSettings,
      ...readInstagramSettings(),
      enabled: Boolean(body.enabled),
      sourceAccountUrl: typeof body.sourceAccountUrl === 'string' ? body.sourceAccountUrl : defaultInstagramSettings.sourceAccountUrl,
      defaultHashtag: typeof body.defaultHashtag === 'string' ? body.defaultHashtag : defaultInstagramSettings.defaultHashtag,
      autoCreateMode: isAutoCreateMode(body.autoCreateMode) ? body.autoCreateMode : defaultInstagramSettings.autoCreateMode,
      reviewBeforePublish: Boolean(body.reviewBeforePublish),
      showSourceAttribution: Boolean(body.showSourceAttribution),
      defaultStartTime: typeof body.defaultStartTime === 'string' ? body.defaultStartTime : defaultInstagramSettings.defaultStartTime,
      defaultEndTime: typeof body.defaultEndTime === 'string' ? body.defaultEndTime : defaultInstagramSettings.defaultEndTime,
      duplicateWindowDays: Number.isFinite(Number(body.duplicateWindowDays)) ? Number(body.duplicateWindowDays) : defaultInstagramSettings.duplicateWindowDays,
      instagramAccessToken: typeof body.instagramAccessToken === 'string' ? body.instagramAccessToken : defaultInstagramSettings.instagramAccessToken,
      instagramBusinessAccountId: typeof body.instagramBusinessAccountId === 'string' ? body.instagramBusinessAccountId : defaultInstagramSettings.instagramBusinessAccountId,
      notes: typeof body.notes === 'string' ? body.notes : defaultInstagramSettings.notes
    }

    writeInstagramSettings(nextSettings)
    return NextResponse.json({ message: 'Instagram settings updated successfully', settings: nextSettings })
  } catch {
    return NextResponse.json({ error: 'Failed to update Instagram settings' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { readInstagramSettings } from '@/lib/instagram'

export async function GET() {
  const settings = readInstagramSettings()

  return NextResponse.json({
    enabled: settings.enabled,
    sourceAccountUrl: settings.sourceAccountUrl,
    defaultHashtag: settings.defaultHashtag,
    showSourceAttribution: settings.showSourceAttribution
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { queryCollectionFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

/**
 * Default settings structure
 */
const DEFAULT_SETTINGS = {
  admin: {
    username: 'admin',
    password: '', // Should be set via environment variable initially
  },
  instagram: {
    accessToken: '',
    businessAccountId: '',
    defaultHashtag: 'petereastonpub',
  },
  autoCreation: {
    enabled: false,
    autoApprove: false,
    defaultStartTime: '19:00',
    defaultEndTime: '23:00',
    markAsRecurring: false,
    markAsArchived: false,
  },
  sync: {
    lastSyncDate: null,
    syncFrequency: 'manual', // 'manual', 'daily', 'weekly'
  },
}

/**
 * GET /api/settings
 * Retrieve current settings (public read for non-sensitive data)
 */
export async function GET() {
  try {
    const settings = await queryCollectionFromFirebase('settings')
    
    if (settings.length === 0) {
      return NextResponse.json(DEFAULT_SETTINGS, { status: 200 })
    }

    // Return the first (and should be only) settings document
    const currentSettings = settings[0]
    
    // Don't expose sensitive credentials to the client
    const safeSettings = {
      ...currentSettings,
      admin: {
        ...currentSettings.admin,
        password: currentSettings.admin?.password ? '***REDACTED***' : '',
      },
      instagram: {
        ...currentSettings.instagram,
        accessToken: currentSettings.instagram?.accessToken ? '***REDACTED***' : '',
        businessAccountId: currentSettings.instagram?.businessAccountId || '',
      },
    }

    return NextResponse.json(safeSettings, { status: 200 })
  } catch (error) {
    console.error('Error reading settings:', error)
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 })
  }
}

/**
 * POST /api/settings
 * Update settings (admin only)
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

    // 3. Fetch current settings
    const existingSettings = await queryCollectionFromFirebase('settings')
    const currentSettings = existingSettings.length > 0 ? existingSettings[0] : { id: 'default' }

    // 4. Merge new settings with existing ones
    const updatedSettings = {
      id: currentSettings.id || 'default',
      admin: {
        ...currentSettings.admin,
        ...body.admin,
      },
      instagram: {
        ...currentSettings.instagram,
        ...body.instagram,
      },
      autoCreation: {
        ...currentSettings.autoCreation,
        ...body.autoCreation,
      },
      sync: {
        ...currentSettings.sync,
        ...body.sync,
      },
      updatedAt: serverTimestamp(),
    }

    // 5. Save to Firebase
    await setDocumentInFirebase('settings', updatedSettings.id, updatedSettings)

    // 6. Return updated settings (with redacted credentials)
    const safeSettings = {
      ...updatedSettings,
      admin: {
        ...updatedSettings.admin,
        password: updatedSettings.admin?.password ? '***REDACTED***' : '',
      },
      instagram: {
        ...updatedSettings.instagram,
        accessToken: updatedSettings.instagram?.accessToken ? '***REDACTED***' : '',
      },
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Settings updated successfully',
        settings: safeSettings,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating settings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to update settings: ${errorMessage}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/settings/credentials
 * Retrieve full credentials (admin only, server-side use)
 * This endpoint should only be called from server-side code
 */
export async function GET_CREDENTIALS() {
  try {
    const settings = await queryCollectionFromFirebase('settings')
    
    if (settings.length === 0) {
      return null
    }

    return settings[0].instagram || null
  } catch (error) {
    console.error('Error reading credentials:', error)
    return null
  }
}

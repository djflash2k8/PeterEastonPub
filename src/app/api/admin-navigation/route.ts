import { NextRequest, NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'
import { verifyToken } from '@/lib/auth'

const COLLECTION = 'site-config'
const DOC_ID = 'admin-navigation'

const DEFAULT_NAVIGATION = {
  adminTitle: "Peter Easton Admin",
  navigationItems: [
    { id: 'dashboard', text: 'Dashboard', href: '/admin',       target: '_self' },
    { id: 'about',     text: 'About Us',  href: '/admin/about', target: '_self' },
    { id: 'viewSite',  text: 'View Site', href: '/',            target: '_blank' },
  ],
}

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function GET() {
  try {
    const data = await getDocumentFromFirebase(COLLECTION, DOC_ID)
    return NextResponse.json(data ?? DEFAULT_NAVIGATION)
  } catch {
    return NextResponse.json(DEFAULT_NAVIGATION)
  }
}

export async function PUT(request: NextRequest) {
  const token = getAuthToken(request)
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  try {
    const data = await request.json()
    await setDocumentInFirebase(COLLECTION, DOC_ID, { ...data, updatedAt: new Date().toISOString() })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update navigation.' }, { status: 500 })
  }
}

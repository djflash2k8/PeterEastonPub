import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { queryCollectionFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/galleries
 * Retrieve galleries (published only for frontend, all for admin)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const isAdmin = authHeader?.startsWith('Bearer ') && verifyToken(authHeader.split(' ')[1])

    const galleries = await queryCollectionFromFirebase('galleries')

    // Filter for published galleries if not admin
    const filtered = isAdmin ? galleries : galleries.filter((g: any) => g.published === true)

    return NextResponse.json(filtered, { status: 200 })
  } catch (error) {
    console.error('Error fetching galleries:', error)
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
  }
}

/**
 * POST /api/galleries
 * Create a new gallery (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (!verifyToken(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    // Create gallery document
    const galleryId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newGallery = {
      id: galleryId,
      title: body.title,
      description: body.description,
      slug,
      published: body.published ?? false,
      autoScroll: body.autoScroll ?? true,
      images: body.images ?? [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDocumentInFirebase('galleries', galleryId, newGallery)

    return NextResponse.json(newGallery, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery:', error)
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { queryCollectionFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/galleries/[id]
 * Retrieve a single gallery by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const isAdmin = authHeader?.startsWith('Bearer ') && verifyToken(authHeader.split(' ')[1])

    const galleries = await queryCollectionFromFirebase('galleries')
    
    // Find gallery by ID or slug
    let gallery = galleries.find((g: any) => g.id === params.id || g.slug === params.id)

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Check if published (if not admin)
    if (!isAdmin && !gallery.published) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    return NextResponse.json(gallery, { status: 200 })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}

/**
 * PUT /api/galleries/[id]
 * Update a gallery (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const galleries = await queryCollectionFromFirebase('galleries')
    const gallery = galleries.find((g: any) => g.id === params.id)

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Update gallery
    const updatedGallery = {
      ...gallery,
      ...body,
      id: gallery.id, // Prevent ID changes
      slug: body.title ? body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') : gallery.slug,
      createdAt: gallery.createdAt, // Prevent timestamp changes
      updatedAt: serverTimestamp(),
    }

    await setDocumentInFirebase('galleries', gallery.id, updatedGallery)

    return NextResponse.json(updatedGallery, { status: 200 })
  } catch (error) {
    console.error('Error updating gallery:', error)
    return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 })
  }
}

/**
 * DELETE /api/galleries/[id]
 * Delete a gallery (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const galleries = await queryCollectionFromFirebase('galleries')
    const gallery = galleries.find((g: any) => g.id === params.id)

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Delete gallery from Firestore
    const { deleteDocumentFromFirebase } = await import('@/lib/firebase')
    await deleteDocumentFromFirebase('galleries', gallery.id)

    return NextResponse.json(
      { success: true, message: 'Gallery deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting gallery:', error)
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 })
  }
}

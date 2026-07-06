import { NextRequest, NextResponse } from 'next/server'
import { queryCollectionFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const media = await queryCollectionFromFirebase('media')
    // Sort by createdAt descending
    media.sort((a: any, b: any) => {
      const dateA = a.createdAt?.seconds || 0
      const dateB = b.createdAt?.seconds || 0
      return dateB - dateA
    })
    
    return NextResponse.json(media)
  } catch (error) {
    console.error('Error loading media:', error)
    return NextResponse.json({ error: 'Failed to read media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'general'

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadResult = await uploadImageToCloudinary(file, folder)
    
    if (uploadResult.success) {
      const mediaId = Date.now().toString()
      const mediaItem = {
        id: mediaId,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        name: file.name,
        type: file.type,
        size: file.size,
        folder,
        createdAt: serverTimestamp()
      }

      await setDocumentInFirebase('media', mediaId, mediaItem)
      return NextResponse.json(mediaItem, { status: 201 })
    } else {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Media Upload Error:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}

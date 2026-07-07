import { NextRequest, NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'

const COLLECTION = 'site-config'
const DOC_ID = 'banner'

const defaultBanner = { url: 'https://res.cloudinary.com/dci3a6zp4/image/upload/v1717765442/banners/banner01.jpg' }

export async function GET() {
  try {
    const data = await getDocumentFromFirebase(COLLECTION, DOC_ID)
    return NextResponse.json(data ?? defaultBanner)
  } catch (error) {
    return NextResponse.json(defaultBanner)
  }
}

export async function PUT(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const imageUrl = formData.get('imageUrl') as string | null

    let finalUrl = imageUrl || ''

    // 2. Handle File Upload to Cloudinary
    if (file && file.size > 0) {
      const uploadResult = await uploadImageToCloudinary(file, 'banners')
      
      if (uploadResult.success) {
        finalUrl = uploadResult.url || ''

        // 3. Save to Media Library as well
        const mediaId = Date.now().toString()
        await setDocumentInFirebase('media', mediaId, {
          id: mediaId,
          url: finalUrl,
          publicId: uploadResult.publicId,
          name: file.name,
          type: file.type,
          size: file.size,
          folder: 'banners',
          createdAt: serverTimestamp()
        })
      } else {
        console.error('Cloudinary upload failed:', uploadResult.error)
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
      }
    }

    if (!finalUrl) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const banner = { 
      url: finalUrl, 
      updatedAt: serverTimestamp() 
    }

    await setDocumentInFirebase(COLLECTION, DOC_ID, banner)
    return NextResponse.json({ message: 'Banner updated successfully', banner })
  } catch (error) {
    console.error('Banner update error:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}

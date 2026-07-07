import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

const COLLECTION = 'site-config'
const DOC_ID = 'contact'

const defaultContact = {
  address: {
    street: '29 Cookstown Rd',
    city: "St. John's",
    province: 'NL',
    postal: 'A1C 4G7',
    country: 'Canada',
  },
  phone: '(709) 579-5566',
  email: 'petereastonspub@gmail.com',
  socialMedia: {
    facebook: 'https://www.facebook.com/PeterEastonPub',
    instagram: 'https://www.instagram.com/petereastonpub/',
    snapchat: '',
    x: '',
  },
}

export async function GET() {
  try {
    const data = await getDocumentFromFirebase(COLLECTION, DOC_ID)
    return NextResponse.json(data ?? defaultContact)
  } catch (error) {
    return NextResponse.json(defaultContact)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.address || !body.phone || !body.email || !body.socialMedia) {
      return NextResponse.json({ error: 'Invalid contact data structure' }, { status: 400 })
    }

    const socialPlatforms = ['facebook', 'instagram', 'snapchat', 'x']
    for (const platform of socialPlatforms) {
      if (typeof body.socialMedia[platform] !== 'string') {
        return NextResponse.json(
          { error: `Invalid social media data for ${platform}` },
          { status: 400 }
        )
      }
    }

    await setDocumentInFirebase(COLLECTION, DOC_ID, body)
    return NextResponse.json({ message: 'Contact information updated successfully', contact: body })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contact information' }, { status: 500 })
  }
}

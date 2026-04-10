import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const contactFile = path.join(process.cwd(), 'src/lib/contact.json')

// Default contact data structure
const defaultContact = {
  address: {
    street: '29 Cookstown Rd',
    city: 'St. John\'s',
    province: 'NL',
    postal: 'A1C 4G7',
    country: 'Canada'
  },
  phone: '(709) 579-5566',
  email: 'petereastonspub@gmail.com',
  socialMedia: {
    facebook: '',
    instagram: '',
    snapchat: '',
    x: ''
  }
}

// Ensure contact file exists
if (!fs.existsSync(contactFile)) {
  fs.writeFileSync(contactFile, JSON.stringify(defaultContact, null, 2))
}

export async function GET() {
  try {
    const data = fs.readFileSync(contactFile, 'utf8')
    const contact = JSON.parse(data)
    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json(defaultContact)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the structure
    if (!body.address || !body.phone || !body.email || !body.socialMedia) {
      return NextResponse.json({ error: 'Invalid contact data structure' }, { status: 400 })
    }

    // Validate social media structure
    const socialPlatforms = ['facebook', 'instagram', 'snapchat', 'x']
    for (const platform of socialPlatforms) {
      if (typeof body.socialMedia[platform] !== 'string') {
        return NextResponse.json({ error: `Invalid social media data for ${platform}` }, { status: 400 })
      }
    }
    
    fs.writeFileSync(contactFile, JSON.stringify(body, null, 2))
    return NextResponse.json({ message: 'Contact information updated successfully', contact: body })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contact information' }, { status: 500 })
  }
}

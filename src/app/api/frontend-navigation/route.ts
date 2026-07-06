import { NextRequest, NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

const COLLECTION = 'site-config'
const DOC_ID = 'frontend-navigation'

const defaultNavigation = {
  brandName: "Peter Easton's Pub",
  navigationItems: [
    { id: 'home',    text: 'Home',       href: '/',          target: '_self' },
    { id: 'events',  text: 'Events',     href: '/events',    target: '_self' },
    { id: 'about',   text: 'About Us',   href: '/about-us',  target: '_self' },
    { id: 'contact', text: 'Contact Us', href: '/contact-us', target: '_self' },
  ],
}

export async function GET() {
  try {
    const data = await getDocumentFromFirebase(COLLECTION, DOC_ID)
    return NextResponse.json(data ?? defaultNavigation)
  } catch (error) {
    console.error('Error fetching frontend navigation:', error)
    return NextResponse.json(defaultNavigation)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    await setDocumentInFirebase(COLLECTION, DOC_ID, data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating frontend navigation:', error)
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 })
  }
}
